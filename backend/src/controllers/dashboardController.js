const prisma = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const todayWhere = { companyId, saleDate: { gte: startOfDay }, status: { not: 'CANCELLED' } };
    const monthWhere = { companyId, saleDate: { gte: startOfMonth }, status: { not: 'CANCELLED' } };
    const weekWhere = { companyId, saleDate: { gte: startOfWeek }, status: { not: 'CANCELLED' } };

    const [
      todaySales,
      monthSales,
      weekSales,
      totalProducts,
      totalCustomers,
      totalSellers,
      lowStockItems,
      pendingCommissions,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: todayWhere,
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: monthWhere,
        _sum: { total: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: weekWhere,
        _sum: { total: true },
        _count: true,
      }),
      prisma.product.count({ where: { companyId, isActive: true } }),
      prisma.customer.count({ where: { companyId, isActive: true } }),
      prisma.user.count({ where: { companyId, isActive: true, role: { in: ['SELLER', 'MANAGER'] } } }),
      prisma.inventoryItem.findMany({
        where: {
          product: { companyId, isActive: true },
          warehouse: { companyId, isActive: true },
        },
        include: { product: { select: { minStock: true, name: true } } },
      }),
      prisma.commission.aggregate({
        where: { seller: { companyId }, isPaid: false },
        _sum: { amount: true },
      }),
    ]);

    const lowStock = lowStockItems.filter((i) => i.quantity <= i.product.minStock);

    const topSellers = await prisma.user.findMany({
      where: { companyId, isActive: true, role: { in: ['SELLER', 'MANAGER'] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        _count: { select: { sales: { where: { status: { not: 'CANCELLED' }, saleDate: { gte: startOfMonth } } } } },
      },
      orderBy: { sales: { _count: 'desc' } },
      take: 5,
    });

    const recentSales = await prisma.sale.findMany({
      where: { companyId, status: { not: 'CANCELLED' } },
      include: {
        seller: { select: { firstName: true, lastName: true } },
        customer: { select: { name: true } },
      },
      orderBy: { saleDate: 'desc' },
      take: 10,
    });

    const salesByDay = await prisma.sale.groupBy({
      by: ['saleDate'],
      where: monthWhere,
      _sum: { total: true },
      _count: true,
    });

    const dailyData = {};
    salesByDay.forEach((s) => {
      const day = s.saleDate.toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { date: day, total: 0, count: 0 };
      dailyData[day].total += s._sum.total;
      dailyData[day].count += s._count;
    });

    res.json({
      today: {
        sales: todaySales._sum.total || 0,
        count: todaySales._count,
      },
      week: {
        sales: weekSales._sum.total || 0,
        count: weekSales._count,
      },
      month: {
        sales: monthSales._sum.total || 0,
        count: monthSales._count,
      },
      totals: {
        products: totalProducts,
        customers: totalCustomers,
        sellers: totalSellers,
        lowStockCount: lowStock.length,
        pendingCommissions: pendingCommissions._sum.amount || 0,
      },
      topSellers,
      recentSales,
      salesByDay: Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date)),
      lowStockItems: lowStock.slice(0, 10).map((i) => ({
        productName: i.product.name,
        quantity: i.quantity,
        minStock: i.product.minStock,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getTeamPerformance = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    const dateWhere = {};
    if (startDate) dateWhere.gte = new Date(startDate);
    if (endDate) dateWhere.lte = new Date(endDate + 'T23:59:59.000Z');
    else {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      dateWhere.gte = startOfMonth;
    }

    const team = await prisma.user.findMany({
      where: { companyId, isActive: true, role: { in: ['SELLER', 'MANAGER'] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatar: true,
        sales: {
          where: { status: { not: 'CANCELLED' }, saleDate: dateWhere },
          select: { total: true, saleDate: true },
        },
      },
    });

    const performance = team.map((member) => {
      const totalSales = member.sales.reduce((sum, s) => sum + s.total, 0);
      const salesCount = member.sales.length;
      const avgSale = salesCount > 0 ? totalSales / salesCount : 0;

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        role: member.role,
        avatar: member.avatar,
        totalSales,
        salesCount,
        avgSale,
      };
    });

    performance.sort((a, b) => b.totalSales - a.totalSales);

    res.json(performance);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getTeamPerformance };
