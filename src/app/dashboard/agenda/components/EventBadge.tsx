// components/calendar/EventBadge.tsx
'use client';

import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { HiCalendar, HiLockClosed } from 'react-icons/hi';
import { EventoCalendario } from '@/types/profile';

interface EventBadgeProps {
  events: EventoCalendario[];
  profile: any;
  date: Date;
  view: string;
  slotTime?: Date;
  onEventClick?: (event: EventoCalendario) => void;
  onMultipleEventsClick?: (events: EventoCalendario[], date: Date) => void;
  onBlockClick?: (blockEvent: EventoCalendario) => void;
}

export default function EventBadge({
  events,
  profile,
  date,
  view,
  slotTime,
  onEventClick,
  onMultipleEventsClick,
  onBlockClick,
}: EventBadgeProps) {
  console.log(events);

  if (events.length === 0) return null;

  // Separar eventos normales de bloqueos → usando es_bloqueo directamente
  const normalEvents = events.filter(event => !event.es_bloqueo);
  const blockedEvents = events.filter(event => event.es_bloqueo);
  const integranteEvents = events.filter(event => event.es_evento_integrante);


  // Helper para formatear hora (sin cambios)
const formatTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

 const getEventoClassName1 = (estado?: string, es_de_integrante:boolean = false) => {
 
   if (es_de_integrante) {
     
     switch (estado) {

         default:
         return 'bg-gray-700/50 hover:bg-gray-600 border-l-4 border-gray-400';
     }
  } else {
    
    switch (estado) {
      case 'pendiente':
        return 'bg-orange-600/50 hover:bg-orange-700 border-l-4 border-orange-500';
      case 'rechazado':
        return 'bg-red-600/50 hover:bg-red-700 border-l-4 border-red-500';
      case 'confirmado':
        return 'bg-sky-700/50 hover:bg-sky-800 border-l-4 border-sky-500';
        default:
        return 'bg-gray-800/50 hover:bg-gray-700 border-l-4 border-gray-500';
    }
  }
};

 const getBloqueoClassName1 = (estado?: string, es_de_integrante:boolean = false) => {
 
   if (es_de_integrante) {
     

         return 'bg-gray-700/50 hover:bg-gray-600 border-l-4 border-gray-400';
     
  } else {

        return 'bg-red-800/50 hover:bg-red-800/60 border-l-4 border-red-500';
  }
};

  // Vista MES
  if (view === 'month') {
    const hasBlocked = blockedEvents.length > 0;
    const hasNormal = normalEvents.length > 0;
    const hasIntegrante = integranteEvents.length > 0;
    const totalEvents = blockedEvents.length + normalEvents.length;

    return (
      <div className="absolute bottom-1 left-0 right-0 px-0.5 z-20">
        {totalEvents === 1 && (
          <div>
            {/* UN SOLO EVENTO NORMAL */}
            {hasNormal && !hasBlocked && (
              <div className="mb-0.5 flex w-full h-full">
                <div
                   className={`text-xs md:text-sm truncate px-1.5 py-1 rounded-md ${
                  getEventoClassName1(normalEvents[0].estado_participacion,normalEvents[0].es_evento_integrante) 
                } text-white font-medium w-full h-10 md:h-20 cursor-pointer transition-colors flex items-center group`}
                  title={`${normalEvents[0].titulo} (${formatTime(normalEvents[0].inicio)} - ${formatTime(normalEvents[0].fin)})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if(!normalEvents[0].es_evento_integrante){

                      if (onEventClick) onEventClick(normalEvents[0]);
                    }
                  }}
                >
                  {!normalEvents[0].es_evento_integrante? (
                    <>
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
                    </>
                  
                  ):(
                  <>
               
                        <div className="flex flex-col w-full items-center justify-center gap-1.5 p-2">

                          <HiCalendar size={28} className='text-gray-300 group-hover:text-red-200 transition-colors' />
                          <span className="hidden md:inline text-gray-200/90 font-medium text-xs">
                          INTEGRANTE
                          </span>

                      </div>
              
                  </>)}
               
                </div>
              </div>
            )}

            {/* UN SOLO BLOQUEO */}
            {hasBlocked && !hasNormal && (
              <div className="mb-0.5 flex">
                <div
                  className={`text-xs md:text-sm rounded-md ${
                  getBloqueoClassName1(blockedEvents[0].estado_participacion,blockedEvents[0].es_evento_integrante) 
                } text-white font-semibold shadow-sm hover:shadow cursor-pointer items-center justify-center w-full h-10 md:h-20 flex group border-l-4`}
                  title={`Día bloqueado: ${blockedEvents[0].motivo_bloqueo || 'Sin motivo'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if(!blockedEvents[0].es_evento_integrante){
                      if (onBlockClick) onBlockClick(blockedEvents[0]);
                    
                    }
                    
                  }}
                >
                  {!hasIntegrante? (
                    <>
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
                    </>
                  ):(<>
                      <div>
                               <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                    <HiCalendar size={28} className='text-gray-300 group-hover:text-red-200 transition-colors' />
                    <span className="hidden md:inline text-gray-200/90 font-medium text-xs">
                    INTEGRANTE
                    </span>

                      </div>
                      </div>
                  </>)}
                </div>
              </div>
            )}

            

            {/* Contador para 1 evento */}
            {totalEvents === 1 && (
              <div className="mb-0.5 cursor-pointer flex justify-center">
                <div 
                  className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-10 md:h-20 bg-yellow-600/50 hover:bg-yellow-700 text-yellow-50 font-bold border-l-4 border-yellow-500 group"
                  title={`${totalEvents} eventos en este día`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMultipleEventsClick) onMultipleEventsClick(events, date);
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-lg md:text-2xl font-bold">
                      {totalEvents}+
                    </span>
                    <span className="hidden md:inline text-yellow-200/90 text-xs font-medium">
                      EVENTOS
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Para 2 eventos */}
        {totalEvents >= 2 && totalEvents <= 3 && (
          <div>
            {normalEvents.length >= 1 && normalEvents.slice(0, hasBlocked ? 1 : 2).map((event, index) => (
              <div
                key={event.id || index}
                className={`text-xs md:text-sm mb-0.5 truncate px-1.5 py-1 rounded-md ${
                  getEventoClassName1(normalEvents[index].estado_participacion,normalEvents[index].es_evento_integrante) 
                } text-white font-medium  cursor-pointer transition-colors flex items-center justify-center h-6.5 md:h-12.5 group border-l-2 `}
                title={`${event.titulo} (${formatTime(event.inicio)} - ${formatTime(event.fin)})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if(!normalEvents[index].es_evento_integrante){

                    if (onEventClick) onEventClick(normalEvents[index]);
                  }
                }}
              >
                {!normalEvents[index].es_evento_integrante? 
                (
                <>
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
                </>
                ):(
              
              <>
                        <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                    <HiCalendar size={14} className='text-gray-300 group-hover:text-red-200 transition-colors' />
                    <span className="hidden md:inline text-gray-200/90 font-medium text-xs">
                    INTEGRANTE
                    </span>

                      </div>
              </>)
              
              }
              </div>
            ))}

            {blockedEvents.length >= 1 && blockedEvents.slice(0, hasNormal ? 1 : 2).map((event, index) => (
              <div
                key={event.id || index}
                className={`text-xs md:text-sm mb-0.5 rounded-md  ${
                  getBloqueoClassName1(blockedEvents[index].estado_participacion,blockedEvents[index].es_evento_integrante) 
                } text-white font-medium shadow-sm cursor-pointer items-center justify-center w-full h-6.5 md:h-12.5 flex border-l-2 `}
                title={`Día bloqueado: ${event.motivo_bloqueo || 'Sin motivo'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBlockClick) onBlockClick(event);
                }}
              >
                {!blockedEvents[index].es_evento_integrante? (
                    <>
                    <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                    <HiLockClosed size={18} className='text-red-300 group-hover:text-red-200 transition-colors' />
             

                  </div>
                    </>
                  ):(<>
                      <div>
                               <div className="flex flex-col items-center justify-center gap-1.5 p-2">
                    <HiCalendar size={14} className='text-gray-300 group-hover:text-red-200 transition-colors' />
                    <span className="hidden md:inline text-gray-200/90 font-medium text-xs">
                    INTEGRANTE
                    </span>

                      </div>
                      </div>
                  </>)}
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
                    <span className="text-sm md:text-lg font-bold">
                      {totalEvents}+
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Para 3 eventos 
        {totalEvents === 3 && (
          <div>
            {normalEvents.length >= 2 && normalEvents.slice(0, hasBlocked ? 1 : 2).map((event, index) => (
              <div
                key={event.id || index}
                className="text-xs md:text-sm mb-0.5 truncate px-1.5 py-1 rounded-md bg-sky-700/50 text-white font-medium hover:bg-sky-800 cursor-pointer transition-colors flex items-center justify-center h-6.5 md:h-12.5 border-l-2 border-sky-500"
                title={`${event.titulo} (${formatTime(event.inicio)} - ${formatTime(event.fin)})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEventClick) onEventClick(normalEvents[0]);
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

            {blockedEvents.length >= 1 && blockedEvents.slice(0, hasNormal ? 1 : 2).map((event, index) => (
              <div
                key={event.id || index}
                className="text-xs md:text-sm mb-0.5 rounded-md bg-red-900 hover:bg-red-950 text-white font-medium shadow-sm cursor-pointer items-center justify-center w-full h-6.5 md:h-12.5 flex border-l-2 border-red-600"
                title={`Día bloqueado: ${event.motivo_bloqueo || 'Sin motivo'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onBlockClick) onBlockClick(event);
                }}
              >
                <HiLockClosed size={18} className='text-red-300' />
              </div>
            ))}

            {totalEvents === 3 && (
              <div className="mb-0.5 cursor-pointer flex justify-center">
                <div 
                  className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-6.5 md:h-12.5 bg-yellow-600/50 hover:bg-yellow-700 text-yellow-50 font-bold border-l-2 border-yellow-500"
                  title={`${totalEvents} eventos en este día`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMultipleEventsClick) onMultipleEventsClick(events, date);
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold">
                      {totalEvents}+
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
*/}
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

  // Vistas SEMANA y DÍA
  const relevantEvents = events.filter(event => {
    if (!slotTime) return false;
    return slotTime >= event.inicio && slotTime < (event.fin || event.inicio);
  });

  if (relevantEvents.length === 0) return null;

  const relevantBlockedEvents = relevantEvents.filter(event => event.es_bloqueo);
  const relevantNormalEvents = relevantEvents.filter(event => !event.es_bloqueo);
  const hasBlocked = relevantBlockedEvents.length > 0;
  const totalRelevantEvents = relevantEvents.length;

  return (
    <div className="absolute flex w-full h-full items-center justify-center inset-0 z-30">
      {totalRelevantEvents >= 2 && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-yellow-900/50 hover:bg-yellow-950 rounded-md border-2 border-yellow-700 pointer-events-auto cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                {totalRelevantEvents} +
              </div>
            </div>
          </div>
        </div>
      )}

      {hasBlocked && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-red-900/50 hover:bg-red-950 rounded-md border-2 border-red-700 pointer-events-auto cursor-pointer"
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
        </div>
      )}

      {relevantNormalEvents.length > 0 && totalRelevantEvents === 1 && (
        <>
          {/* Móvil */}
          <div className="md:hidden flex items-center justify-center w-full h-full z-10">
            <div className={`flex items-center justify-center rounded-lg w-[90%] h-[50%] gap-0.5 ${
              hasBlocked
                ? 'bg-red-800/50 hover:bg-red-900 border border-red-700'
                : 'bg-sky-700/50 hover:bg-sky-800 border border-sky-600'
            }`}>
              {relevantNormalEvents.slice(0, 2).map((event, index) => (
                <div
                  key={event.id || index}
                  className="text-[10px] rounded-md text-white font-medium shadow-sm hover:opacity-90 cursor-pointer transition-colors flex items-center gap-0.5"
                  title={`${event.titulo}\n${formatTime(event.inicio)} - ${formatTime(event.fin)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEventClick) onEventClick(event);
                  }}
                >
                  {hasBlocked ? (
                    <FaCheckCircle size={16} className="text-red-200" />
                  ) : (
                    <FaCheckCircle size={16} className="text-sky-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex absolute inset-0 z-40 p-0.5 items-center justify-center pointer-events-none">
            {relevantNormalEvents.map((event, index) => (
              <div
                key={event.id || index}
                className={`absolute w-[99%] h-[90%] rounded-lg pointer-events-auto cursor-pointer transition-all border-l-4 ${
                  hasBlocked
                    ? 'bg-red-800/50 hover:bg-red-900 border-red-600'
                    : 'bg-sky-700/50 hover:bg-sky-800 border-sky-500'
                }`}
                title={`${event.titulo}\n${formatTime(event.inicio)} - ${formatTime(event.fin)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEventClick) onEventClick(event);
                }}
              >
                <div className="p-0.5 h-full flex flex-col justify-center overflow-hidden">
                  <div className="text-[10px] text-white font-medium truncate px-0.5 flex items-center gap-1">
                    <FaCheckCircle size={8} className={hasBlocked ? 'text-red-200' : 'text-sky-200'} />
                    <span>{formatEventTitle(event.titulo)}</span>
                  </div>
                  {totalRelevantEvents === 1 && (
                    <div className={`text-[9px] truncate px-0.5 mt-0.5 ${
                      hasBlocked ? 'text-red-200/90' : 'text-sky-200/90'
                    }`}>
                      {formatTime(event.inicio)} - {formatTime(event.fin)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalRelevantEvents > 3 && (
        <div className="absolute bottom-0.5 right-0.5 z-50">
          <div className="text-[9px] px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-300 font-medium border border-gray-700">
            +{totalRelevantEvents - 3} más
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers (sin cambios)
function formatEventTitle(title: string): string {
  if (title.length <= 10) return title;
  return title.substring(0, 8) + '...';
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}