'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', address: '' });

  const loadWarehouses = async () => {
    try {
      const data = await api.getWarehouses();
      setWarehouses(data);
    } catch (err) {
      toast.error('Error al cargar bodegas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWarehouses(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', address: '' });
    setShowModal(true);
  };

  const openEdit = (wh) => {
    setEditing(wh);
    setForm({ name: wh.name || '', code: wh.code || '', address: wh.address || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (!form.code.trim()) { toast.error('El codigo es obligatorio'); return; }
    try {
      if (editing) {
        await api.updateWarehouse(editing.id, form);
        toast.success('Bodega actualizada');
      } else {
        await api.createWarehouse(form);
        toast.success('Bodega creada');
      }
      setShowModal(false);
      loadWarehouses();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar esta bodega?')) return;
    try {
      await api.deleteWarehouse(id);
      toast.success('Bodega eliminada');
      loadWarehouses();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = warehouses.filter(
    (wh) => wh.name.toLowerCase().includes(search.toLowerCase()) || wh.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bodegas</h1>
          <p className="text-gray-500 mt-1">{warehouses.length} bodegas registradas</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ Nueva Bodega</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <input type="text" className="input max-w-md" placeholder="Buscar por nombre o codigo..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Codigo</th>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Direccion</th>
                <th className="px-6 py-3">Productos</th>
                <th className="px-6 py-3">Unidades</th>
                <th className="px-6 py-3">Bajo Stock</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No se encontraron bodegas</td></tr>
              ) : (
                filtered.map((wh) => (
                  <tr key={wh.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(wh)}>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{wh.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{wh.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{wh.address || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{wh.totalProducts || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{wh.totalItems || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${wh.lowStockItems > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {wh.lowStockItems || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(wh.id); }} className="text-red-600 hover:text-red-700 text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">{editing ? 'Editar Bodega' : 'Nueva Bodega'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input className="input" placeholder="Nombre de la bodega" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Codigo *</label>
                <input className="input" placeholder="Ej: BOD-01" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
              </div>
              <div>
                <label className="label">Direccion</label>
                <input className="input" placeholder="Direccion de la bodega" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editing ? 'Guardar Cambios' : 'Crear Bodega'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
