'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSale, setShowNewSale] = useState(false);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [filter, setFilter] = useState({ status: '', startDate: '', endDate: '' });
  const [saleForm, setSaleForm] = useState({ customerId: '', warehouseId: '', items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }], taxRate: 16, discount: 0, notes: '', paymentMethod: 'cash' });

  const loadSales = async () => {
    try {
      const data = await api.getSales({ ...filter, limit: 100 });
      setSales(data.sales);
    } catch (err) {
      toast.error('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([api.getProducts({ limit: 200 }), api.getCustomers({ limit: 200 }), api.getWarehouses()])
      .then(([p, c, w]) => { setProducts(p.products); setCustomers(c.customers); setWarehouses(w); })
      .catch(console.error);
  }, []);

  useEffect(() => { loadSales(); }, [filter]);

  const addItem = () => setSaleForm({ ...saleForm, items: [...saleForm.items, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }] });
  const removeItem = (i) => setSaleForm({ ...saleForm, items: saleForm.items.filter((_, idx) => idx !== i) });

  const updateItem = (i, field, value) => {
    const items = [...saleForm.items];
    items[i] = { ...items[i], [field]: value };
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) items[i].unitPrice = product.price;
    }
    setSaleForm({ ...saleForm, items });
  };

  const subtotal = saleForm.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity - item.discount), 0);
  const taxAmount = subtotal * (saleForm.taxRate / 100);
  const total = subtotal + taxAmount - saleForm.discount;

  const handleSale = async (e) => {
    e.preventDefault();
    try {
      await api.createSale({
        ...saleForm,
        taxRate: parseFloat(saleForm.taxRate),
        discount: parseFloat(saleForm.discount),
      });
      toast.success('Venta registrada');
      setShowNewSale(false);
      setSaleForm({ customerId: '', warehouseId: '', items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }], taxRate: 16, discount: 0, notes: '', paymentMethod: 'cash' });
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancelar esta venta? El stock sera devuelto.')) return;
    try {
      await api.cancelSale(id);
      toast.success('Venta cancelada');
      loadSales();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalSales = sales.filter((s) => s.status !== 'CANCELLED').reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-gray-500 mt-1">{sales.length} ventas - Total: {formatCurrency(totalSales)}</p>
        </div>
        <button onClick={() => setShowNewSale(true)} className="btn-primary">+ Nueva Venta</button>
      </div>

      <div className="flex gap-4">
        <select className="input max-w-xs" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">Todos los estados</option>
          <option value="COMPLETED">Completada</option>
          <option value="PENDING">Pendiente</option>
          <option value="CANCELLED">Cancelada</option>
        </select>
        <input type="date" className="input max-w-xs" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} />
        <input type="date" className="input max-w-xs" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Venta</th>
              <th className="px-6 py-3">Vendedor</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No hay ventas</td></tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{sale.saleNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{sale.seller?.firstName} {sale.seller?.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.customer?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{sale.items?.length}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(sale.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${sale.status === 'COMPLETED' ? 'badge-success' : sale.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sale.saleDate)}</td>
                  <td className="px-6 py-4">
                    {sale.status === 'COMPLETED' && (
                      <button onClick={() => handleCancel(sale.id)} className="text-red-600 hover:text-red-700 text-sm">Cancelar</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Sale Modal */}
      {showNewSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Nueva Venta</h2>
            </div>
            <form onSubmit={handleSale} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Cliente</label>
                  <select className="input" value={saleForm.customerId} onChange={(e) => setSaleForm({ ...saleForm, customerId: e.target.value })}>
                    <option value="">Sin cliente</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Bodega</label>
                  <select className="input" value={saleForm.warehouseId} onChange={(e) => setSaleForm({ ...saleForm, warehouseId: e.target.value })}>
                    <option value="">Sin bodega</option>
                    {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Productos</label>
                  <button type="button" onClick={addItem} className="text-primary-600 text-sm font-medium">+ Agregar</button>
                </div>
                <div className="space-y-3">
                  {saleForm.items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-end">
                      <select className="input flex-1" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} required>
                        <option value="">Seleccionar producto</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>)}
                      </select>
                      <input type="number" className="input w-20" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} min="1" />
                      <input type="number" step="0.01" className="input w-24" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} />
                      {saleForm.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-red-600 p-2">X</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">IVA %</label>
                  <input type="number" step="0.01" className="input" value={saleForm.taxRate} onChange={(e) => setSaleForm({ ...saleForm, taxRate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Descuento</label>
                  <input type="number" step="0.01" className="input" value={saleForm.discount} onChange={(e) => setSaleForm({ ...saleForm, discount: e.target.value })} />
                </div>
                <div>
                  <label className="label">Metodo de pago</label>
                  <select className="input" value={saleForm.paymentMethod} onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="credit">Credito</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">IVA</span><span>{formatCurrency(taxAmount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Descuento</span><span>-{formatCurrency(saleForm.discount)}</span></div>
                <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowNewSale(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Registrar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
