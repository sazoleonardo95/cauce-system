'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTeamPerformance({})
      .then(setTeam)
      .catch(() => toast.error('Error al cargar equipo'))
      .finally(() => setLoading(false));
  }, []);

  const totalSales = team.reduce((sum, m) => sum + m.totalSales, 0);
  const totalDeals = team.reduce((sum, m) => sum + m.salesCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Equipo de Ventas</h1>
        <p className="text-gray-500 mt-1">{team.length} miembros - {totalDeals} ventas este mes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500">Ventas Totales</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Transacciones</p>
          <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Promedio por Venta</p>
          <p className="text-2xl font-bold text-gray-900">{totalDeals > 0 ? formatCurrency(totalSales / totalDeals) : '$0.00'}</p>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Vendedor</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Ventas</th>
                <th className="px-6 py-3">Total Vendido</th>
                <th className="px-6 py-3">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
              ) : team.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay datos</td></tr>
              ) : (
                team.map((member, index) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium text-sm">{member.firstName?.[0]}{member.lastName?.[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge badge-info">{member.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{member.salesCount}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(member.totalSales)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(member.avgSale)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
