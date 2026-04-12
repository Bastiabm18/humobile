'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiCalendar } from 'react-icons/hi';
import CarruselEvento from './CarruselEvento';
import { EventoCalendario } from '@/types/profile';
interface CarruselEventosProps {
  eventos: EventoCalendario[];
  title?: string;
  onEventClick?: (evento: EventoCalendario) => void;
}

export default function CarruselEventosBase({ 
  eventos, 
  title = "Próximos Confirmados",
  onEventClick 
}: CarruselEventosProps) {
  const carruselRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScrollPosition = () => {
    if (carruselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carruselRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      
      const cardWidth = 340; // Ancho fijo de cada tarjeta + gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(Math.min(newIndex, eventos.length - 1));
    }
  };

  const scrollLeft = () => {
    if (carruselRef.current) {
      const cardWidth = 340;
      const newScrollLeft = carruselRef.current.scrollLeft - (cardWidth * 2);
      carruselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carruselRef.current) {
      const cardWidth = 340;
      const newScrollLeft = carruselRef.current.scrollLeft + (cardWidth * 2);
      carruselRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const scrollToIndex = (index: number) => {
    if (carruselRef.current) {
      const cardWidth = 340;
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
  }, [eventos.length]);

  if (eventos.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <HiCalendar className="text-2xl text-sky-600/70" />
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <div className="text-center py-12 bg-neutral-800/30 rounded-xl border border-neutral-700">
          <p className="text-neutral-400">No hay eventos próximos</p>
        </div>
      </div>
    );
  }

  const handleEventClick = (evento: EventoCalendario) => {
    if (onEventClick) {
      onEventClick(evento);
    } else {
      console.log('Evento clickeado:', evento);
    }
  };

  return (
    <div className="w-full mx-auto px-0 py-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HiCalendar className="text-2xl text-sky-600/70" />
        <h2 className="text-2xl font-bold text-white">Próximos Confirmados</h2>
        <span className="bg-neutral-700/50 text-neutral-300 text-sm px-3 py-1 rounded-full">
          {eventos.length}
        </span>
      </div>
      
      {/* Contenedor principal */}
      <div className="relative">
        {/* Botón izquierdo */}
        {showLeftButton && (
          <motion.button
            onClick={scrollLeft}
            className="
              absolute left-7 top-1/2 -translate-y-1/2 -translate-x-1/2
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

        {/* Carrusel - Contenedor con overflow visible */}
        <div className="relative">
          <div
            ref={carruselRef}
            className="
              flex overflow-x-auto gap-5 py-4
              w-full
              [&::-webkit-scrollbar]:hidden
              [-ms-overflow-style:none]
              [scrollbar-width:none]
              scroll-smooth
            "
            style={{ 
              justifyContent: 'flex-start',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {eventos.map((evento) => (
              <div key={evento.id} className="flex-shrink-0">
                <CarruselEvento
                  evento={evento}
                  onClick={handleEventClick}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Botón derecho */}
        {showRightButton && (
          <motion.button
            onClick={scrollRight}
            className="
              absolute right-7 top-1/2 -translate-y-1/2 translate-x-1/2
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

      {/* Indicadores de posición */}
      {eventos.length > 1 && (
        <div className="flex md:hidden flex-col items-center mt-5">
          <div className="flex gap-2">
            {eventos.map((_, index) => (
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
            {currentIndex + 1} de {eventos.length}
          </p>
        </div>
      )}
    </div>
  );
}