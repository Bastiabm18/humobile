// components/calendar/EventBadge.tsx
'use client';

import { CalendarEvent, Profile } from '@/types/profile';
import { useState } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { HiLockClosed } from 'react-icons/hi';


interface EventBadgeProps {
  events: CalendarEvent[];
  profile:Profile[];
  date: Date;
  view: string;
  slotTime?: Date;
  onEventClick?: (event: CalendarEvent) => void; // prop para evento onclick
  onMultipleEventsClick?: (events: CalendarEvent[], date:Date) => void; // prop para múltiples eventos
  onBlockClick?: (blockEvent: CalendarEvent) => void; // prop para bloqueos onclick
}

//SI AGREGAMOS PROP A LA INTERFACE DEBE AGREGARSE A LA FUNCTION
export default function EventBadge({ events,profile, date, view, slotTime, onEventClick, onMultipleEventsClick, onBlockClick }: EventBadgeProps) {
  
  
  console.log(events);
  // Si no hay eventos, no renderizar nada
  if (events.length === 0) return null;

  // Separar eventos normales de bloqueos
  const normalEvents = events.filter(event => !event.resource?.is_blocked);
  const blockedEvents = events.filter(event => event.resource?.is_blocked);


  // Para vista MES: mostrar badge compacto
  if (view === 'month') {
    const hasBlocked = blockedEvents.length > 0;
    const hasNormal = normalEvents.length > 0;
    const totalEvents = blockedEvents.length + normalEvents.length;
    
    return (
      <div className="absolute  bottom-1 left-0 right-0 px-0.5 z-20">
        {/* INDICADOR DE CRUCE (si hay ambos tipos) */}

    {totalEvents == 1 && ( 
       <div>
            {/* UN SOLO EVENTO  */}
           {hasNormal && !hasBlocked && (
            <div className="mb-0.5 flex">
              <div
                className="text-xs md:text-sm truncate px-2  gap-1 py-1.5 rounded-md bg-sky-600/80 text-white font-semibold shadow-sm hover:bg-sky-900/80 w-full h-11 md:h-20 cursor-pointer transition-colors flex items-center justify-center"
                title={`${normalEvents[0].title} (${formatTime(normalEvents[0].start)} - ${formatTime(normalEvents[0].end)})`}
                onClick={(e) => {
               
                    e.stopPropagation();
                      if (onEventClick) {
                      onEventClick(normalEvents[0]);

                    }
                }}
              >
                <FaCheckCircle size={20} />
                <span className="truncate hidden md:flex"> {(normalEvents[0].title)}</span>
              </div>
            </div>
          )}  
             {/*UNO SOLO  BLOQUEO */}
        {hasBlocked && !hasNormal && (
          <div className="mb-0.5 flex">
            <div
              className="text-xs rounded-md bg-red-900/80 hover:bg-red-950/80 text-white font-semibold shadow-sm cursor-pointer items-center justify-center w-full h-12 md:h-20 flex "
              title={`Día bloqueado: ${blockedEvents[0].resource?.blocked_reason || 'Sin motivo'}`}
              onClick={(e) => {
                  e.stopPropagation();
                  if (onBlockClick) {
                    onBlockClick(blockedEvents[0]);
                  } else {
                    console.log('Bloqueo clickeado:', blockedEvents[0]);
                  }
              }}
            >
              <HiLockClosed size={24} className='text-red-300' />
       
            </div>
          </div>
        )}

        {totalEvents == 1 && (
          <div className="mb-0.5 cursor-pointer flex justify-center">
            <div className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-12 md:h-20 bg-yellow-600/80 hover:bg-yellow-800/80 text-yellow-100 font-bold"
              title=''
              onClick={(e)=>{
              e.stopPropagation();
                if (onMultipleEventsClick) {
                  onMultipleEventsClick(events, date);
                } else {
                  console.log('Múltiples eventos:', events);
                }
              }}
            
            >
              {totalEvents} +
            </div>
          </div>
        )}

      </div>
     )}

     {totalEvents == 2 && (
      <div>

        {normalEvents.length >=1 && normalEvents.slice(0, hasBlocked ? 1 : 2).map((event, index) => (
          <div
            key={event.id || index}
            className={ "text-xs mb-0.5 truncate h-7.5 md:h-12.5  px-1.5 py-1 rounded-md bg-sky-600/80 text-white font-semibold shadow-sm hover:bg-sky-900/80 cursor-pointer transition-colors flex items-center justify-center" }
            title={`${event.title} (${formatTime(event.start)} - ${formatTime(event.end)})`}
            onClick={(e) => {
                 e.stopPropagation();
                      if (onEventClick) {
                      onEventClick(normalEvents[0]);

                    }
              console.log('Evento clickeado:', event);
            }}
          >
            <span className='hidden md:flex'>{formatEventTitle(event.title)}</span>
            <FaCheckCircle size={10} className="ml-1 opacity-80" />
          </div>
        ))}

        {/* EVENTOS BLOQUEOS-*/}
        {blockedEvents.length >= 1 && blockedEvents.slice(0, hasNormal ? 1 : 2).map((event, index) => (
           <div
              className="text-xs rounded-md bg-red-900/80 hover:bg-red-950/80 text-white font-semibold shadow-sm cursor-pointer items-center justify-center w-full h-7.5 md:h-12.5 flex "
              title={`Día bloqueado: ${blockedEvents[0].resource?.blocked_reason || 'Sin motivo'}`}
              onClick={(e) => {
                  e.stopPropagation();
                  if (onBlockClick) {
                    onBlockClick(blockedEvents[0]);
                  } else {
                    console.log('Bloqueo clickeado:', blockedEvents[0]);
                  }
              }}
            >
              <HiLockClosed size={24} className='text-red-300' />
       
            </div>
          
        ))}

        {totalEvents >= 2 && (
            <div className="mb-0.5 cursor-pointer flex justify-center">
            <div className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-7.5 md:h-14 bg-yellow-600/80 hover:bg-yellow-800/80 text-yellow-100 font-bold"
              title=''
              onClick={(e)=>{
              e.stopPropagation();
                if (onMultipleEventsClick) {
                  onMultipleEventsClick(events, date);
                } else {
                  console.log('Múltiples eventos:', events);
                }
              }}
            
            >
              {totalEvents} +
            </div>
          </div>
        )}
      </div>
     )}

     {totalEvents == 3 && (
      <div>

              <div>

        {normalEvents.length >= 2 && normalEvents.slice(0, hasBlocked ? 1 : 2).map((event, index) => (
          <div
            key={event.id || index}
            className={ "text-xs mb-0.5 truncate h-7.5 md:h-12.5  px-1.5 py-1 rounded-md bg-sky-600/80 text-white font-semibold shadow-sm hover:bg-sky-900/80 cursor-pointer transition-colors flex items-center justify-center" }
            title={`${event.title} (${formatTime(event.start)} - ${formatTime(event.end)})`}
            onClick={(e) => {
                 e.stopPropagation();
                      if (onEventClick) {
                      onEventClick(normalEvents[0]);

                    }
              console.log('Evento clickeado:', event);
            }}
          >
            <span className='hidden md:flex'>{formatEventTitle(event.title)}</span>
            <FaCheckCircle size={10} className="ml-1 opacity-80" />
          </div>
        ))}

        {/* EVENTOS BLOQUEOS-*/}
        {blockedEvents.length >= 1 && blockedEvents.slice(0, hasNormal ? 1 : 2).map((event, index) => (
           <div
              className="text-xs rounded-md bg-red-900/80 hover:bg-red-950/80 text-white font-semibold shadow-sm cursor-pointer items-center justify-center w-full h-7.5 md:h-12.5 flex "
              title={`Día bloqueado: ${blockedEvents[0].resource?.blocked_reason || 'Sin motivo'}`}
              onClick={(e) => {
                  e.stopPropagation();
                  if (onBlockClick) {
                    onBlockClick(blockedEvents[0]);
                  } else {
                    console.log('Bloqueo clickeado:', blockedEvents[0]);
                  }
              }}
            >
              <HiLockClosed size={14} className='text-red-300' />
       
            </div>
          
        ))}

        {totalEvents == 3 && (
            <div className="mb-0.5 cursor-pointer flex justify-center">
            <div className="text-[10px] md:text-sm px-2 py-0.5 w-full items-center justify-center flex rounded-md h-7.5 md:h-12.5 bg-yellow-600/80 hover:bg-yellow-800/80 text-yellow-100 font-bold"
              title=''
              onClick={(e)=>{
              e.stopPropagation();
                if (onMultipleEventsClick) {
                  onMultipleEventsClick(events, date);
                } else {
                  console.log('Múltiples eventos:', events);
                }
              }}
            
            >
              {totalEvents} +
            </div>
          </div>
        )}
      </div>
      </div>

     )}
           

          { totalEvents > 3 && (
          <div className="mb-0.5 cursor-pointer flex justify-center">
            <div className="text-[10px] md:text-xl px-2 py-0.5 w-full items-center justify-center flex rounded-md h-23.5 md:h-40.5 bg-yellow-600/80 hover:bg-yellow-800/80 text-yellow-100 font-bold"
              title=''
              onClick={(e)=>{
               e.stopPropagation();
                if (onMultipleEventsClick) {
                  onMultipleEventsClick(events, date);
                } else {
                  console.log('Múltiples eventos:', events);
                }
              }}
            
            >
              {totalEvents} +
            </div>
          </div>
        )}
        
     
      
    
    


    
        
      </div>

      
    );
  }

  // Para vistas SEMANA/DÍA: filtrar por hora específica
  const relevantEvents = events.filter(event => {
    if (!slotTime) return false;
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    return slotTime >= eventStart && slotTime < eventEnd;
  });

  if (relevantEvents.length === 0) return null;

  // Separar bloqueos y eventos normales
  const relevantBlockedEvents = relevantEvents.filter(event => event.resource?.is_blocked);
  const relevantNormalEvents = relevantEvents.filter(event => !event.resource?.is_blocked);
  const hasBlocked = relevantBlockedEvents.length > 0;
  const hasNormal = relevantNormalEvents.length > 0;
  const totalRelevantEvents = relevantEvents.length;

  // Para vistas SEMANA/DÍA
  return (
    <div className="absolute flex w-full h-full items-center justify-center  inset-0 z-30">
      {/* INDICADOR DE CRUCE (si hay múltiples eventos) */}
      {totalRelevantEvents >= 2 && (
        <div className="absolute top-0.5 left-0.5 z-50">
          <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-600/90 text-yellow-100 font-bold shadow-sm">
            {totalRelevantEvents}
          </div>
        </div>
      )}
      
      {/* BLOQUEOS (si hay) */}
      {hasBlocked && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-red-900/50 hover:bg-red-900/70 rounded-md border-2 border-red-700/60 pointer-events-auto cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <HiLockClosed size={view === 'day' ? 24 : 18} className="text-red-300 mx-auto" />
               
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* EVENTOS NORMALES (si hay) */}
      {hasNormal && totalRelevantEvents == 1 && (
        <>
          {/* MÓVIL */}
          <div className="md:hidden  flex items-center justify-center w-full h-full  z-10">
            <div className={ `flex items-center justify-center  rounded-lg w-[90%] h-[50%]  gap-0.5  `+
              (hasBlocked
                ? 'bg-red-800/90  hover:bg-red-900'
                : 'bg-sky-800/90 hover:bg-sky-800/90'
              )
            }>
              {relevantNormalEvents.slice(0, 2).map((event, index) => (
                <div
                  key={event.id || index}
                  className={`text-[10px]   rounded-md text-white font-medium shadow-sm hover:opacity-90 cursor-pointer transition-colors flex items-center gap-0.5`}
                  title={`${event.title}\n${formatTime(event.start)} - ${formatTime(event.end)}`}
                  onClick={(e) => {
                       e.stopPropagation();
                      if (onEventClick) {
                      onEventClick(normalEvents[0]);

                    }
                    console.log('Evento clickeado:', event);
                  }}
                >
                  {hasBlocked ? (
                  <FaCheckCircle size={16} />
                          
                  ): (
                    <HiLockClosed size={16} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP */}
          <div className="hidden  md:flex absolute inset-0 z-40 p-05  items-center justify-center pointer-events-none">
            {relevantNormalEvents.map((event, index) => {
              // Calcular posición si hay múltiples eventos
              const total = relevantNormalEvents.length;
              const widthPercent = Math.min(100 / total, 90); // Máximo 80% por evento
              const leftPercent = (index * (100 / total)) + 5;
              
              return (
                <div
                  key={event.id || index}
                  className={`absolute w-[99%] h-[90%]  rounded-lg pointer-events-auto cursor-pointer transition-all ${
                    hasBlocked
                      ? 'bg-sky-800/90 border-sky-500 hover:bg-sky-900'
                      : 'bg-sky-700/90 border-sky-400 hover:bg-sky-800/90'
                  }`}
             
                  title={`${event.title}\n${formatTime(event.start)} - ${formatTime(event.end)}`}
                  onClick={(e) => {
                       e.stopPropagation();
                      if (onEventClick) {
                      onEventClick(normalEvents[0]);

                    }
                    console.log('Evento clickeado:', event);
                  }}
                >
                  <div className="p-0.5  h-full flex flex-col justify-center overflow-hidden">
                    <div className="text-[10px] text-white font-medium truncate px-0.5 flex items-center gap-1">
                      <FaCheckCircle size={8} />
                      <span>{formatEventTitle(event.title)}</span>
                    </div>
                    {total === 1 && (
                      <div className="text-[9px] text-sky-200 opacity-90 truncate px-0.5 mt-0.5">
                        {formatTime(event.start)} - {formatTime(event.end)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* TEXTO PARA MUCHOS EVENTOS */}
      {totalRelevantEvents > 3 && (
        <div className="absolute bottom-0.5 right-0.5 z-50">
          <div className="text-[9px] px-1.5 py-0.5 rounded-md bg-gray-800/90 text-gray-300 font-medium">
            +{totalRelevantEvents - 3} más
          </div>
        </div>
      )}


    </div>
  );
}

// Helper para acortar títulos
function formatEventTitle(title: string): string {
  if (title.length <= 10) return title;
  return title.substring(0, 8) + '...';
}

// Helper para formatear hora
function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}