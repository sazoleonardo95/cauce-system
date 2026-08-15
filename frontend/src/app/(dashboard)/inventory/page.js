'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [filter, setFilter] = useState({ warehouseId: '', lowStock: '' });
  const [adjustForm, setAdjustForm] = useState({ productId: '', warehouseId: '', type: 'ENTRY', quantity: '', notes: '' });
  const [whForm, setWhForm] = useState({ name: '', code: '', address: '' });

  const loadData = async () => {
    try {
      const [inv, wh] = await Promise.all([
        api.getInventory({ ...filter, lowStock: filter.lowStock || undefined }),
        api.getWarehouses(),
      ]);
      setItems(inv);
      setWarehouses(wh);
    } catch (err) {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filter]);

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await api.adjustStock({
        ...adjustForm,
        quantity: parseInt(adjustForm.quantity),
      });
      toast.success('Stock ajustado');
      setShowAdjust(false);
      setAdjustForm({ productId: '', warehouseId: '', type: 'ENTRY', quantity: '', notes: '' });
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await api.createWarehouse(whForm);
      toast.success('Bodega creada');
      setShowNewWarehouse(false);
      setWhForm({ name: '', code: '', address: '' });
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalProducts = items.length;
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity <= (i.product?.minStock || 0)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-gray-500 mt-1">{totalProducts} productos - {totalItems} unidades en stock</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNewWarehouse(true)} className="btn-secondary">+ Bodega</button>
          <button onClick={() => setShowAdjust(true)} className="btn-primary">+ Ajustar Stock</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-gray-500">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Unidades Totales</p>
          <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-gray-500">Stock Bajo</p>
          <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select className="input max-w-xs" value={filter.warehouseId} onChange={(e) => setFilter({ ...filter, warehouseId: e.target.value })}>
          <option value="">Todas las bodegas</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded" checked={filter.lowStock === 'true'} onChange={(e) => setFilter({ ...filter, lowStock: e.target.checked ? 'true' : '' })} />
          Solo stock bajo
        </label>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Bodega</th>
              <th className="px-6 py-3">Cantidad</th>
              <th className="px-6 py-3">Minimo</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Sin datos de inventario</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.product?.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.warehouse?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.product?.minStock}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${item.quantity <= (item.product?.minStock || 0) ? 'badge-danger' : item.quantity <= (item.product?.minStock || 0) * 2 ? 'badge-warning' : 'badge-success'}`}>
                      {item.quantity <= (item.product?.minStock || 0) ? 'Critico' : item.quantity <= (item.product?.minStock || 0) * 2 ? 'Bajo' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjust && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Ajustar Stock</h2>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div>
                <label className="label">Tipo de movimiento</label>
                <select className="input" value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}>
                  <option value="ENTRY">Entrada</option>
                  <option value="EXIT">Salida</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="label">Bodega</label>
                <select className="input" value={adjustForm.warehouseId} onChange={(e) => setAdjustForm({ ...adjustForm, warehouseId: e.target.value })} required>
                  <option value="">Seleccionar bodega</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cantidad</label>
                <input type="number" className="input" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} required />
              </div>
              <div>
                <label className="label">Notas</label>
                <input className="input" value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowAdjust(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Aplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Warehouse Modal */}
      {showNewWarehouse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Nueva Bodega</h2>
            </div>
            <form onSubmit={handleCreateWarehouse} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" value={whForm.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Codigo *</label>
                <input className="input" value={whForm.code} onChange={(e) => setWhForm({ ...whForm, code: e.target.value })} required maxLength={5} />
              </div>
              <div>
                <label className="label">Direccion</label>
                <input className="input" value={whForm.address} onChange={(e) => setWhForm({ ...whForm, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowNewWarehouse(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
