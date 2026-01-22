'use client';

import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiMap } from 'react-icons/hi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { RiCalendarEventLine } from 'react-icons/ri';
import { EventoCalendario } from '@/types/profile';
import HSign from '@/app/components/HSign';

interface GridEventoProps {
  evento: EventoCalendario;
  onClick?: (evento: EventoCalendario) => void;
}

export default function GridEvento({ evento, onClick }: GridEventoProps) {
  const handleClick = () => {
    if (onClick) onClick(evento);
  };

  const getCategoryColor = () => {
    const categoria = evento.nombre_categoria?.toLowerCase() || '';
    if (categoria.includes('show') || categoria.includes('concierto')) {
      return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    }
    if (categoria.includes('reunion') || categoria.includes('reunión')) {
      return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    }
    return 'bg-neutral-600/20 text-neutral-400 border-neutral-500/30';
  };

  // Formatear fecha y hora usando los campos inicio y fin de EventoCalendario
  const fecha = format(new Date(evento.inicio), "EEEE d 'de' MMMM", { locale: es });
  const horaInicio = format(new Date(evento.inicio), "HH:mm");
  const horaFin = evento.fin ? format(new Date(evento.fin), "HH:mm") : 'Por confirmar';

  // Lugar: Prioriza nombre del lugar, luego dirección
  const lugar = evento.nombre_lugar || 
                evento.direccion_lugar || 
                'Por confirmar';

  // Flyer
  const imageUrl = evento.flyer_url || '';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        y: -5
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="
        
        relative
        w-[45vw] md:w-[220px] h-[200px] md:h-[240px]
        rounded-2xl
        overflow-hidden
        group
        cursor-pointer
        border border-neutral-700
        hover:border-blue-500/50
        transition-all duration-300
        flex flex-col
        bg-neutral-800/50
        shadow-lg shadow-black/30
      "
    >
      {/* Imagen de fondo */}
      {imageUrl ? (
        <div className="absolute inset-0">
          <img 
            src={imageUrl} 
            alt={evento.titulo}
            className="
              w-full h-full object-cover
              group-hover:scale-110
              transition-transform duration-700
            "
          />
        </div>
      ) : (
        <div className="
          absolute flex items-center justify-center inset-0 
          bg-gradient-to-br from-neutral-800 to-neutral-900
          text-neutral-600
        " >
          <HSign/>
        </div>
      )}

      {/* Overlay oscuro para legibilidad */}
      <div className="
        absolute inset-0
        bg-gradient-to-t from-black/95 via-black/60 to-transparent
        group-hover:via-black/50
        transition-all duration-300
      " />

      {/* Contenido */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 text-left">
        {/* Categoría */}
        <div className="self-start mb-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getCategoryColor()}`}>
            {evento.nombre_categoria || 'Evento'}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg group-hover:text-blue-300 transition-colors duration-300 mb-3 line-clamp-2">
          {evento.titulo}
        </h3>

        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-neutral-300 mb-2">
          <HiCalendar className="w-4 h-4 text-blue-500" />
          <span className="text-sm capitalize">{fecha}</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-300 mb-3">
          <HiClock className="w-4 h-4 text-blue-500" />
          <span className="text-sm">{horaInicio} - {horaFin}</span>
        </div>

        {/* Lugar */}
        <div className="flex items-center gap-2 text-neutral-300 mb-4">
          <HiMap className="w-4 h-4 text-blue-500" />
          <span className="text-sm truncate">{lugar}</span>
        </div>

        {/* Línea decorativa */}
        <div className="h-[2px] w-16 bg-gradient-to-r from-blue-500 to-transparent group-hover:w-24 transition-all duration-300 self-start" />
      </div>

      {/* Borde de resalte en Hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-500/30 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}