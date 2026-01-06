'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface CarruselItem {
  id: string;
  name: string;
  imageUrl?: string;
  fallbackIcon: React.ReactNode;
  type?: string;
}

interface CarruselProps {
  items: CarruselItem[];
  title: string;
  icon: React.ReactNode;
}

const CarruselBase: React.FC<CarruselProps> = ({ items, title, icon }) => {
  const carruselRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
   const router = useRouter();

  // console.log(items)
    // Función para codificar ID en base64url (URL-safe)
  const encodeId = (id: string): string => {
    // btoa para navegador, Buffer para Node
    const base64 = btoa(id);
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encodeProfileData = (id: string, type: 'artista' | 'banda' | 'lugar'): string => {
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

  

    const handleItemClick = (item:CarruselItem) => {
  const encodedData = encodeProfileData(item.id, item.type as 'artista' | 'banda' | 'lugar');
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
          {icon}
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="text-center py-12 bg-neutral-800/30 rounded-xl border border-neutral-700">
          <p className="text-neutral-400">No hay {title.toLowerCase()} disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[95vw] mx-auto px-4 py-8">
      {/* Header - Izquierda */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-sky-500">{icon}</div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <span className="bg-neutral-700/50 text-neutral-300 text-sm px-3 py-1 rounded-full">
          {items.length}
        </span>
      </div>
      
      {/* Contenedor principal - Alineado a la izquierda */}
      <div className="relative">
        {/* Botón izquierdo */}
        {showLeftButton && (
          <motion.button
            onClick={scrollLeft}
            className="
              absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2
              z-20
              bg-neutral-800/90 border border-neutral-700
              rounded-full p-3
              shadow-2xl shadow-black/50
              hover:bg-neutral-700 hover:border-neutral-600
              transition-all duration-200
              backdrop-blur-sm
              hidden md:flex items-center justify-center
            "
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
        )}

        {/* Carrusel - Alineado a la izquierda */}
        <div
          ref={carruselRef}
          className="
            flex overflow-x-auto gap-5 py-4
            w-[90vw]
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
                w-[280px] h-[560px]
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
              {item.imageUrl ? (
                <div className="absolute inset-0">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
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
                  {item.fallbackIcon}
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
                {/* Tipo (si existe) */}
                {item.type && (
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
                    {item.type}
                  </div>
                )}

                {/* Nombre */}
                <h3 className="
                  text-2xl font-bold text-white
                  leading-tight
                  text-left
                  drop-shadow-lg
                  group-hover:text-sky-300
                  transition-colors duration-300
                ">
                  {item.name}
                </h3>

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

        {/* Botón derecho */}
        {showRightButton && (
          <motion.button
            onClick={scrollRight}
            className="
              absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
              z-20
              bg-neutral-800/90 border border-neutral-700
              rounded-full p-3
              shadow-2xl shadow-black/50
              hover:bg-neutral-700 hover:border-neutral-600
              transition-all duration-200
              backdrop-blur-sm
              hidden md:flex items-center justify-center
            "
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <HiChevronRight className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </div>

      {/* Indicadores de posición - Centrados */}
      {items.length > 1 && (
        <div className="flex flex-col items-center mt-8">
          <div className="flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentIndex 
                    ? 'bg-sky-500 w-6 scale-110' 
                    : 'bg-neutral-600 hover:bg-neutral-500'
                  }
                `}
              />
            ))}
          </div>
          
          <p className="mt-3 text-sm text-neutral-400">
            {currentIndex + 1} de {items.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default CarruselBase;