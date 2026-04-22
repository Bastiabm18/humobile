// components/Footer.tsx
'use client';

import Image from 'next/image';
import NeonSign from './NeonSign';
import PoliticaPrivacidadModal from './PoliticaPrivacidadModal';
import { useState } from 'react';

export default function Footer() {
    const [showPolitica, setShowPolitica] = useState(false);// state para modal de politica de privacidad
  return (
    <footer className="py-12 px-6 md:px-8 lg:px-12 w-full">
      {/* CONTENIDO PRINCIPAL */}

       <div className=" pt-6 border-t border-gray-600"></div>
      
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
          <div className="flex flex-col items-center  md:items-start">
            <h3 className="font-semibold text-gray-400 mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm items-center justify-center md:text-left">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>celular</span> +569 8420 1584
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>Email</span> contacto@humobile.cl
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>Horarios</span> Lun - Vie: 9:00 AM - 18:00 PM
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <span>Dirección</span> Angol 436 of. 1004, Concepción, Chile
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* LÍNEA SEPARADORA */}
      <div className="mt-10 mx-auto pt-6 border-t border-dashed md:w-7xl border-gray-600"></div>
      
       {/* COPYRIGHT + POLÍTICAS */}
      <div className="flex flex-col justify-center items-center mt-4 gap-4 text-sm">
        <p className="text-gray-400 text-center md:text-left">
          © {new Date().getFullYear()} HUMOBILE SpA. Todos los derechos reservados{' '}
          <span className="inline-block w-3 h-3 rounded-full border border-gray-400 text-center text-[10px] leading-3">
            ®
          </span>
        </p>
        <button 
          onClick={() => setShowPolitica(true)}
          className="text-gray-500 hover:text-sky-400 transition cursor-pointer"
        >
          <a className='text-lg'>
            Política de Protección de Datos Personales
            </a>
        </button>
      </div>

      {/* LÍNEA SEPARADORA INFERIOR */}
      <div className="mt-6 mx-auto pt-6 border-t border-gray-600"></div>
      

      {/* FRASE FINAL - ABAJO DE TODO */}
  <div className="mt-6  text-center text-xs text-gray-200">
        <p>
          Developed with <span className="text-red-500">❤</span> by{' '}
          <a
            href="https://barriosweb.cl/es"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer underline hover:text-white transition"
          >
            BABM
          </a>
        </p>
        
        {/* SELLO DE PAGO SEGURO */}
        <div className="mt-6 flex items-center justify-center gap-2 md:opacity-60 md:hover:opacity-100 transition-opacity">
          <span className="text-gray-400 text-[10px] uppercase tracking-widest">Pagos seguros con</span>
          <Image 
           src="/2.WebpayPlus_FN_300px.png" 
            alt="Webpay Plus" 
            width={80} 
            height={30} 
            className="h-8 w-auto object-contain "
          />
        </div>
      </div>

           {/* MODAL POLÍTICA DE PRIVACIDAD */}
      <PoliticaPrivacidadModal 
        isOpen={showPolitica} 
        onClose={() => setShowPolitica(false)} 
      />
    </footer>
  );
}