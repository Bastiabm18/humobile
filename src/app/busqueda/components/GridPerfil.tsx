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
  const carruselRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Función para codificar ID en base64url (URL-safe)
  const encodeId = (id: string): string => {
    const base64 = btoa(id);
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encodeProfileData = (id: string, type: ProfileType): string => {
    // Crear objeto con ambos datos
    const data = {
      id,
      type
    };
    // Convertir a JSON y codificar a base64url
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

  const checkScrollPosition = () => {
    if (carruselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carruselRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      
      const cardWidth = carruselRef.current.scrollWidth / items.length;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, items.length - 1));
    }
  };

  const scrollLeft = () => {
    carruselRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carruselRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (carruselRef.current) {
      const cardWidth = carruselRef.current.scrollWidth / items.length;
      carruselRef.current.scrollTo({ 
        left: index * cardWidth, 
        behavior: 'smooth' 
      });
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const currentRef = carruselRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollPosition);
      return () => currentRef.removeEventListener('scroll', checkScrollPosition);
    }
  }, [items.length]);

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
      {/* Header - Izquierda */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-sky-500"><FaPerson/></div>
        <h2 className="text-2xl font-bold text-white">Perfiles</h2>

      </div>
      
      {/* Contenedor principal - Alineado a la izquierda */}
      <div className="relative">


        {/* Carrusel - Alineado a la izquierda */}
        <div
          ref={carruselRef}
          className="
            grid grid-cols-2 md:grid-cols-7 gap-5 py-4 px-5
            w-[95vw]
            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            scroll-smooth
          "
          style={{ justifyContent: 'flex-start' }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="
                flex-shrink-0
                relative
                w-[150px] h-[250px]
                rounded-2xl
                overflow-hidden
                group
                cursor-pointer
                border border-neutral-700
                hover:border-sky-500/50
                transition-all duration-300
                flex flex-col
                bg-neutral-800/50
                shadow-lg shadow-black/30
              "
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
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
                  text-8xl
                ">
                  {/* Fallback icon basado en el tipo de perfil */}
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
                p-6
                text-left
              ">
                {/* Tipo */}
                <div className="
                  self-start
                  mb-3
                  px-3 py-1
                  bg-black/50
                  rounded-full
                  text-xs font-medium
                  text-sky-300
                  backdrop-blur-sm
                  border border-sky-500/30
                  group-hover:bg-sky-900/30
                  transition-colors
                ">
                  {item.tipo}
                </div>

                {/* Nombre */}
                <h3 className="
                  text-2xl font-bold text-white
                  leading-tight
                  text-left
                  drop-shadow-lg
                  group-hover:text-sky-300
                  transition-colors duration-300
                ">
                  {item.nombre}
                </h3>

                {/* Información adicional si existe */}
                {(item.ciudad_id || item.region_id) && (
                  <p className="
                    mt-2
                    text-neutral-300
                    text-sm
                    drop-shadow-md
                  ">
                    {item.ciudad_id || item.region_id}
                  </p>
                )}

                {/* Línea decorativa */}
                <div className="
                  mt-4
                  h-[2px] w-16
                  bg-gradient-to-r from-sky-500 to-sky-500/20
                  group-hover:w-24
                  transition-all duration-300
                  self-start
                " />
              </div>

              {/* Efecto hover brillo */}
              <div className="
                absolute inset-0
                rounded-2xl
                border-2 border-transparent
                group-hover:border-sky-500/30
                transition-colors duration-300
                pointer-events-none
              " />

              {/* Efecto de luz en hover */}
              <div className="
                absolute inset-0
                bg-gradient-to-tr from-transparent via-sky-500/5 to-transparent
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                pointer-events-none
              " />
            </motion.div>
          ))}
        </div>

   
      </div>

    </div>
  );
};

export default GridPerfil;