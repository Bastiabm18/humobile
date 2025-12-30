'use client';

import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc'; 
import { motion } from 'framer-motion';
// 🚨 CAMBIO CRÍTICO AQUÍ: Importar la función getSupabaseBrowser
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client'; 
import { useEffect } from 'react'; 
import { useRouter } from 'next/navigation'; 

export default function LoginPage() {
  const router = useRouter(); 
  
  // 🚨 INICIALIZACIÓN CRÍTICA: Llama a la función para obtener la instancia
  const supabase = getSupabaseBrowser(); 


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
        <div className="bg-card rounded-2xl p-8 shadow-2xl ">
          
          {/* Cuadro interno claro */}
          <div className="bg-neutral-700 rounded-xl p-6 space-y-6 border border-gray-700">
            
            {/* Logo */}
            <h1 className="text-3xl font-bold text-center text-gray-200 tracking-wider">
              HUMOBILE
            </h1>

            {/* Formulario */}
            <form className="space-y-5">
              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                  Usuario o Email
                </label>
                <input
                  id="email"
                  type="text"
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
                  placeholder="••••••••"
                  className="px-4 py-3 bg-gray-700 placeholder:bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Iniciar
                </button>
                <button
                  type="button"
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
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 rounded-lg hover:bg-gray-100 transition-colors">
              <FcGoogle size={24} />
              Continuar con Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}