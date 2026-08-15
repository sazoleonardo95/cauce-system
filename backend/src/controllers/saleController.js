const prisma = require('../config/database');
const { generateSaleNumber, calculatePagination } = require('../utils/helpers');

const getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sellerId, status, startDate, endDate } = req.query;
    const companyId = req.user.companyId;

    const where = { companyId };
    if (sellerId) where.sellerId = sellerId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate + 'T23:59:59.000Z');
    }

    if (req.user.role === 'SELLER') {
      where.sellerId = req.user.id;
    }

    const total = await prisma.sale.count({ where });
    const { skip, take, totalPages } = calculatePagination(parseInt(page), parseInt(limit), total);

    const sales = await prisma.sale.findMany({
      where,
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { select: { name: true, sku: true } } },
        },
        commission: true,
      },
      skip,
      take,
      orderBy: { saleDate: 'desc' },
    });

    res.json({ sales, page: parseInt(page), totalPages, total });
  } catch (error) {
    next(error);
  }
};

const createSale = async (req, res, next) => {
  try {
    const { customerId, warehouseId, items, taxRate = 0, discount = 0, notes, paymentMethod } = req.body;
    const companyId = req.user.companyId;
    const sellerId = req.user.id;

    const saleNumber = generateSaleNumber(companyId);

    let subtotal = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, companyId },
      });
      if (!product) {
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }

      if (warehouseId) {
        const inventory = await prisma.inventoryItem.findUnique({
          where: { productId_warehouseId: { productId: item.productId, warehouseId } },
        });
        if (!inventory || inventory.quantity < item.quantity) {
          return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
        }
      }

      const itemTotal = (item.unitPrice * item.quantity) - item.discount;
      subtotal += itemTotal;
      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        total: itemTotal,
      });
    }

    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;

    const sale = await prisma.sale.create({
      data: {
        saleNumber,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        notes,
        paymentMethod,
        companyId,
        sellerId,
        customerId,
        warehouseId,
        items: { create: saleItems },
      },
      include: {
        items: { include: { product: { select: { name: true, sku: true } } } },
        seller: { select: { firstName: true, lastName: true } },
      },
    });

    if (warehouseId) {
      for (const item of items) {
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { productId_warehouseId: { productId: item.productId, warehouseId } },
        });

        if (inventoryItem) {
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity - item.quantity },
          });

          await prisma.stockMovement.create({
            data: {
              type: 'EXIT',
              quantity: item.quantity,
              reference: saleNumber,
              notes: `Venta ${saleNumber}`,
              productId: item.productId,
              warehouseId,
              createdById: sellerId,
            },
          });
        }
      }
    }

    res.status(201).json({ message: 'Venta registrada', sale });
  } catch (error) {
    next(error);
  }
};

const getSaleById = async (req, res, next) => {
  try {
    const sale = await prisma.sale.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: {
        seller: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
        commission: true,
      },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(sale);
  } catch (error) {
    next(error);
  }
};

const cancelSale = async (req, res, next) => {
  try {
    const sale = await prisma.sale.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: { items: true },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    if (sale.status === 'CANCELLED') {
      return res.status(400).json({ error: 'La venta ya esta cancelada' });
    }

    if (sale.warehouseId) {
      for (const item of sale.items) {
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { productId_warehouseId: { productId: item.productId, warehouseId: sale.warehouseId } },
        });

        if (inventoryItem) {
          await prisma.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: { quantity: inventoryItem.quantity + item.quantity },
          });

          await prisma.stockMovement.create({
            data: {
              type: 'ENTRY',
              quantity: item.quantity,
              reference: `CANCEL-${sale.saleNumber}`,
              notes: `Devolucion por cancelacion ${sale.saleNumber}`,
              productId: item.productId,
              warehouseId: sale.warehouseId,
              createdById: req.user.id,
            },
          });
        }
      }
    }

    const updated = await prisma.sale.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ message: 'Venta cancelada', sale: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSales, createSale, getSaleById, cancelSale };
