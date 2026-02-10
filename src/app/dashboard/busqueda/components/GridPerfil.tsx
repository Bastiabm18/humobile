'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { Profile, ProfileType } from '@/types/profile'; 
import { FaPerson } from 'react-icons/fa6';
import HSign from '@/app/components/HSign';

interface GridPerfilProps {
  items: Profile[];
}

const GridPerfil: React.FC<GridPerfilProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Función para codificar datos del perfil
  const encodeProfileData = (id: string, type: ProfileType): string => {
    const data = {
      id,
      type
    };
    const jsonString = JSON.stringify(data);
    return btoa(jsonString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleItemClick = (item: Profile) => {
    const encodedData = encodeProfileData(item.id, item.tipo);
    router.push(`/perfil?perfil=${encodedData}`);
  };

  if (items.length === 0) {
    return (
      <div className="w-full max-w-screen mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FaPerson/>
          <h2 className="text-2xl font-bold text-white">Perfiles</h2>
        </div>
        <div className="text-center py-12 bg-neutral-800/30 rounded-xl border border-neutral-700">
          <p className="text-neutral-400">No hay Perfiles disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-neutral-700/80 rounded-lg max-w-[95vw] mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-orange-500"><FaPerson/></div>
        <h2 className="text-2xl font-bold text-white">Perfiles</h2>
      </div>
      
      {/* GRID ESTÁTICO - 2 columnas en móvil, 7 en desktop */}
      <div className="
        grid 
        grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        xl:grid-cols-5 
        2xl:grid-cols-7 
        gap-4 
        py-5 
        px-1
        w-full
        auto-rows-auto
      ">
        {items.map((item) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              y: -5
            }}
            whileTap={{ scale: 0.98 }}
            key={item.id}
            className="
              relative
              w-full
              aspect-[3/4]
              rounded-2xl
              overflow-hidden
              group
              cursor-pointer
              border border-neutral-700
              hover:border-orange-500/50
              transition-all duration-300
              flex flex-col
              bg-neutral-800/50
              shadow-lg shadow-black/30
              min-w-0
            "
            onClick={() => handleItemClick(item)}
          >
            {/* Imagen de fondo */}
            {item.imagen_url ? (
              <div className="absolute inset-0">
                <img 
                  src={item.imagen_url} 
                  alt={item.nombre}
                  className="
                    w-full h-full object-cover
                    group-hover:scale-110
                    transition-transform duration-700
                    opacity-80
                  "
                />
              </div>
            ) : (
              <div className="
                absolute inset-0 
                bg-gradient-to-br from-neutral-800 to-neutral-900
                flex items-center justify-center
                text-neutral-600
                text-6xl md:text-8xl
              ">
                <HSign />
              </div>
            )}

            {/* Overlay oscuro */}
            <div className="
              absolute inset-0
              bg-gradient-to-t from-black/95 via-black/50 to-transparent
              group-hover:bg-gradient-to-t from-black/90 via-black/40 to-transparent
              transition-all duration-300
            " />

            {/* Contenido - Abajo izquierda */}
            <div className="
              relative z-10
              flex-1 flex flex-col justify-end
              p-3 md:p-4 lg:p-5
              text-left
            ">
              {/* Tipo */}
              <div className="
                self-start
                mb-2
                px-2 md:px-3 py-1
                bg-black/50
                rounded-full
                text-xs font-medium
                text-orange-300
                backdrop-blur-sm
                border border-orange-500/30
                group-hover:bg-orange-900/30
                transition-colors
                max-w-full
                truncate
              ">
                {item.tipo}
              </div>

              {/* Nombre */}
              <h3 className="
                text-base md:text-lg lg:text-xl font-bold text-white
                leading-tight
                text-left
                drop-shadow-lg
                group-hover:text-orange-300
                transition-colors duration-300
                line-clamp-2
              ">
                {item.nombre}
              </h3>

              {/* Información adicional si existe */}
              {(item.ciudad_id || item.region_id) && (
                <p className="
                  mt-1 md:mt-2
                  text-neutral-300
                  text-xs md:text-sm
                  drop-shadow-md
                  truncate
                ">
                  {item.ciudad_id || item.region_id}
                </p>
              )}

              {/* Línea decorativa */}
              <div className="
                mt-2 md:mt-3
                h-[2px] w-12 md:w-16
                bg-gradient-to-r from-orange-500 to-orange-500/20
                group-hover:w-16 md:group-hover:w-24
                transition-all duration-300
                self-start
              " />
            </div>

            {/* Efecto hover brillo */}
            <div className="
              absolute inset-0
              rounded-2xl
              border-2 border-transparent
              group-hover:border-orange-500/30
              transition-colors duration-300
              pointer-events-none
            " />

            {/* Efecto de luz en hover */}
            <div className="
              absolute inset-0
              bg-gradient-to-tr from-transparent via-orange-500/5 to-transparent
              opacity-0 group-hover:opacity-100
              transition-opacity duration-500
              pointer-events-none
            " />
          </motion.div>
        ))}
      </div>

      {/* Controles de navegación - ELIMINADOS porque es GRID, no carrusel */}
    </div>
  );
};

export default GridPerfil;