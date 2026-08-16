'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.acceptInvitation({
        token,
        ...form,
      });
      localStorage.setItem('token', result.token);
      localStorage.setItem('refreshToken', result.refreshToken);
      toast.success('Bienvenido a CauCE!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Error al aceptar invitacion');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md text-center">
          <img src="/logo.png" alt="CauCE" className="h-10 mx-auto mb-6" />
          <div className="card p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link invalido</h2>
            <p className="text-gray-500 mb-6">No se encontro un token de invitacion valido.</p>
            <Link href="/login" className="btn-primary inline-block">
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="CauCE" className="h-10 mx-auto" />
          <p className="text-gray-500 mt-2">Completa tu registro para unirte al equipo</p>
        </div>

        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Unirte al equipo</h2>
            <p className="text-sm text-gray-500 mt-1">Completa tus datos para crear tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  name="firstName"
                  className="input"
                  placeholder="Tu nombre"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  name="lastName"
                  className="input"
                  placeholder="Tu apellido"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Telefono (opcional)</label>
              <input
                name="phone"
                className="input"
                placeholder="+57 300 123 4567"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Contrasena</label>
              <input
                name="password"
                type="password"
                className="input"
                placeholder="Minimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : 'Unirme al equipo'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700">
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}
