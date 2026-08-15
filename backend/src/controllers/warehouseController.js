const prisma = require('../config/database');

const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: { companyId: req.user.companyId, isActive: true },
      include: {
        inventoryItems: {
          select: {
            quantity: true,
            reservedQty: true,
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const warehousesWithStats = warehouses.map((w) => ({
      ...w,
      totalProducts: w.inventoryItems.length,
      totalItems: w.inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
      lowStockItems: w.inventoryItems.filter((i) => i.quantity <= (i.product?.minStock || 0)).length,
    }));

    res.json(warehousesWithStats);
  } catch (error) {
    next(error);
  }
};

const createWarehouse = async (req, res, next) => {
  try {
    const { name, code, address } = req.body;
    const companyId = req.user.companyId;

    const existing = await prisma.warehouse.findFirst({
      where: { companyId, code },
    });
    if (existing) {
      return res.status(409).json({ error: 'El codigo de bodega ya existe' });
    }

    const warehouse = await prisma.warehouse.create({
      data: { name, code: code.toUpperCase(), address, companyId },
    });

    res.status(201).json({ message: 'Bodega creada', warehouse });
  } catch (error) {
    next(error);
  }
};

const updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!warehouse) {
      return res.status(404).json({ error: 'Bodega no encontrada' });
    }

    const updated = await prisma.warehouse.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ message: 'Bodega actualizada', warehouse: updated });
  } catch (error) {
    next(error);
  }
};

const deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!warehouse) {
      return res.status(404).json({ error: 'Bodega no encontrada' });
    }

    await prisma.warehouse.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Bodega eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };
