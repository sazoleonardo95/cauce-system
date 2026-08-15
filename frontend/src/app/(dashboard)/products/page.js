'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', barcode: '', price: '', cost: '', category: '', minStock: '', description: '' });

  const loadProducts = async () => {
    try {
      const data = await api.getProducts({ search, limit: 100 });
      setProducts(data.products);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct({
        ...form,
        price: parseFloat(form.price),
        cost: form.cost ? parseFloat(form.cost) : undefined,
        minStock: parseInt(form.minStock) || 0,
      });
      toast.success('Producto creado');
      setShowModal(false);
      setForm({ name: '', sku: '', barcode: '', price: '', cost: '', category: '', minStock: '', description: '' });
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminar este producto?')) return;
    try {
      await api.deleteProduct(id);
      toast.success('Producto eliminado');
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">{products.length} productos registrados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Nuevo Producto</button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <input type="text" className="input max-w-md" placeholder="Buscar por nombre, SKU o codigo de barras..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Precio</th>
                <th className="px-6 py-3">Costo</th>
                <th className="px-6 py-3">Stock Total</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No se encontraron productos</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        {product.barcode && <p className="text-xs text-gray-500">{product.barcode}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      {product.category && <span className="badge badge-info">{product.category}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.cost ? formatCurrency(product.cost) : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${product.totalStock <= product.minStock ? 'badge-danger' : product.totalStock <= product.minStock * 2 ? 'badge-warning' : 'badge-success'}`}>
                        {product.totalStock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-700 text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Nuevo Producto</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Nombre *</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">SKU *</label>
                  <input className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Codigo de barras</label>
                  <input className="input" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                </div>
                <div>
                  <label className="label">Precio *</label>
                  <input type="number" step="0.01" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Costo</label>
                  <input type="number" step="0.01" className="input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                </div>
                <div>
                  <label className="label">Categoria</label>
                  <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
                <div>
                  <label className="label">Stock minimo</label>
                  <input type="number" className="input" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="label">Descripcion</label>
                  <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Crear Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
