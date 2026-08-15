const prisma = require('../config/database');
const { calculatePagination } = require('../utils/helpers');

const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const companyId = req.user.companyId;

    const where = { companyId, isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const total = await prisma.customer.count({ where });
    const { skip, take, totalPages } = calculatePagination(parseInt(page), parseInt(limit), total);

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: { select: { sales: true } },
      },
      skip,
      take,
      orderBy: { name: 'asc' },
    });

    res.json({ customers, page: parseInt(page), totalPages, total });
  } catch (error) {
    next(error);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, taxId, notes } = req.body;
    const companyId = req.user.companyId;

    const customer = await prisma.customer.create({
      data: { name, email, phone, address, taxId, notes, companyId },
    });

    res.status(201).json({ message: 'Cliente creado', customer });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const updated = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ message: 'Cliente actualizado', customer: updated });
  } catch (error) {
    next(error);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await prisma.customer.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
