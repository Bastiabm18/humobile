// app/perfil/components/CarruselEvento.tsx
'use client';

import { motion } from 'framer-motion';
import { HiCalendar, HiClock, HiMap } from 'react-icons/hi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventoCalendario } from '@/types/profile';
import { FaTasks } from 'react-icons/fa';
import { RiCalendarEventLine } from 'react-icons/ri';

interface CarruselEventoProps {
  evento: EventoCalendario;
  onClick?: (evento: EventoCalendario) => void;
}

export default function CarruselEvento({ evento, onClick }: CarruselEventoProps) {
  const handleClick = () => {
    if (onClick) onClick(evento);
  };

  // Usar valores por defecto para estadísticas opcionales
  const totalParticipantes = evento.total_participantes || 0;
  const confirmados = evento.confirmados || 0;
  
  const getCategoryColor = () => {
    switch (evento.nombre_categoria?.toLowerCase()) {
      case 'show':
      case 'concierto':
      case 'conciertos':
        return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'reunión':
      case 'reunion':
      case 'reuniones':
        return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'festival':
        return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
      case 'privado':
      case 'private':
        return 'bg-green-600/20 text-green-400 border-green-500/30';
      default: 
        return 'bg-neutral-600/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getCategoryLabel = () => {
    if (evento.nombre_categoria) {
      return evento.nombre_categoria;
    }
    
    const titleLower = evento.titulo.toLowerCase();
    if (titleLower.includes('concierto') || titleLower.includes('show') || titleLower.includes('conciertos')) {
      return 'Concierto';
    }
    if (titleLower.includes('reunión') || titleLower.includes('reunion')) {
      return 'Reunión';
    }
    if (titleLower.includes('festival')) {
      return 'Festival';
    }
    
    return 'Evento';
  };

  // Formatear fecha y hora - USAR evento.inicio y evento.fin
  // Primero asegurarse de que son fechas válidas
  const inicioDate = evento.inicio instanceof Date ? evento.inicio : new Date(evento.inicio);
  const finDate = evento.fin instanceof Date ? evento.fin : new Date(evento.fin);
  
  // Verificar si las fechas son válidas
  const isValidInicio = !isNaN(inicioDate.getTime());
  const isValidFin = !isNaN(finDate.getTime());
  
  const fecha = isValidInicio ? format(inicioDate, "EEEE d 'de' MMMM", { locale: es }) : 'Fecha no disponible';
  const horaInicio = isValidInicio ? format(inicioDate, "HH:mm") : '--:--';
  const horaFin = isValidFin ? format(finDate, "HH:mm") : '--:--';

  // Lugar
  const lugar = evento.nombre_lugar || evento.direccion_lugar || 'Por confirmar';

  // Flyer o imagen
  const imageUrl = evento.flyer_url || '';

  // Verificar si hay estadísticas disponibles
  const tieneEstadisticas = totalParticipantes > 0;
  const todosConfirmados = tieneEstadisticas && confirmados === totalParticipantes;
  
  // Crear título con estadísticas de confirmación (solo si hay datos)
  const tituloConEstadisticas = tieneEstadisticas
    ? `${evento.titulo} (${confirmados}/${totalParticipantes} ✓)`
    : evento.titulo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        y: -5
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="
        flex-shrink-0
        relative
        w-[300px] md:w-[320px] h-[480px]
        rounded-2xl
        overflow-hidden
        group
        cursor-pointer
        border border-neutral-700
        hover:border-red-500/50
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
              w-full h-full object-fill
              group-hover:scale-110
              transition-transform duration-700
            "
          />
        </div>
      ) : (
        <div className="
          absolute flex items-center justify-center inset-0 
          bg-gradient-to-br from-neutral-800 to-neutral-900
        " >
           <RiCalendarEventLine size={120} />
        </div>
      )}

      {/* Overlay oscuro */}
      <div className="
        absolute inset-0
        bg-gradient-to-t from-black/95 via-black/60 to-transparent
        group-hover:bg-gradient-to-t from-black/90 via-black/50 to-transparent
        transition-all duration-300
      " />

      {/* Contenido */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 text-left">
        {/* Categoría */}
        <div className="self-start mb-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border ${getCategoryColor()}`}>
            {getCategoryLabel()}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg group-hover:text-red-300 transition-colors duration-300 mb-3">
          {tituloConEstadisticas}
        </h3>

        {/* Estadísticas de confirmación (solo si hay datos) */}
        {tieneEstadisticas && (
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <FaTasks className="w-4 h-4" />
            <span className="text-sm">
              {confirmados} de {totalParticipantes} confirmados
            </span>
          </div>
        )}

        {/* Fecha y hora */}
        <div className="flex items-center gap-2 text-neutral-300 mb-2">
          <HiCalendar className="w-4 h-4" />
          <span className="text-sm">{fecha}</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-300 mb-3">
          <HiClock className="w-4 h-4" />
          <span className="text-sm">{horaInicio} - {horaFin}</span>
        </div>

        {/* Lugar */}
        {lugar && (
          <div className="flex items-center gap-2 text-neutral-300 mb-4">
            <HiMap className="w-4 h-4" />
            <span className="text-sm truncate">{lugar}</span>
          </div>
        )}

        {/* Línea decorativa */}
        <div className="h-[2px] w-16 bg-gradient-to-r from-red-500 to-red-500/20 group-hover:w-24 transition-all duration-300 self-start" />
      </div>

      {/* Badge de confirmación si todos están confirmados */}
      {todosConfirmados && (
        <div className="absolute top-4 right-4 z-20">
          <div className="px-2 py-1 bg-green-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full flex items-center gap-1">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            100% Confirmado
          </div>
        </div>
      )}

      {/* Efectos */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-500/30 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}