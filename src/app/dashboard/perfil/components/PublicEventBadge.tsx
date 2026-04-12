// components/calendar/PublicEventBadge.tsx
'use client';

import { FaCheckCircle } from 'react-icons/fa';
import { HiCalendar, HiLockClosed } from 'react-icons/hi';
import { EventoCalendario } from '@/types/profile';

interface PublicEventBadgeProps {
  events: EventoCalendario[];
  profile: {
    id: string;
    tipo: string;
    nombre: string;
  };
  date: Date;
  view: string;
  onEventClick?: (event: EventoCalendario) => void;
  onMultipleEventsClick?: (events: EventoCalendario[], date: Date) => void;
  onBlockClick?: (blockEvent: EventoCalendario) => void;
}

export default function PublicEventBadge({
  events,
  profile,
  date,
  view,
  onEventClick,
  onMultipleEventsClick,
  onBlockClick,
}: PublicEventBadgeProps) {
  // Validaciones iniciales
  if (!date || events.length === 0) return null;

  // Filtrar eventos según tipo y permisos públicos
  const normalEvents = events.filter(event => !event.es_bloqueo);
  const blockedEvents = events.filter(event => {
    if (!event.es_bloqueo) return false;
    // En vista pública, los bloqueos solo se muestran si son del perfil o si es banda
    if (profile.tipo === 'banda') return true;
    return event.id_creador === profile.id;
  });

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEventoClassName = (estado?: string, es_de_banda: boolean = false) => {
    if (es_de_banda) {
      switch (estado) {
        case 'pendiente': return 'bg-orange-600/50 hover:bg-orange-700 border-l-4 border-orange-500';
        case 'rechazado': return 'bg-red-600/50 hover:bg-red-700 border-l-4 border-red-500';
        case 'confirmado': return 'bg-green-700/50 hover:bg-green-800 border-l-4 border-green-500';
        default: return 'bg-gray-800/50 hover:bg-gray-700 border-l-4 border-gray-500';
      }
    } else {
      switch (estado) {
        case 'pendiente': return 'bg-orange-600/50 hover:bg-orange-700 border-l-4 border-orange-500';
        case 'rechazado': return 'bg-red-600/50 hover:bg-red-700 border-l-4 border-red-500';
        case 'confirmado': return 'bg-sky-700/50 hover:bg-sky-800 border-l-4 border-sky-500';
        default: return 'bg-gray-800/50 hover:bg-gray-700 border-l-4 border-gray-500';
      }
    }
  };

  const getBloqueoClassName = () => {
    return 'bg-red-800/50 hover:bg-red-800/60 border-l-4 border-red-500';
  };

  // Vista MES
  if (view === 'month') {
    const hasBlocked = blockedEvents.length > 0;
    const hasNormal = normalEvents.length > 0;
    const totalEvents = blockedEvents.length + normalEvents.length;

    return (
      <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
        {/* Un solo evento normal */}
        {totalEvents === 1 && hasNormal && !hasBlocked && (
          <div className="mb-0.5 flex w-full h-full">
            <div
              className={`text-xs md:text-sm truncate px-1.5 py-1 rounded-md ${getEventoClassName(
                normalEvents[0].estado_participacion, 
                normalEvents[0].es_evento_banda
              )} text-white font-medium w-full h-10 md:h-20 cursor-pointer transition-colors flex items-center group`}
              title={`${normalEvents[0].titulo} (${formatTime(normalEvents[0].inicio)} - ${formatTime(normalEvents[0].fin)})`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onEventClick) onEventClick(normalEvents[0]);
              }}
            >
              <div className="flex items-center md:items-start gap-1.5 w-full min-w-0 px-1">
                <div className='hidden md:flex flex-shrink-0 pt-0.5'>
                  {normalEvents[0].flyer_url ? (
                    <img 
                      alt="flyer" 
                      src={normalEvents[0].flyer_url} 
                      className='object-cover w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30' 
                    />
                  ) : (
                    <FaCheckCircle size={18} className="md:mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-white/95 font-medium mb-0.5">
                    {normalEvents[0].titulo}
                  </div>
                  <div className="hidden md:flex text-xs text-white/70">
                    {formatTime(normalEvents[0].inicio)} - {formatTime(normalEvents[0].fin)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Un solo bloqueo */}
        {totalEvents === 1 && hasBlocked && !hasNormal && (
          <div className="mb-0.5 flex">
            <div
              className={`text-xs md:text-sm rounded-md ${getBloqueoClassName()} text-white font-semibold shadow-sm hover:shadow cursor-pointer items-center justify-center w-full h-10 md:h-20 flex group border-l-4`}
              title={`Día bloqueado: ${blockedEvents[0].motivo_bloqueo || 'Sin motivo'}`}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onBlockClick) onBlockClick(blockedEvents[0]);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                <HiLockClosed size={28} className='text-red-300 group-hover:text-red-200 transition-colors' />
                <span className="hidden md:inline text-red-200/90 font-medium text-xs">
                  BLOQUEADO
                </span>
                {blockedEvents[0].motivo_bloqueo && (
                  <div className="hidden md:flex text-center">
                    <span className="text-red-300/70 text-[10px] leading-tight max-w-[120px] truncate px-1">
                      {blockedEvents[0].motivo_bloqueo.slice(0, 5)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Múltiples eventos (2-3) */}
        {totalEvents >= 2 && totalEvents <= 3 && (
          <div>
            {/* Mostrar eventos normales */}
            {normalEvents.slice(0, hasBlocked ? 1 : 2).map((event, index) => (
              <div
                key={event.id || index}
                className={`text-xs md:text-sm mb-0.5 truncate px-1.5 py-1 rounded-md ${getEventoClassName(
                  event.estado_participacion, 
                  event.es_evento_banda
                )} text-white font-medium cursor-pointer transition-colors flex items-center justify-center h-6.5 md:h-12.5 group border-l-2`}
                title={`${event.titulo} (${formatTime(event.inicio)} - ${formatTime(event.fin)})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEventClick) onEventClick(event);
                }}
              >
                <div className="flex items-center md:items-start gap-1.5 w-full min-w-0 px-1">
                  <div className='hidden md:flex flex-shrink-0 pt-0.5'>
                    {event.flyer_url ? (
                      <img 
                        alt="flyer" 
                        src={event.flyer_url} 
                        className='object-cover w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30' 
                      />
                    ) : (
                      <FaCheckCircle size={18} className="md:mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white/95 font-medium mb-0.5">
                      {event.titulo}
                    </div>
                    <div className="hidden md:flex text-xs text-white/70">
                      {formatTime(event.inicio)} - {formatTime(event.fin)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mostrar bloqueos */}
            {blockedEvents.slice(0, hasNormal ? 1 : 2).map((event, index) => (
              <div
                key={event.id || index}
                className={`text-xs md:text-sm mb-0.5 rounded-md ${getBloqueoClassName()} text-white font-medium shadow-sm cursor-pointer items-center justify-center w-full h-6.5 md:h-12.5 flex border-l-2`}
                title={`Día bloqueado: ${event.motivo_bloqueo || 'Sin motivo'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBlockClick) onBlockClick(event);
                }}
              >
                <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                  <HiLockClosed size={18} className='text-red-300 group-hover:text-red-200 transition-colors' />
                </div>
              </div>
            ))}

            {/* Botón de más eventos */}
            <div className="mb-0.5 cursor-pointer flex justify-center">
              <div 
                className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-6.5 md:h-14 bg-yellow-600/50 hover:bg-yellow-700 text-yellow-50 font-bold border-l-2 border-yellow-500"
                title={`${totalEvents} eventos en este día`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMultipleEventsClick) onMultipleEventsClick(events, date);
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm md:text-lg font-bold">
                    {totalEvents}+
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Más de 3 eventos */}
        {totalEvents > 3 && (
          <div className="mb-0.5 cursor-pointer flex justify-center">
            <div 
              className="text-[10px] md:text-xl px-2 py-0.5 w-full items-center justify-center flex rounded-md h-21 md:h-40.5 bg-yellow-600/50 hover:bg-yellow-700 text-yellow-50 font-bold border-l-4 border-yellow-500"
              title={`${totalEvents} eventos en este día`}
              onClick={(e) => {
                e.stopPropagation();
                if (onMultipleEventsClick) onMultipleEventsClick(events, date);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-2xl md:text-4xl font-bold">
                  {totalEvents}+
                </span>
                <span className="hidden md:inline text-yellow-200/90 text-sm font-medium">
                  EVENTOS
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista SEMANA
  // Filtrar eventos para el slot horario específico
  const relevantEvents = events.filter(event => {
    if (!date) return false;

    const inicioEvento = new Date(event.inicio);
    const finEvento = event.fin ? new Date(event.fin) : inicioEvento;
    const slotDate = new Date(date);

    // Comparar por fecha y hora exacta
    return slotDate >= inicioEvento && slotDate < finEvento;
  });

  if (relevantEvents.length === 0) return null;

  const relevantBlockedEvents = relevantEvents.filter(event => {
    if (!event.es_bloqueo) return false;
    if (profile.tipo === 'banda') return true;
    return event.id_creador === profile.id;
  });

  const relevantNormalEvents = relevantEvents.filter(event => !event.es_bloqueo);
  const hasBlocked = relevantBlockedEvents.length > 0;
  const totalRelevantEvents = relevantEvents.length;

  return (
    <div className="absolute flex w-full h-full items-center justify-center inset-0 z-30">
      {/* Múltiples eventos en el mismo slot */}
      {totalRelevantEvents >= 2 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-yellow-900/50 hover:bg-yellow-950 rounded-md border-2 border-yellow-700 pointer-events-auto cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white font-bold">
                {totalRelevantEvents} eventos
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bloqueo */}
      {hasBlocked && totalRelevantEvents === 1 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg w-[99%] h-[99%] bg-red-900/50 hover:bg-red-950 border-2 border-red-700 pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onBlockClick && relevantBlockedEvents[0]) {
              onBlockClick(relevantBlockedEvents[0]);
            }
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <HiLockClosed size={24} className="text-red-300 mx-auto" />
              <span className="text-white text-xs hidden md:inline">Bloqueado</span>
            </div>
          </div>
        </div>
      )}

      {/* Evento normal único */}
      {relevantNormalEvents.length > 0 && totalRelevantEvents === 1 && (
        <div className="absolute inset-0 z-40 p-0.5 flex items-center justify-center">
          {relevantNormalEvents.map((event) => (
            <div
              key={event.id}
              className={`w-[99%] h-[90%] rounded-lg pointer-events-auto cursor-pointer transition-all ${getEventoClassName(
                event.estado_participacion, 
                event.es_evento_banda
              )} border-l-4 flex items-center justify-center p-1`}
              title={`${event.titulo}\n${formatTime(event.inicio)} - ${formatTime(event.fin)}`}
              onClick={(e) => {
                e.stopPropagation();
                if (onEventClick) onEventClick(event);
              }}
            >
              <div className="flex items-center gap-1 w-full overflow-hidden">
                {event.flyer_url ? (
                  <img 
                    src={event.flyer_url} 
                    alt="flyer"
                    className="w-6 h-6 rounded-full object-cover border border-white/20 flex-shrink-0"
                  />
                ) : (
                  <FaCheckCircle size={16} className="text-white flex-shrink-0" />
                )}
                <span className="text-white text-xs font-medium truncate">
                  {event.titulo}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}