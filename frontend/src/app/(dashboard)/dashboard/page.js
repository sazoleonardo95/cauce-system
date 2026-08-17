'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const role = stats.role;
  const statusLabel = (status) => {
    switch (status) {
      case 'COMPLETED': return 'Completada';
      case 'CANCELLED': return 'Cancelada';
      case 'PENDING': return 'Pendiente';
      default: return status;
    }
  };

  const renderAdminManager = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Ventas Hoy', value: formatCurrency(stats.today.sales), subtitle: `${stats.today.count} transacciones`, gradient: 'from-blue-500 to-blue-600' },
          { title: 'Ventas del Mes', value: formatCurrency(stats.month.sales), subtitle: `${stats.month.count} transacciones`, gradient: 'from-emerald-500 to-emerald-600' },
          { title: 'Productos', value: stats.totals.products, subtitle: `${stats.totals.lowStockCount} con stock bajo`, gradient: 'from-amber-500 to-orange-500' },
          { title: 'Vendedores', value: stats.totals.sellers, subtitle: `${stats.totals.customers} clientes`, gradient: 'from-purple-500 to-violet-500' },
        ].map((card, index) => (
          <div key={index} className="stat-card group cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs mt-2 font-medium text-gray-500">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ventas del Mes</h3>
              <p className="text-sm text-gray-500 mt-1">Tendencia diaria de ventas</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient></defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Top Vendedores</h3>
          <p className="text-sm text-gray-500 mb-6">Rendimiento del equipo</p>
          <div className="space-y-4">
            {stats.topSellers.map((seller, index) => (
              <div key={seller.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' : index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{seller.firstName} {seller.lastName}</p>
                  <p className="text-xs text-gray-500">{seller._count.sales} ventas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderSeller = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Mis Ventas Hoy', value: formatCurrency(stats.today.sales), subtitle: `${stats.today.count} ventas`, gradient: 'from-blue-500 to-blue-600' },
          { title: 'Mis Ventas Mes', value: formatCurrency(stats.month.sales), subtitle: `${stats.month.count} ventas`, gradient: 'from-emerald-500 to-emerald-600' },
          { title: 'Esta Semana', value: formatCurrency(stats.week.sales), subtitle: `${stats.week.count} ventas`, gradient: 'from-amber-500 to-orange-500' },
          { title: 'Comisiones', value: formatCurrency(stats.totals.pendingCommissions), subtitle: 'pendientes', gradient: 'from-purple-500 to-violet-500' },
        ].map((card, index) => (
          <div key={index} className="stat-card group cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs mt-2 font-medium text-gray-500">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderWarehouse = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Total Productos', value: stats.totals.products, subtitle: 'en inventario', gradient: 'from-blue-500 to-blue-600' },
          { title: 'Stock Bajo', value: stats.totals.lowStockCount, subtitle: 'productos', gradient: 'from-red-500 to-red-600' },
          { title: 'Bodegas', value: stats.warehouseStats?.length || 0, subtitle: 'activas', gradient: 'from-amber-500 to-orange-500' },
          { title: 'Ventas Hoy', value: formatCurrency(stats.today.sales), subtitle: `${stats.today.count} transacciones`, gradient: 'from-emerald-500 to-emerald-600' },
        ].map((card, index) => (
          <div key={index} className="stat-card group cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                <p className="text-xs mt-2 font-medium text-gray-500">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.warehouseStats?.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Mis Bodegas</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.warehouseStats.map((wh, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{wh.name}</p>
                  <p className="text-xs text-gray-500">{wh.totalProducts} productos</p>
                </div>
                <span className="badge badge-info">{wh.totalItems} uds</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const getSubtitle = () => {
    switch (role) {
      case 'ADMIN': return 'Panel de administracion en tiempo real';
      case 'MANAGER': return 'Panel de gerencia en tiempo real';
      case 'SELLER': return 'Tus estadisticas de ventas';
      case 'WAREHOUSE': return 'Gestion de inventario';
      default: return 'Resumen en tiempo real';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">{getSubtitle()}</p>
      </div>

      {role === 'ADMIN' || role === 'MANAGER' ? renderAdminManager() : null}
      {role === 'SELLER' ? renderSeller() : null}
      {role === 'WAREHOUSE' ? renderWarehouse() : null}

      {/* Recent Sales */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{role === 'SELLER' ? 'Mis Ventas Recientes' : 'Ventas Recientes'}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recentSales.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">No hay ventas registradas</div>
          ) : (
            stats.recentSales.slice(0, 8).map((sale) => (
              <div key={sale.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-xs">{sale.seller?.firstName?.[0]}{sale.seller?.lastName?.[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{sale.seller?.firstName} {sale.seller?.lastName}</p>
                    <p className="text-xs text-gray-500">{sale.customer?.name || 'Sin cliente'} &middot; {sale.saleNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(sale.total)}</p>
                  <span className={`badge text-[10px] ${sale.status === 'COMPLETED' ? 'badge-success' : sale.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                    {statusLabel(sale.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Low Stock */}
      {stats.lowStockItems.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Stock Bajo</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.lowStockItems.map((item, index) => (
              <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.quantity <= item.minStock / 2 ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <svg className={`w-5 h-5 ${item.quantity <= item.minStock / 2 ? 'text-red-500' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">Minimo: {item.minStock}{item.warehouse ? ` - ${item.warehouse}` : ''}</p>
                  </div>
                </div>
                <span className={`badge ${item.quantity <= item.minStock / 2 ? 'badge-danger' : 'badge-warning'}`}>
                  {item.quantity} uds
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
