'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lastName: '',
    phone: '',
    rut:''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar en Supabase Auth (SIN confirmación de email)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.name} ${formData.lastName}`.trim(),
            phone: formData.phone,
            // Guardamos también por separado por si los necesitas
            first_name: formData.name,
            last_name: formData.lastName,
            rut: formData.rut
          
          }
        }
      });

      if (signUpError) throw signUpError;

      // 2. Como tenemos confirmación DESACTIVADA, recibimos sesión inmediatamente
      if (data.session) {
        console.log(' Usuario creado en Auth, sincronizando con DB...');
        
        // 3. Usar tu flujo existente de /api/auth/session para crear perfil y membresía
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.session.access_token }),
        });

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.text();
          console.error('Error en sincronización:', errorData);
          // Aunque falle la sincronización, el usuario existe en Auth
          // Pero mejor redirigir a login para que reintente
          router.push('/login?error=sync_failed');
          return;
        }

        const result = await sessionResponse.json();
        console.log(' Usuario sincronizado con DB, rol:', result.role);
        
        // 4. Redirigir al dashboard
        router.push('/dashboard');
      } else {
        // Esto no debería pasar con confirmación desactivada, pero por si acaso
        console.warn('No se recibió sesión inmediata');
        router.push('/login?error=no_session');
      }

    } catch (err: any) {
      console.error('Error en registro:', err);
      
      // Manejo de errores específicos de Supabase
      if (err.message?.includes('User already registered')) {
        setError('Este email ya está registrado');
      } else if (err.message?.includes('Password should be at least 6 characters')) {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else {
        setError(err.message || 'Error al registrar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    } catch (e) {
      console.error('Error en Google Sign In:', e);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-auto flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-neutral-800 rounded-2xl p-8 shadow-2xl">
          <div className="bg-neutral-700 rounded-xl p-6 space-y-6 border border-gray-700">
            
            <h1 className="text-3xl font-bold text-center text-gray-200 tracking-wider">
              HUMOBILE
            </h1>

            <p className="text-center text-gray-400 text-sm">
              Crea tu cuenta para comenzar
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              {/* Nombre y Apellido - 2 columnas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-sm text-gray-400 mb-1">
                    Nombre *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                    placeholder="Juan"
                  />
                </div>

                <div className="flex flex-col">
                  <label htmlFor="lastName" className="text-sm text-gray-400 mb-1">
                    Apellido *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="rut" className="text-sm text-gray-400 mb-1">
                  Rut *
                </label>
                <input
                  id="rut"
                  type="text"
                  value={formData.rut}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                  placeholder="12345678-9"
                />
              </div>
              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                  placeholder="tu@email.com"
                />
              </div>
            

              {/* Teléfono */}
              <div className="flex flex-col">
                <label htmlFor="phone" className="text-sm text-gray-400 mb-1">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                  placeholder="+569 876 54321"
                />
              </div>

              {/* Contraseña */}
              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm text-gray-400 mb-1">
                  Contraseña *
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>

              {/* Confirmar Contraseña */}
              <div className="flex flex-col">
                <label htmlFor="confirmPassword" className="text-sm text-gray-400 mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="px-4 py-3 bg-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Botón de registro */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando cuenta...
                  </span>
                ) : 'Crear cuenta'}
              </button>
            </form>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-700 text-gray-400">O continúa con</span>
              </div>
            </div>

            {/* Botón Google */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center cursor-pointer justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FcGoogle size={24} />
              Google
            </button>

            {/* Link a login */}
            <p className="text-center text-sm text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}