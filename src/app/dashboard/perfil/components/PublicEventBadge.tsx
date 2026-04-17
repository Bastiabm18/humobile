'use client';

import { FaCheckCircle, FaEyeSlash } from 'react-icons/fa';
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
  if (esColumnaHora) return null;
  if (!date || (view !== 'month' && !slotTime)) return null;
  if (events.length === 0) return null;

  // =============================================
  // FILTRAR: PÚBLICOS vs PRIVADOS vs BLOQUEOS
  // =============================================
  const eventosPublicos = events.filter(event => !event.es_bloqueo && event.es_publico === true);
  const eventosPrivados = events.filter(event => !event.es_bloqueo && (event.es_publico === false || event.es_publico === undefined));
  const blockedEvents = events.filter(event => {
    if (!event.es_bloqueo) return false;
    if (profile.tipo === 'banda') return true;
    return event.id_creador === profile.id;
  });

  // Contadores para lógica de renderizado
  const totalVisibles = eventosPublicos.length + eventosPrivados.length + blockedEvents.length;
  const tienePrivados = eventosPrivados.length > 0;
  const tienePublicos = eventosPublicos.length > 0;
  const tieneBloqueos = blockedEvents.length > 0;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Solo para eventos públicos
  const getEventoClassName = (estado?: string, es_de_banda: boolean = false) => {
    if (es_de_banda) {
      switch (estado) {
        case 'pendiente': return 'bg-orange-600/50 hover:bg-orange-700 border-l-4 border-orange-500';
        case 'rechazado': return 'bg-red-600/50 hover:bg-red-700 border-l-4 border-red-500';
        case 'confirmado': return 'bg-green-700/50 hover:bg-green-700 border-l-4 border-green-500';
        default: return 'bg-gray-800/50 hover:bg-gray-700 border-l-4 border-gray-500';
      }
    } else {
      switch (estado) {
        case 'pendiente': return 'bg-orange-600/50 hover:bg-orange-700 border-l-4 border-orange-500';
        case 'rechazado': return 'bg-red-600/50 hover:bg-red-700 border-l-4 border-red-500';
        case 'confirmado': return 'bg-sky-700/50 hover:bg-sky-700 border-l-4 border-sky-500';
        default: return 'bg-gray-800/50 hover:bg-gray-700 border-l-4 border-gray-500';
      }
    }
  };

  const getBloqueoClassName = () => {
    return 'bg-red-800/50 hover:bg-red-800/60 border-l-4 border-red-500';
  };

  // Estilo genérico para eventos privados
  const getPrivadoClassName = () => {
    return 'bg-slate-500/60 hover:bg-neutral-400/60 border-l-4 border-neutral-300';
  };

  // =============================================
  // VISTA MES
  // =============================================
  if (view === 'month') {
    
    // SOLO privados (sin públicos, sin bloqueos)
    if (tienePrivados && !tienePublicos && !tieneBloqueos) {
      if (eventosPrivados.length === 1) {
        return (
          <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
            <div className="mb-0.5 flex w-full h-full">
              <div
                className={`text-xs md:text-sm truncate px-1.5 py-1 rounded-md ${getPrivadoClassName()} text-white font-medium w-full h-10 md:h-20 cursor-pointer transition-colors flex items-center group`}
                title="Evento privado"
              >
                <div className="flex items-center justify-center w-full gap-2">
                  <FaEyeSlash size={14} className="text-neutral-400" />
                  <span className="text-neutral-200 text-xs md:text-sm">Privado</span>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Múltiples privados
      return (
        <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
          <div className="mb-0.5 cursor-pointer flex justify-center">
            <div className="text-[10px] md:text-xl px-2 py-0.5 w-full items-center justify-center flex rounded-md h-21 md:h-40.5 bg-neutral-700/60 hover:bg-neutral-600/60 text-neutral-400 font-bold border-l-4 border-neutral-500">
              <div className="flex flex-col items-center justify-center gap-1">
                <FaEyeSlash size={20} className="md:hidden" />
                <span className="text-2xl md:text-4xl font-bold">{eventosPrivados.length}+</span>
                <span className="hidden md:inline text-neutral-400 text-sm font-medium">PRIVADOS</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // SOLO 1 evento total (público o bloqueo)
    if (totalVisibles === 1) {
      if (tienePublicos) {
        return (
          <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
            <div className="mb-0.5 flex w-full h-full">
              <div
                className={`text-xs md:text-sm truncate px-1.5 py-1 rounded-md ${getEventoClassName(
                  eventosPublicos[0].estado_participacion,
                  eventosPublicos[0].es_evento_banda
                )} text-white font-medium w-full h-10 md:h-20 cursor-pointer transition-colors flex items-center group`}
                title={`${eventosPublicos[0].titulo} (${formatTime(eventosPublicos[0].inicio)} - ${formatTime(eventosPublicos[0].fin)})`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (onEventClick) onEventClick(eventosPublicos[0]);
                }}
              >
                <div className="flex items-center md:items-start gap-1.5 w-full min-w-0 px-1">
                  <div className='hidden md:flex flex-shrink-0 pt-0.5'>
                    {eventosPublicos[0].flyer_url ? (
                      <img alt="flyer" src={eventosPublicos[0].flyer_url} className='object-cover w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30' />
                    ) : (
                      <FaCheckCircle size={18} className="md:mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-white/95 font-medium mb-0.5">
                      {eventosPublicos[0].titulo}
                    </div>
                    <div className="hidden md:flex text-xs text-white/70">
                      {formatTime(eventosPublicos[0].inicio)} - {formatTime(eventosPublicos[0].fin)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      if (tieneBloqueos) {
        return (
          <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
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
          </div>
        );
      }
    }

    // MÚLTIPLES EVENTOS (mezcla)
    if (totalVisibles >= 2 && totalVisibles <= 3) {
      const maxPublicos = tieneBloqueos || tienePrivados ? 1 : 2;
      const maxBloqueos = tienePublicos || tienePrivados ? 1 : 2;

      return (
        <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
          {/* Eventos públicos */}
          {eventosPublicos.slice(0, maxPublicos).map((event, index) => (
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

          {/* Eventos privados (solo indicador) */}
          {tienePrivados && (
            <div
              className={`text-xs md:text-sm mb-0.5 rounded-md ${getPrivadoClassName()} text-white font-medium cursor-pointer items-center justify-center w-full h-6.5 md:h-12.5 flex border-l-2`}
              title={`${eventosPrivados.length} evento(s) privado(s)`}
            >
              <div className="flex items-center gap-1.5 px-1">
                <FaEyeSlash size={12} className="text-neutral-400" />
                <span className="text-neutral-400 text-xs">{eventosPrivados.length} Privado{eventosPrivados.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {/* Bloqueos */}
          {blockedEvents.slice(0, maxBloqueos).map((event, index) => (
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

          {/* Indicador de "+" si hay más */}
          {totalVisibles >= 2 && (
            <div className="mb-0.5 cursor-pointer flex justify-center">
              <div 
                className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-6.5 md:h-14 bg-yellow-600/50 hover:bg-yellow-700 text-yellow-50 font-bold border-l-2 border-yellow-500"
                title={`${totalVisibles} eventos en este día`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMultipleEventsClick) onMultipleEventsClick(events, date);
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm md:text-lg font-bold">{totalVisibles}+</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // MÁS DE 3 EVENTOS
    if (totalVisibles > 3) {
      return (
        <div className="absolute bottom-1 left-0 right-0 px-0.5 z-30">
          <div className="mb-0.5 cursor-pointer flex justify-center">
            <div 
              className="text-[10px] md:text-xl px-2 py-0.5 w-full items-center justify-center flex rounded-md h-21 md:h-40.5 bg-yellow-600/50 hover:bg-yellow-700 text-yellow-50 font-bold border-l-4 border-yellow-500"
              title={`${totalVisibles} eventos en este día`}
              onClick={(e) => {
                e.stopPropagation();
                if (onMultipleEventsClick) onMultipleEventsClick(events, date);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-2xl md:text-4xl font-bold">{totalVisibles}+</span>
                <span className="hidden md:inline text-yellow-200/90 text-sm font-medium">EVENTOS</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // =============================================
  // VISTAS SEMANA y DÍA
  // =============================================
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

  // Separar relevantes por tipo
  const relevantPublicos = relevantEvents.filter(e => !e.es_bloqueo && e.es_publico === true);
  const relevantPrivados = relevantEvents.filter(e => !e.es_bloqueo && (e.es_publico === false || e.es_publico === undefined));
  const relevantBloqueos = relevantEvents.filter(event => {
    if (!event.es_bloqueo) return false;
    if (profile.tipo === 'banda') return true;
    return event.id_creador === profile.id;
  });

  const totalRelevant = relevantEvents.length;
  const tieneRelevantPrivados = relevantPrivados.length > 0;
  const tieneRelevantPublicos = relevantPublicos.length > 0;
  const tieneRelevantBloqueos = relevantBloqueos.length > 0;

  const getEventoStylesVistaSemana = (estado?: string, es_de_banda: boolean = false) => {
    if (es_de_banda) {
      switch (estado) {
        case 'pendiente': return { bg: 'bg-orange-600/30 hover:bg-orange-700', border: 'border-orange-500', icon: 'text-orange-200', text: 'text-orange-200/90' };
        case 'rechazado': return { bg: 'bg-red-600/30 hover:bg-red-700', border: 'border-red-500', icon: 'text-red-200', text: 'text-red-200/90' };
        case 'confirmado': return { bg: 'bg-green-700/30 hover:bg-green-800', border: 'border-green-500', icon: 'text-green-200', text: 'text-green-200/90' };
        default: return { bg: 'bg-gray-800/30 hover:bg-gray-700', border: 'border-gray-500', icon: 'text-gray-200', text: 'text-gray-200/90' };
      }
    } else {
      switch (estado) {
        case 'pendiente': return { bg: 'bg-orange-600/30 hover:bg-orange-700', border: 'border-orange-500', icon: 'text-orange-200', text: 'text-orange-200/90' };
        case 'rechazado': return { bg: 'bg-red-600/30 hover:bg-red-700', border: 'border-red-500', icon: 'text-red-200', text: 'text-red-200/90' };
        case 'confirmado': return { bg: 'bg-sky-700/30 hover:bg-sky-800', border: 'border-sky-500', icon: 'text-sky-200', text: 'text-sky-200/90' };
        default: return { bg: 'bg-gray-800/30 hover:bg-gray-700', border: 'border-gray-500', icon: 'text-gray-200', text: 'text-gray-200/90' };
      }
    }
  };

  return (
    <div className="absolute flex w-full h-full items-center justify-center inset-0 z-30">
      {/* Múltiples eventos relevantes */}
      {totalRelevant >= 2 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-yellow-900/50 hover:bg-yellow-950 rounded-md border-2 border-yellow-700 pointer-events-auto cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">{totalRelevant} +</div>
            </div>
          </div>
        </div>
      )}

      {/* Solo 1 bloqueo relevante */}
      {tieneRelevantBloqueos && totalRelevant === 1 && (
        <div 
          className="absolute inset-0 flex items-center justify-center rounded-lg w-[99%] h-[99%] bg-red-900/50 hover:bg-red-950 border-2 border-red-700 pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (onBlockClick && relevantBloqueos[0]) {
              onBlockClick(relevantBloqueos[0]);
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

      {/* Solo 1 privado relevante */}
      {tieneRelevantPrivados && totalRelevant === 1 && (
        <div className="absolute inset-0 z-40 p-0.5 flex items-center justify-center">
          <div
            className="absolute w-[99%] h-[90%] rounded-lg pointer-events-auto cursor-pointer transition-all bg-neutral-700/50 hover:bg-neutral-600/50 border-l-4 border-neutral-500"
            title="Evento privado"
          >
            <div className="p-0.5 h-full flex flex-col justify-center overflow-hidden">
              <div className="text-[10px] text-neutral-400 font-medium truncate px-0.5 flex items-center gap-1">
                <FaEyeSlash size={8} />
                <span>Privado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Solo 1 público relevante */}
      {tieneRelevantPublicos && totalRelevant === 1 && (
        <div className="absolute inset-0 z-40 p-0.5 flex items-center justify-center">
          {relevantPublicos.map((event) => {
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
                      <img src={event.flyer_url} alt="flyer" className="w-6 h-6 rounded-full object-cover border border-white/20 mr-1" />
                    ) : (
                      <FaCheckCircle size={8} className={styles.icon} />
                    )}
                    <span>{formatEventTitle(event.titulo)}</span>
                  </div>
                  <div className={`text-[9px] truncate px-0.5 mt-0.5 ${styles.text}`}>
                    {formatTime(event.inicio)} - {formatTime(event.fin)}
                  </div>
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