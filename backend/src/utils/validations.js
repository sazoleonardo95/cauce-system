const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  firstName: z.string().min(2, 'Nombre requerido'),
  lastName: z.string().min(2, 'Apellido requerido'),
  phone: z.string().optional(),
  companyName: z.string().min(2, 'Nombre de empresa requerido').optional(),
  companySlug: z.string().min(2, 'Slug de empresa requerido').optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(1, 'Contrasena requerida'),
});

const inviteSchema = z.object({
  email: z.string().email('Email invalido'),
  role: z.enum(['ADMIN', 'MANAGER', 'SELLER', 'WAREHOUSE']),
});

const productSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  sku: z.string().min(1, 'SKU requerido'),
  barcode: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive('Precio debe ser positivo'),
  cost: z.number().positive().optional(),
  category: z.string().optional(),
  unit: z.string().default('unit'),
  minStock: z.number().int().min(0).default(0),
});

const warehouseSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  code: z.string().min(1, 'Codigo requerido'),
  address: z.string().optional(),
});

const customerSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

const saleItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).default(0),
});

const createSaleSchema = z.object({
  customerId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  items: z.array(saleItemSchema).min(1, 'Al menos un producto requerido'),
  taxRate: z.number().min(0).max(100).default(0),
  discount: z.number().min(0).default(0),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
});

const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  type: z.enum(['ENTRY', 'EXIT', 'TRANSFER', 'ADJUSTMENT']),
  quantity: z.number().int().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = {
  registerSchema,
  loginSchema,
  inviteSchema,
  productSchema,
  warehouseSchema,
  customerSchema,
  createSaleSchema,
  stockMovementSchema,
  paginationSchema,
};
