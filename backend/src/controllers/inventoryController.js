const prisma = require('../config/database');

const getInventory = async (req, res, next) => {
  try {
    const { warehouseId, lowStock } = req.query;
    const companyId = req.user.companyId;

    const where = {
      product: { companyId, isActive: true },
      warehouse: { companyId, isActive: true },
    };

    if (warehouseId) where.warehouseId = warehouseId;

    let items = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true, category: true, minStock: true, price: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
      orderBy: { product: { name: 'asc' } },
    });

    if (lowStock === 'true') {
      items = items.filter((i) => i.quantity <= i.product.minStock);
    }

    res.json(items);
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const { productId, warehouseId, type, quantity, reference, notes } = req.body;
    const companyId = req.user.companyId;
    const createdById = req.user.id;

    const product = await prisma.product.findFirst({
      where: { id: productId, companyId },
    });
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, companyId },
    });
    if (!warehouse) {
      return res.status(404).json({ error: 'Bodega no encontrada' });
    }

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    let newQuantity;
    if (type === 'ENTRY') {
      newQuantity = (inventoryItem?.quantity || 0) + quantity;
    } else if (type === 'EXIT') {
      if (!inventoryItem || inventoryItem.quantity < quantity) {
        return res.status(400).json({ error: 'Stock insuficiente' });
      }
      newQuantity = inventoryItem.quantity - quantity;
    } else if (type === 'ADJUSTMENT') {
      newQuantity = quantity;
    } else {
      newQuantity = (inventoryItem?.quantity || 0) + quantity;
    }

    await prisma.inventoryItem.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      update: { quantity: newQuantity },
      create: { productId, warehouseId, quantity: newQuantity },
    });

    const movement = await prisma.stockMovement.create({
      data: { type, quantity, reference, notes, productId, warehouseId, createdById },
    });

    if (newQuantity <= product.minStock && product.minStock > 0) {
      await prisma.notification.create({
        data: {
          title: 'Stock bajo',
          message: `El producto ${product.name} tiene ${newQuantity} unidades en ${warehouse.name}`,
          type: 'LOW_STOCK',
          userId: createdById,
        },
      });
    }

    res.status(201).json({ message: 'Stock ajustado', movement, newQuantity });
  } catch (error) {
    next(error);
  }
};

const getStockMovements = async (req, res, next) => {
  try {
    const { productId, warehouseId, type, page = 1, limit = 50 } = req.query;
    const companyId = req.user.companyId;

    const where = {
      product: { companyId },
      warehouse: { companyId },
    };

    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (type) where.type = type;

    const total = await prisma.stockMovement.count({ where });
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true, code: true } },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.json({ movements, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getInventory, adjustStock, getStockMovements };
