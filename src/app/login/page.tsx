'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc'; 
import { motion } from 'framer-motion';
// 🚨 CAMBIO CRÍTICO AQUÍ: Importar la función getSupabaseBrowser
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client'; 
import { useEffect } from 'react'; 
import { useRouter } from 'next/navigation'; 

export default function LoginPage() {
 const router = useRouter(); 
 const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
 
  // 🚨 INICIALIZACIÓN CRÍTICA: Llama a la función para obtener la instancia
  const supabase = getSupabaseBrowser(); 

    // 🆕 Manejador para login con email/password
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir recarga de página
    setLoading(true);
    setError('');

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        console.log('✅ Login exitoso, sincronizando sesión...');
        
        // 2. Usar TU MISMO FLUJO de /api/auth/session
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.session.access_token }),
        });

        if (!sessionResponse.ok) {
          console.error('Error al sincronizar sesión');
          // Aún así, podemos continuar porque el usuario ya existe en Auth
        }

        // 3. Redirigir al dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      
      // Manejo de errores específicos
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos');
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };


   const handleGoogleSignIn = async () => {
     try {
       await supabase.auth.signInWithOAuth({ // <-- Usamos la instancia 'supabase'
         provider: 'google',
         options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
         },
       });
     } catch (e) {
       console.error('Excepción durante el proceso de Google Sign In:', e);
     }
   };
  return (
    <div className="min-h-screen w-full overflow-y-hidden  flex items-center justify-center p-4">
      {/* Contenedor principal - responsive */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Cuadro envolvente grande (sombra, fondo oscuro) */}
        <div className="bg-neutral-800 rounded-2xl p-8 shadow-2xl ">
          
          {/* Cuadro interno claro */}
          <div className="bg-neutral-700 rounded-xl p-6 space-y-6 border border-gray-700">
            
            {/* Logo */}
            <h1 className="text-3xl font-bold text-center text-gray-200 tracking-wider">
              HUMOBILE
            </h1>

            {/* Formulario */}
            <form onSubmit={handleEmailSignIn} className="space-y-5">
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                  Usuario o Email
                </label>
                <input
               id="email"
                  type="email" // Cambiar a type="email" para validación
                  value={email} // ← Vincular estado
                  onChange={(e) => setEmail(e.target.value)} // ← Actualizar estado
                  required // ← Hacerlo requerido
                  placeholder="tu@email.com"
                  className="px-4 py-3 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm text-gray-400 mb-1">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password} // ← Vincular estado
                  onChange={(e) => setPassword(e.target.value)} // ← Actualizar estado
                  required // ← Hacerlo requerido
                  placeholder="••••••••"
                  className="px-4 py-3 bg-gray-700 placeholder:bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="submit"
                     disabled={loading} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                   {loading ? 'Iniciando...' : 'Iniciar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('');
                    setPassword('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>

            {/* Enlace a registro */}
            <p className="text-center text-sm text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link
                href="/signup"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                Crea una aquí
              </Link>
            </p>

            {/* Botón Google */}
            <button 
            onClick={handleGoogleSignIn}
              className="w-full flex items-center cursor-pointer justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">
              <FcGoogle size={24} />
              Continuar con Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}