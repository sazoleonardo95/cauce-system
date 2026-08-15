const prisma = require('../config/database');
const { calculatePagination } = require('../utils/helpers');

const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const companyId = req.user.companyId;

    const where = { companyId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const total = await prisma.product.count({ where });
    const { skip, take, totalPages } = calculatePagination(parseInt(page), parseInt(limit), total);

    const products = await prisma.product.findMany({
      where,
      include: {
        inventoryItems: {
          select: { quantity: true, reservedQty: true, warehouse: { select: { name: true } } },
        },
      },
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    });

    const productsWithStock = products.map((p) => ({
      ...p,
      totalStock: p.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
      totalReserved: p.inventoryItems.reduce((sum, i) => sum + i.reservedQty, 0),
    }));

    res.json({ products: productsWithStock, page: parseInt(page), totalPages, total });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: {
        inventoryItems: {
          include: { warehouse: { select: { id: true, name: true, code: true } } },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, sku, barcode, description, price, cost, category, unit, minStock } = req.body;
    const companyId = req.user.companyId;

    const existingSku = await prisma.product.findFirst({
      where: { companyId, sku },
    });
    if (existingSku) {
      return res.status(409).json({ error: 'El SKU ya existe en tu empresa' });
    }

    const product = await prisma.product.create({
      data: { name, sku, barcode, description, price, cost, category, unit, minStock, companyId },
    });

    res.status(201).json({ message: 'Producto creado', product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ message: 'Producto actualizado', product: updated });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.product.findMany({
      where: { companyId: req.user.companyId, isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    res.json(categories.map((c) => c.category).filter(Boolean));
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCategories };
