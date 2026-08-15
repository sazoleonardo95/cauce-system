'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    companySlug: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'companyName' ? { companySlug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Cuenta creada!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="CauCE" className="h-10 mx-auto" />
          <p className="text-gray-500 mt-2">Crea tu empresa y empieza a vender</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Crear cuenta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input name="firstName" className="input" placeholder="Carlos" value={form.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input name="lastName" className="input" placeholder="Garcia" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" placeholder="tu@email.com" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Contrasena</label>
              <input name="password" type="password" className="input" placeholder="Minimo 6 caracteres" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <div>
              <label className="label">Nombre de la empresa</label>
              <input name="companyName" className="input" placeholder="Mi Empresa" value={form.companyName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">URL de la empresa</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">cauce.com/</span>
                <input name="companySlug" className="input flex-1" placeholder="mi-empresa" value={form.companySlug} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creando...' : 'Crear cuenta'}
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
