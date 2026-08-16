'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      ),
      title: 'Dashboard en tiempo real',
      description: 'Visualiza KPIs, graficos de ventas y metricas clave al instante. Toma decisiones basadas en datos actualizados.',
      gradient: 'from-blue-500 to-cyan-400',
      bgLight: 'bg-blue-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      ),
      title: 'Control de inventario inteligente',
      description: 'Alertas automaticas de stock bajo, seguimiento por bodegas y ajustes de stock en un solo clic.',
      gradient: 'from-emerald-500 to-teal-400',
      bgLight: 'bg-emerald-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      ),
      title: 'Ventas y facturacion',
      description: 'Registra ventas, genera reportes, controla metodos de pago y gestiona clientes desde un solo lugar.',
      gradient: 'from-violet-500 to-purple-400',
      bgLight: 'bg-violet-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
      title: 'Gestion de equipo',
      description: 'Invita vendedores, asigna roles (admin, vendedor, bodega) y mide el rendimiento de cada miembro.',
      gradient: 'from-amber-500 to-orange-400',
      bgLight: 'bg-amber-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      ),
      title: 'Sistema de invitaciones',
      description: 'Invita a tu equipo por email con un solo clic. Ellos se unen y empiezan a usar el sistema al instante.',
      gradient: 'from-pink-500 to-rose-400',
      bgLight: 'bg-pink-50',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
      ),
      title: 'App mobile incluida',
      description: 'Accede desde tu celular con nuestra app Android. Gestiona ventas e inventario desde cualquier lugar.',
      gradient: 'from-red-500 to-pink-400',
      bgLight: 'bg-red-50',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Crea tu cuenta',
      description: 'Registrate gratis en 30 segundos. Solo necesitas tu email y nombre.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
      ),
    },
    {
      number: '02',
      title: 'Invita a tu equipo',
      description: 'Agrega vendedores, bodegueros y gerentes con el sistema de invitaciones por email.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ),
    },
    {
      number: '03',
      title: 'Comienza a vender',
      description: 'Registra productos, realiza ventas y monitorea todo desde el dashboard en tiempo real.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
      ),
    },
  ];

  const testimonials = [
    {
      name: 'Maria Rodriguez',
      role: 'Gerente Commercial',
      company: 'TechStore Chile',
      text: 'CauCE transformo la forma en que manejamos nuestro inventario. Ahora tenemos control total de las ventas y el stock en tiempo real.',
      avatar: 'MR',
    },
    {
      name: 'Carlos Mendez',
      role: 'Dueño',
      company: 'Distribuidora Norte',
      text: 'El dashboard es increible. Puedo ver las metricas de mis vendedores y la salud del negocio desde mi celular.',
      avatar: 'CM',
    },
    {
      name: 'Ana Gutierrez',
      role: 'Directora de Operaciones',
      company: 'LogiPack',
      text: 'La gestion de equipo con roles y permisos es exactamente lo que necesitamos. Muy intuitivo y profesional.',
      avatar: 'AG',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CauCE</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Plataforma</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Como funciona</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Testimonios</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors px-4 py-2">
              Iniciar sesion
            </Link>
            <Link href="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md">
              Comenzar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-accent-100/50 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                Sistema de ventas e inventario
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                Gestiona tu negocio de forma{' '}
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">inteligente</span>
              </h1>
              <p className="text-xl text-gray-500 mb-10 max-w-lg leading-relaxed">
                El sistema de ventas e inventario mas avanzado del mercado. Toma decisiones basadas en datos en tiempo real, desde cualquier dispositivo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30">
                  Comenzar gratis
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  Ver demo
                </Link>
              </div>
            </div>

            {/* App Mockup */}
            <div className="hidden lg:block relative animate-fade-in">
              <div className="relative">
                {/* Floating badges */}
                <div className="absolute -top-6 -left-4 bg-white rounded-2xl shadow-xl shadow-gray-200/50 px-5 py-3 flex items-center gap-3 z-10 animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">$11,715</p>
                    <p className="text-xs text-gray-500">Ventas del mes</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 px-5 py-3 flex items-center gap-3 z-10 animate-slide-up" style={{animationDelay: '0.4s'}}>
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">+24%</p>
                    <p className="text-xs text-gray-500">Crecimiento</p>
                  </div>
                </div>
                <div className="absolute bottom-8 -left-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 px-5 py-3 flex items-center gap-3 z-10 animate-slide-up" style={{animationDelay: '0.6s'}}>
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">5 vendedores</p>
                    <p className="text-xs text-gray-500">Equipo activo</p>
                  </div>
                </div>

                {/* Dashboard mockup card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-gray-900">Dashboard</p>
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-primary-700 text-xs font-bold">CA</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Ventas Hoy</p>
                        <p className="text-sm font-bold text-gray-900">$614</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Productos</p>
                        <p className="text-sm font-bold text-gray-900">10</p>
                      </div>
                      <div className="bg-violet-50 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500">Clientes</p>
                        <p className="text-sm font-bold text-gray-900">5</p>
                      </div>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-primary-100 to-accent-100 rounded-xl flex items-end p-3 gap-1">
                      {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 70].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-primary-500 to-accent-500 rounded-t" style={{height: `${h}%`}}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client logos */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-medium text-gray-400 mb-8 uppercase tracking-wider">Empresas que confian en nosotros</p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
            <span className="text-xl font-bold text-gray-900">Nestle</span>
            <span className="text-xl font-bold text-gray-900">Rappi</span>
            <span className="text-xl font-bold text-gray-900">APIUX</span>
            <span className="text-xl font-bold text-gray-900">NTT Data</span>
            <span className="text-xl font-bold text-gray-900">Puig</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Plataforma
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Todo lo que tu negocio necesita
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Herramientas poderosas para gestionar ventas, inventario y equipo en un solo lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 ${feature.bgLight} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-accent-50 text-accent-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Como funciona
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Comienza en 3 simples pasos
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Configura tu negocio en menos de 5 minutos. Sin complicaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative bg-white rounded-3xl p-8 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary-500/25">
                  {step.icon}
                </div>
                <div className="text-6xl font-black text-gray-100 mb-2">{step.number}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-gray-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl lg:text-5xl font-black text-white mb-2">500+</p>
              <p className="text-blue-200 font-medium">Negocios activos</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black text-white mb-2">10K+</p>
              <p className="text-blue-200 font-medium">Ventas procesadas</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black text-white mb-2">99.9%</p>
              <p className="text-blue-200 font-medium">Uptime garantizado</p>
            </div>
            <div>
              <p className="text-4xl lg:text-5xl font-black text-white mb-2">24/7</p>
              <p className="text-blue-200 font-medium">Soporte disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Testimonios
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">
              Que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Empresas reales que ya usan CauCE para hacer crecer su negocio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500">{testimonial.role} - {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            Tu negocio merece crecer con datos
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Unete a cientos de negocios que ya usan CauCE para tomar mejores decisiones. Comienza gratis, sin tarjeta de credito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-primary-700 hover:to-accent-700 transition-all shadow-lg shadow-primary-500/25 hover:shadow-xl">
              Crear cuenta gratis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all">
              Ver demo en vivo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-base">C</span>
                </div>
                <span className="text-xl font-bold text-white">CauCE</span>
              </div>
              <p className="text-sm leading-relaxed">El sistema de ventas e inventario mas avanzado del mercado.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Producto</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Plataforma</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Iniciar sesion</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Recursos</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentacion</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terminos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; 2026 CauCE. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
