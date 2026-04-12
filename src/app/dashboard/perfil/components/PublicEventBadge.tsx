
'use client';

import { FaCheckCircle } from 'react-icons/fa';
import { HiCalendar, HiLockClosed } from 'react-icons/hi';
import { EventoCalendario } from '@/types/profile';
import { FaCalendar } from 'react-icons/fa6';

interface PublicEventBadgeProps {
  events: EventoCalendario[];
  profile: {
    id: string;
    tipo: string;
    nombre: string;
  };
  date: Date;
  view: string;
  slotTime?: Date;
  onEventClick?: (event: EventoCalendario) => void;
  onMultipleEventsClick?: (events: EventoCalendario[], date: Date) => void;
  onBlockClick?: (blockEvent: EventoCalendario) => void;
  esColumnaHora?: boolean;
}

export default function PublicEventBadge({
  events,
  profile,
  date,
  view,
  slotTime,
  onEventClick,
  onMultipleEventsClick,
  onBlockClick,
  esColumnaHora = false,
}: PublicEventBadgeProps) {
  // NO RENDERIZAR NADA EN LA COLUMNA DE HORAS
  if (esColumnaHora) {
    return null;
  }
  
  if (!date || (view !== 'month' && !slotTime)) {
    return null;
  }
  
  if (events.length === 0) return null;

  // Filtrar eventos normales y bloqueos (misma lógica que EventBadge)
  const normalEvents = events.filter(event => !event.es_bloqueo);
  const blockedEvents = events.filter(event => {
    if (!event.es_bloqueo) return false;
    if (profile.tipo === 'banda') return true;
    return event.id_creador === profile.id;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
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

  // VISTA MES (igual que EventBadge pero sin botones de crear)
  if (view === 'month') {
    const hasBlocked = blockedEvents.length > 0;
    const hasNormal = normalEvents.length > 0;
    const totalEvents = blockedEvents.length + normalEvents.length;

    return (
      <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
        {totalEvents === 1 && (
          <div>
            {hasNormal && !hasBlocked && (
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

            {hasBlocked && !hasNormal && (
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
                    <span className="hidden md:inline text-red-200/90 font-medium text-xs">BLOQUEADO</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {totalEvents >= 2 && totalEvents <= 3 && (
          <div>
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
                      <img alt="flyer" src={event.flyer_url} className='object-cover w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30' />
                    ) : (
                      <FaCheckCircle size={18} className="md:mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white/95 font-medium mb-0.5">{event.titulo}</div>
                    <div className="hidden md:flex text-xs text-white/70">{formatTime(event.inicio)} - {formatTime(event.fin)}</div>
                  </div>
                </div>
              </div>
            ))}

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

            {totalEvents >= 2 && (
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
                    <span className="text-sm md:text-lg font-bold">{totalEvents}+</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                <span className="text-2xl md:text-4xl font-bold">{totalEvents}+</span>
                <span className="hidden md:inline text-yellow-200/90 text-sm font-medium">EVENTOS</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // VISTAS SEMANA y DÍA (copia exacta de EventBadge)
  const relevantEvents = events.filter(event => {
    if (!slotTime || !date) return false;

    const inicioEvento = event.inicio as unknown as string;
    const finEvento = (event.fin as unknown as string) || inicioEvento;
    
    if (slotTime instanceof Date) {
      const slotTimestamp = slotTime.getTime();
      const inicioTimestamp = new Date(inicioEvento).getTime();
      const finTimestamp = new Date(finEvento).getTime();
      return slotTimestamp >= inicioTimestamp && slotTimestamp < finTimestamp;
    }
    
    const slotString = slotTime as string;
    return slotString >= inicioEvento && slotString < finEvento;
  });

  if (relevantEvents.length === 0) return null;

  const getEventoStylesVistaSemana = (estado?: string, es_de_banda: boolean = false) => {
    if (es_de_banda) {
      switch (estado) {
        case 'pendiente':
          return { bg: 'bg-orange-600/30 hover:bg-orange-700', border: 'border-orange-500', icon: 'text-orange-200', text: 'text-orange-200/90' };
        case 'rechazado':
          return { bg: 'bg-red-600/30 hover:bg-red-700', border: 'border-red-500', icon: 'text-red-200', text: 'text-red-200/90' };
        case 'confirmado':
          return { bg: 'bg-green-700/30 hover:bg-green-800', border: 'border-green-500', icon: 'text-green-200', text: 'text-green-200/90' };
        default:
          return { bg: 'bg-gray-800/30 hover:bg-gray-700', border: 'border-gray-500', icon: 'text-gray-200', text: 'text-gray-200/90' };
      }
    } else {
      switch (estado) {
        case 'pendiente':
          return { bg: 'bg-orange-600/30 hover:bg-orange-700', border: 'border-orange-500', icon: 'text-orange-200', text: 'text-orange-200/90' };
        case 'rechazado':
          return { bg: 'bg-red-600/30 hover:bg-red-700', border: 'border-red-500', icon: 'text-red-200', text: 'text-red-200/90' };
        case 'confirmado':
          return { bg: 'bg-sky-700/30 hover:bg-sky-800', border: 'border-sky-500', icon: 'text-sky-200', text: 'text-sky-200/90' };
        default:
          return { bg: 'bg-gray-800/30 hover:bg-gray-700', border: 'border-gray-500', icon: 'text-gray-200', text: 'text-gray-200/90' };
      }
    }
  };

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
      {totalRelevantEvents >= 2 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-yellow-900/50 hover:bg-yellow-950 rounded-md border-2 border-yellow-700 pointer-events-auto cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">{totalRelevantEvents} +</div>
            </div>
          </div>
        </div>
      )}

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
              <HiLockClosed size={view === 'day' ? 24 : 18} className="text-red-300 mx-auto" />
            </div>
          </div>
        </div>
      )}

      {relevantNormalEvents.length > 0 && totalRelevantEvents === 1 && (
        <div className="absolute inset-0 z-40 p-0.5 flex items-center justify-center">
          {relevantNormalEvents.map((event) => {
            const styles = getEventoStylesVistaSemana(
              event.estado_participacion,
              event.es_evento_banda
            );
            
            return (
              <div
                key={event.id}
                className={`absolute w-[99%] h-[90%] rounded-lg pointer-events-auto cursor-pointer transition-all ${styles.bg} border-l-4 ${styles.border}`}
                title={`${event.titulo}\n${formatTime(event.inicio)} - ${formatTime(event.fin)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEventClick) onEventClick(event);
                }}
              >
                <div className="p-0.5 h-full flex flex-col justify-center overflow-hidden">
                  <div className="text-[10px] text-white font-medium truncate px-0.5 flex items-center gap-1">
                    {event.flyer_url ? (
                      <img 
                        src={event.flyer_url} 
                        alt="flyer"
                        className="w-6 h-6 rounded-full object-cover border border-white/20 mr-1"
                      />
                    ) : (
                      <FaCheckCircle size={8} className={styles.icon} />
                    )}
                    <span>{formatEventTitle(event.titulo)}</span>
                  </div>
                  {totalRelevantEvents === 1 && (
                    <div className={`text-[9px] truncate px-0.5 mt-0.5 ${styles.text}`}>
                      {formatTime(event.inicio)} - {formatTime(event.fin)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatEventTitle(title: string): string {
  if (title.length <= 10) return title;
  return title.substring(0, 8) + '...';
}