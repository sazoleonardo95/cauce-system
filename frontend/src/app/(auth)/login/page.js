'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenido!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Credenciales invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Hero branding */}
      <div className="hidden lg:flex lg:w-[55%] bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-16 left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-32 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
          </div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 text-white">
          <img src="/logo-white.png" alt="CauCE" className="h-14 mb-6" />
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Gestiona tu negocio<br />
            <span className="text-blue-200">de forma inteligente</span>
          </h1>
          <p className="text-lg text-blue-100/80 mb-10 max-w-lg">
            El sistema de ventas e inventario mas avanzado del mercado. Toma decisiones basadas en datos en tiempo real.
          </p>

          {/* Feature cards */}
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <p className="font-semibold">Dashboard en tiempo real</p>
                <p className="text-sm text-blue-200/70">KPIs, graficos y metricas actualizadas al instante</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </div>
              <div>
                <p className="font-semibold">Control de inventario inteligente</p>
                <p className="text-sm text-blue-200/70">Alertas de stock bajo y seguimiento en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="font-semibold">Gestion de equipo</p>
                <p className="text-sm text-blue-200/70">Invita vendedores, asigna roles y mide rendimiento</p>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-blue-200/50 mb-4">Empresas que confian en nosotros</p>
            <div className="flex items-center gap-8">
              <div className="text-white/30 font-bold text-lg">Nestle</div>
              <div className="text-white/30 font-bold text-lg">Rappi</div>
              <div className="text-white/30 font-bold text-lg">APIUX</div>
              <div className="text-white/30 font-bold text-lg">NTT Data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden mb-10">
            <img src="/logo.png" alt="CauCE" className="h-10" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-500">Ingresa tus credenciales para acceder a tu panel de control</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Contrasena</label>
              <input
                type="password"
                className="input"
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Iniciando sesion...
                </span>
              ) : 'Iniciar sesion'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            No tienes cuenta?{' '}
            <Link href="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Registrate gratis
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-10 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cuentas de demo</p>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                <span className="font-medium text-gray-700">Admin</span>
                <span className="text-gray-500">admin@demo.com / admin123</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                <span className="font-medium text-gray-700">Vendedor</span>
                <span className="text-gray-500">seller@demo.com / seller123</span>
              </div>
              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                <span className="font-medium text-gray-700">Bodega</span>
                <span className="text-gray-500">bodega@demo.com / warehouse123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
