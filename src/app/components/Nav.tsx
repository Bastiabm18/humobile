'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { HiLogout, HiMenu, HiX } from 'react-icons/hi'; // ÍCONOS CORRECTOS
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import NeonSign from './NeonSign';
import { FaX } from 'react-icons/fa6';

const links = [
  { name: 'Inicio', href: '/' },
  { name: 'Explorar', href: '/busqueda' },
  { name: 'Quiénes Somos', href: '#QuienesSomos' },
  { name: 'Contacto', href: '/contacto' },
  { name: 'Inicia sesión', href: '/login' },
];



export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user,logout,loading } = useAuth();
  const router = useRouter();
 // console.log('Usuario en Navbar:', user);

const handleLogout = async () => {
    try {
      // 2. Llama a la función de logout del AuthContext
      await logout(); 
      setOpen(false);
      
      // 3. Redirige al login después de que el contexto limpie la sesión y la cookie
      router.push('/login'); 
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        router.push('/login'); 
    }
  };
  const navLinks = user
  ? [
      ...links.slice(0, 4), // Inicio, Quiénes Somos, Contacto, Agenda
      { name: 'Mi Humobile', href: '/dashboard' },
      ...links.slice(5) // Login
    ]
  : links;

    
  return (
    <>
      {/* NAVBAR STICKY */}
      <nav className="sticky top-0 z-50 bg-black/50 text-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href="/"
                className="text-xl font-bold bg-gray-900 px-3 py-1 rounded hover:bg-gray-800 transition-colors"
              >
                HUMOBILE
              </Link>
            </motion.div>

            {/* DESKTOP LINKS */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex space-x-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      className="relative text-sm font-medium after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                {user && (

                  // boton de salir tiene que ir aparte por la funcion onclick 
                  <motion.button 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 7 * 0.1, duration: 0.3 }}
                      onClick={handleLogout} // AHORA sí llamas a la función
                      className="flex items-center text-sm font-medium text-red-400 hover:text-red-500 transition-colors"
                      aria-label="Cerrar Sesión"
                      disabled={loading}
                      // ... (otras props de motion) ...
                  >
                      <HiLogout className="h-4 w-4 mr-1" />
                      Salir
                  </motion.button>
                  )}
              </div>
            </div>

            {/* MOBILE TOGGLE */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(!open)}
              className="md:hidden text-gray-200"
              aria-label="Menú"
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiX className="h-7 w-7" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <HiMenu className="h-7 w-7" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[100vw] bg-black/60 backdrop-blur-sm z-50 md:hidden shadow-2xl"
            >
              <div 
              onClick={() => setOpen(false)}
              className=' absolute right-6 top-6'>
                <FaX size={24} className='text-red-400/60'/>
              </div>
              <div className="flex flex-col items-center justify-center h-full z-50 space-y-8 text-lg font-medium">
                 <div className=' h-auto mb-20 flex items-start justify-center'>
                <NeonSign/>
              </div>
              
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                    {user && (
                  <motion.button
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 7 * 0.1 }}
                     // O simplemente <button> si quitas motion
                      onClick={handleLogout} // AHORA sí llamas a la función
                      className="flex items-center text-md font-medium text-red-400 hover:text-red-500 transition-colors"
                      aria-label="Cerrar Sesión"
                      disabled={loading}
                      // ... (otras props de motion) ...
                  >
                      <HiLogout className="h-5 w-5 mr-2" />
                         Cerrar sesión
                  </motion.button>
                  )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}