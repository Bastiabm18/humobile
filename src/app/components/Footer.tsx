// components/Footer.tsx
'use client';

import NeonSign from './NeonSign';

export default function Footer() {
  return (
    <footer className="py-12 px-6 md:px-8 lg:px-12 w-full">
      {/* CONTENIDO PRINCIPAL */}
      
      <div className="max-w-none mx-auto flex flex-col md:flex-row justify-evenly gap-8 md:gap-12 text-gray-200">
        
        {/* COLUMNA IZQUIERDA - LOGO NEÓN + COPYRIGHT */}
        <div className="flex flex-col items-center md:items-start">
          <NeonSign />
          
          <div className="mt-6 text-sm items-center">
            <p className='w-full flex items-center justify-center'>© {new Date().getFullYear()} HUMOBILE.cl</p>
            <p className="mt-1">
              Todos los derechos reservados{' '}
              <span className="inline-block w-3 h-3 rounded-full border border-gray-200 text-center text-xs leading-3">
                ®
              </span>
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA - ENLACES + CONTACTO */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          
          {/* ENLACES RÁPIDOS */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-400 mb-3">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm text-center md:text-left">
              <li><a href="/" className="hover:text-white transition">Inicio</a></li>
              <li><a href="/quienes-somos" className="hover:text-white transition">Quiénes Somos</a></li>
              <li><a href="/contacto" className="hover:text-white transition">Contacto</a></li>
              <li><a href="/agenda" className="hover:text-white transition">Agenda</a></li>
              <li><a href="/login" className="hover:text-white transition">Iniciar Sesión</a></li>
            </ul>
          </div>

          {/* CONTACTO */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-gray-400 mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm text-center md:text-left">
              <li className="flex items-center gap-2">
                <span>Phone</span> +56 9 1234 5678
              </li>
              <li className="flex items-center gap-2">
                <span>Email</span> contacto@humobile.cl
              </li>
              <li className="flex items-center gap-2">
                <span>Clock</span> Lun - Vie: 9:00 - 18:00
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* LÍNEA SEPARADORA */}
      <div className="mt-10 pt-6 border-t border-gray-600"></div>

      {/* FRASE FINAL - ABAJO DE TODO */}
      <div className="mt-6 text-center text-xs text-gray-200">
        <p>
          Developed with <span className="text-red-500">❤</span> by{' '}
          <a
            href="https://babm-zeta.vercel.app/es"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer underline hover:text-white transition"
          >
            BABM
          </a>
        </p>
      </div>
    </footer>
  );
}