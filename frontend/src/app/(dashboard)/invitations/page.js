'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', role: 'SELLER' });

  const loadInvitations = async () => {
    try {
      const data = await api.getInvitations();
      setInvitations(data);
    } catch (err) {
      toast.error('Error al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvitations(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createInvitation(form);
      toast.success('Invitacion enviada');
      setShowModal(false);
      setForm({ email: '', role: 'SELLER' });
      loadInvitations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancelar esta invitacion?')) return;
    try {
      await api.cancelInvitation(id);
      toast.success('Invitacion cancelada');
      loadInvitations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResend = async (id) => {
    try {
      await api.resendInvitation(id);
      toast.success('Invitacion reenviada');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const pending = invitations.filter((i) => i.status === 'PENDING').length;
  const accepted = invitations.filter((i) => i.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitaciones</h1>
          <p className="text-gray-500 mt-1">{pending} pendientes - {accepted} aceptadas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Enviar Invitacion</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Enviado por</th>
              <th className="px-6 py-3">Expira</th>
              <th className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Cargando...</td></tr>
            ) : invitations.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No hay invitaciones</td></tr>
            ) : (
              invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.email}</td>
                  <td className="px-6 py-4">
                    <span className="badge badge-info">{inv.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${inv.status === 'PENDING' ? 'badge-warning' : inv.status === 'ACCEPTED' ? 'badge-success' : inv.status === 'EXPIRED' ? 'badge-danger' : 'badge-info'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{inv.invitedBy?.firstName} {inv.invitedBy?.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(inv.expiresAt)}</td>
                  <td className="px-6 py-4">
                    {inv.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleResend(inv.id)} className="text-primary-600 hover:text-primary-700 text-sm">Reenviar</button>
                        <button onClick={() => handleCancel(inv.id)} className="text-red-600 hover:text-red-700 text-sm">Cancelar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Enviar Invitacion</h2>
              <p className="text-sm text-gray-500 mt-1">La persona recibira un email con un enlace para unirse</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" placeholder="vendedor@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="label">Rol *</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="SELLER">Vendedor</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="WAREHOUSE">Bodeguero</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Enviar Invitacion</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
