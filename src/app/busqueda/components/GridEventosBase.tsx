// app/perfil/components/GridEventosBase.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiCalendar } from 'react-icons/hi';
import GridEvento from './GridEvento';
import { EventoCalendario } from '@/types/profile'; // Asegúrate de que la ruta sea correcta
import { useRouter } from 'next/navigation';

interface GridEventosProps {
  eventos: EventoCalendario[];
  title?: string;
  onEventClick?: (evento: EventoCalendario) => void;
}

export default function GridEventosBase({ 
  eventos, 
  title = "Próximos Confirmados",
  onEventClick 
}: GridEventosProps) {
  const carruselRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  const checkScrollPosition = () => {
    if (carruselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carruselRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      
      const cardWidth = 300; // Ancho fijo de cada tarjeta + gap
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
        const encodedId = encodeEventId(evento.id);
      
      // Redirigir con el ID codificado
      router.push(`/evento?id=${encodedId}`);
    }
  };

    // Función para codificar el ID del evento
  const encodeEventId = (eventId: string): string => {
    // Crear objeto con el ID
    const data = { id: eventId };
    
    // Convertir a JSON y luego a base64
    const jsonString = JSON.stringify(data);
    const base64 = btoa(jsonString);
    
    // Convertir a base64url (seguro para URLs)
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  return (
    <div className="w-full border border-neutral-700/80 rounded-lg p-3  overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <HiCalendar className="text-3xl text-sky-600/70" />
        <h2 className="text-2xl font-bold text-white">Proximos Confirmados</h2>

      </div>
      
      {/* Contenedor principal */}
      <div className="flex items-center justify-center ">


        {/* C */}
        <div className="flex ">
          <div
            ref={carruselRef}
            className="
              grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-5 py-5 px-5
              w-[90vw]
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
              <div key={evento.id} className="flex">
                <GridEvento
                  evento={evento}
                  onClick={handleEventClick}
                />
              </div>
            ))}
            
            {/* Espacio extra al final para que se vea el último elemento */}
          
          </div>
        </div>


      </div>


    </div>
  );
}