const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // Create admin user first (without company)
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: { password: adminPassword, role: 'ADMIN' },
    create: {
      email: 'admin@demo.com',
      password: adminPassword,
      firstName: 'Carlos',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log(`  Admin: ${admin.email}`);

  // Create demo company with admin as owner
  const company = await prisma.company.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo-store',
      ownerId: admin.id,
      address: 'Calle Principal 123',
      phone: '+1234567890',
      email: 'info@demostore.com',
    },
  });
  console.log(`  Company: ${company.name}`);

  // Update admin with companyId
  await prisma.user.update({
    where: { id: admin.id },
    data: { companyId: company.id },
  });

  // Create seller
  const sellerPassword = await bcrypt.hash('seller123', 12);
  const seller = await prisma.user.upsert({
    where: { email: 'seller@demo.com' },
    update: { password: sellerPassword, role: 'SELLER', managerId: admin.id },
    create: {
      email: 'seller@demo.com',
      password: sellerPassword,
      firstName: 'Maria',
      lastName: 'Vendedor',
      role: 'SELLER',
      companyId: company.id,
      managerId: admin.id,
    },
  });
  console.log(`  Seller: ${seller.email}`);

  // Create warehouse user
  const warehousePassword = await bcrypt.hash('warehouse123', 12);
  const warehouseUser = await prisma.user.upsert({
    where: { email: 'bodega@demo.com' },
    update: { password: warehousePassword, role: 'WAREHOUSE' },
    create: {
      email: 'bodega@demo.com',
      password: warehousePassword,
      firstName: 'Juan',
      lastName: 'Bodega',
      role: 'WAREHOUSE',
      companyId: company.id,
    },
  });
  console.log(`  Warehouse: ${warehouseUser.email}`);

  // Create warehouses
  const wh1 = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: 'MAIN' } },
    update: {},
    create: { name: 'Bodega Principal', code: 'MAIN', companyId: company.id, address: 'Av. Central 456' },
  });

  const wh2 = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: 'SEC' } },
    update: {},
    create: { name: 'Bodega Secundaria', code: 'SEC', companyId: company.id, address: 'Calle Norte 789' },
  });
  console.log(`  Warehouses: ${wh1.name}, ${wh2.name}`);

  // Create products
  const productsData = [
    { name: 'Laptop HP 15"', sku: 'LAP-HP-001', price: 899.99, cost: 650.00, category: 'Electronica', minStock: 5 },
    { name: 'Mouse Logitech MX', sku: 'MOU-LOG-001', price: 79.99, cost: 45.00, category: 'Accesorios', minStock: 20 },
    { name: 'Teclado Mecanico RGB', sku: 'KEY-RGB-001', price: 129.99, cost: 70.00, category: 'Accesorios', minStock: 15 },
    { name: 'Monitor Samsung 27"', sku: 'MON-SAM-001', price: 349.99, cost: 220.00, category: 'Electronica', minStock: 8 },
    { name: 'Audifonos Sony WH-1000', sku: 'AUD-SON-001', price: 299.99, cost: 180.00, category: 'Audio', minStock: 10 },
    { name: 'Webcam Logitech C920', sku: 'CAM-LOG-001', price: 69.99, cost: 35.00, category: 'Accesorios', minStock: 25 },
    { name: 'Disco SSD 1TB Samsung', sku: 'SSD-SAM-001', price: 109.99, cost: 65.00, category: 'Almacenamiento', minStock: 12 },
    { name: 'RAM DDR5 16GB Corsair', sku: 'RAM-COR-001', price: 89.99, cost: 55.00, category: 'Componentes', minStock: 15 },
    { name: 'Impresora Canon G3110', sku: 'IMP-CAN-001', price: 199.99, cost: 120.00, category: 'Impresion', minStock: 6 },
    { name: 'Tablet Samsung Tab A8', sku: 'TAB-SAM-001', price: 229.99, cost: 150.00, category: 'Electronica', minStock: 8 },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { companyId_sku: { companyId: company.id, sku: p.sku } },
      update: {},
      create: { ...p, companyId: company.id },
    });
    products.push(product);

    // Add stock to both warehouses
    await prisma.inventoryItem.upsert({
      where: { productId_warehouseId: { productId: product.id, warehouseId: wh1.id } },
      update: {},
      create: { productId: product.id, warehouseId: wh1.id, quantity: Math.floor(Math.random() * 50) + 10 },
    });
    await prisma.inventoryItem.upsert({
      where: { productId_warehouseId: { productId: product.id, warehouseId: wh2.id } },
      update: {},
      create: { productId: product.id, warehouseId: wh2.id, quantity: Math.floor(Math.random() * 30) + 5 },
    });
  }
  console.log(`  Products: ${products.length}`);

  // Create customers
  const customersData = [
    { name: 'Tech Solutions SA', email: 'contacto@techsolutions.com', phone: '+1111111111' },
    { name: 'Distribuidora Norte', email: 'ventas@norte.com', phone: '+2222222222' },
    { name: 'Comercial El Sol', email: 'info@elsol.com', phone: '+3333333333' },
    { name: 'Mayorista Sur', email: 'pedidos@sur.com', phone: '+4444444444' },
    { name: 'Tienda Online Express', email: 'admin@express.com', phone: '+5555555555' },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: { ...c, companyId: company.id },
    });
    customers.push(customer);
  }
  console.log(`  Customers: ${customers.length}`);

  // Create sample sales
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'PENDING'];
  for (let i = 0; i < 15; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const qty = Math.floor(Math.random() * 5) + 1;
    const subtotal = product.price * qty;
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    const daysAgo = Math.floor(Math.random() * 30);
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - daysAgo);

    await prisma.sale.create({
      data: {
        saleNumber: `SALE-DEMO-${String(i + 1).padStart(3, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        subtotal,
        taxRate: 16,
        taxAmount: tax,
        total,
        saleDate,
        companyId: company.id,
        sellerId: seller.id,
        customerId: customer.id,
        warehouseId: wh1.id,
        items: {
          create: [{
            productId: product.id,
            quantity: qty,
            unitPrice: product.price,
            total: subtotal,
          }],
        },
      },
    });
  }
  console.log('  Sales: 15');

  console.log('\n  Demo credentials:');
  console.log('  Admin:   admin@demo.com / admin123');
  console.log('  Seller:  seller@demo.com / seller123');
  console.log('  Warehouse: bodega@demo.com / warehouse123\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
