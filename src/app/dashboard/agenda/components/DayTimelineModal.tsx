// components/calendar/DayTimelineModal.tsx
'use client';

import { CalendarEvent, Profile } from '@/types/profile'; 
import { FaCheckCircle, FaLock, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaLink, FaImage } from 'react-icons/fa';
import { HiX, HiChevronRight } from 'react-icons/hi';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import EventModal from './EventModal'; // Importa el modal de evento individual
import CrearEventoModal from './CrearEventoModal';
import BlockDateModal from './BlockDateModal';

interface DayTimelineModalProps {
  events: CalendarEvent[];
  profile:Profile;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
}

export default function DayTimelineModal({ events,profile, date, isOpen, onClose }: DayTimelineModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [perfil, setPerfil] = useState<Profile | null>(null);

  const [showCrearEventoModal, setShowCrearEventoModal] = useState(false);
  const [showBloquearPeriodoModal, setShowBloquearPeriodoModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  
  if (!isOpen || events.length === 0) return null;

  // Ordenar eventos por hora de inicio
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  // Función para obtener color según tipo de evento
  const getEventColor = (event: CalendarEvent) => {
    if (event.resource?.is_blocked) return 'bg-red-600/40';
    if (event.category === 'show') return 'bg-green-600/40';
    if (event.category === 'meeting') return 'bg-blue-600/40';
    if (event.category === 'rehearsal') return 'bg-green-600/40';
    if (event.category === 'other') return 'bg-yellow-600/40';
    return 'bg-neutral-600';
  };

  // Función para obtener icono según tipo
  const getEventIcon = (event: CalendarEvent) => {
    if (event.resource?.is_blocked) return <FaLock className="text-sm" />;
    return <FaCheckCircle className="text-sm" />;
  };

  // Calcular duración total del día (de 00:00 a 24:00)
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(24, 0, 0, 0);

  // Calcular posición y altura para cada evento en la línea de tiempo
  const calculateEventPosition = (event: CalendarEvent) => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Asegurar que el evento esté dentro del día
    const start = Math.max(eventStart.getTime(), dayStart.getTime());
    const end = Math.min(eventEnd.getTime(), dayEnd.getTime());
    
    // Calcular posición porcentual
    const totalDayDuration = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    const startOffset = start - dayStart.getTime();
    const duration = end - start;
    
    const top = (startOffset / totalDayDuration) * 120;
    const height = (duration / totalDayDuration) * 120;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  // Formatear hora
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: es });
  };

  // Formatear fecha completa
  const formatFullDate = (date: Date) => {
    return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Vista móvil
  const MobileView = () => (
    <div className="md:hidden">
      <div className="space-y-3">
        {sortedEvents.map((event, index) => {
          const isBlocked = event.resource?.is_blocked;
          
          return (
            <div
              key={event.id || index}
              className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 cursor-pointer transition-colors border border-neutral-700"
              onClick={() => {
                setSelectedEvent(event);
                setShowEventModal(true);
              }}
            >
              <div className={`p-2 rounded ${getEventColor(event)}`}>
                {getEventIcon(event)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${isBlocked ? 'text-red-200' : 'text-white'}`}>
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <FaClock className="text-xs" />
                  <span>
                    {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                  </span>
                </div>
                {!isBlocked && event.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${getEventColor(event)} text-white`}>
                    {event.category}
                  </span>
                )}
              </div>
              <HiChevronRight className="text-gray-400 text-xl ml-2" />
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="relative bg-neutral-900 rounded-xl shadow-2xl w-full md:max-w-4xl max-h-[95vh] min-h-[95vh] overflow-hidden border border-neutral-700">
          {/* Encabezado */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-neutral-800">
                <FaCalendarAlt className="text-2xl text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{formatFullDate(date)}</h2>
                <p className="text-gray-400 mt-1">
                  {events.length} {events.length === 1 ? 'evento' : 'eventos'} programados
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          {/* Contenido - Línea de tiempo */}
          <div className="p-6 h-[75vh] overflow-y-hidden">
            {/* Vista móvil */}
            <MobileView />

            {/* Vista desktop */}
            <div className="hidden md:flex gap-6 h-full">
              {/* Timeline principal */}
              <div className="flex-1">
                <div className="relative h-full   bg-neutral--800/50 rounded-lg border border-neutral-700">
                  {/* Línea de tiempo visual */}
                  <div className="absolute left-0 right-0  h-full overflow-y-scroll custom-scrollbar">
                    {/* Marcas de hora cada 2 horas */}
                    {[...Array(13)].map((_, i) => {
                      const hour = i*2 ;
                      const top = (hour / 24) * 120;
                      return (
                        <div
                          key={hour}
                          className="absolute z-50 left-0 right-0 border-t border-neutral-700/50"
                          style={{ top: `${top}%` }}
                        >
                          <div className="absolute left-0 -top-2 text-xs text-gray-500 font-mono pl-2">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                        </div>
                      );
                    })}

                    {/* Eventos en timeline */}
                    {sortedEvents.map((event, index) => {
                      const position = calculateEventPosition(event);
                      const isBlocked = event.resource?.is_blocked;
                      
                      return (
                        <div
                          key={event.id || index}
                          className={`absolute z-50 left-4 right-4 rounded-lg border  ${getEventColor(event)} ${isBlocked ? 'border-red-500' : 'border-gray-300/50'} shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all`}
                          style={{
                            top: position.top,
                            height: position.height,
                          
                          }}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          {/* Barra lateral colorida */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getEventColor(event)}`} />
                          
                          {/* Contenido del evento */}
                          <div className="absolute inset-0 pl-3 pr-2 py-2">
                            <div className="flex items-start gap-2 h-full">
                              <div className="mt-1">
                                {getEventIcon(event)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className={`font-semibold truncate ${isBlocked ? 'text-red-200' : 'text-white'}`}>
                                    {event.title}
                                  </h4>
                                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                                  </span>
                                </div>
                                {event.category && !isBlocked && (
                                  <div className="hidden md:flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getEventColor(event)} text-white`}>
                                      {event.category}
                                    </span>
                                    {event.resource?.custom_place_name && (
                                      <span className="text-xs text-gray-400 truncate">
                                        @ {event.resource.custom_place_name}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {isBlocked && event.resource?.blocked_reason && (
                                  <p className="text-xs text-red-300 mt-1 truncate">
                                    {event.resource.blocked_reason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Leyenda de eventos */}
              <div className="w-64 hidden lg:block">
                <div className="bg-neutral-800/50 h-[600px] rounded-lg p-4 border border-neutral-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Eventos del día</h3>
                  <div className="space-y-3 overflow-y-scroll custom-scrollbar h-[calc(100%-100px)]">
                    {sortedEvents.map((event, index) => {
                      const isBlocked = event.resource?.is_blocked;
                      return (
                        <div
                          key={event.id || index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/70 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                            console.log('Evento seleccionado desde leyenda:', event);
                          }}
                        >
                          <div className={`p-2 rounded ${getEventColor(event)}`}>
                            {getEventIcon(event)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${isBlocked ? 'text-red-200' : 'text-white'}`}>
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <FaClock className="text-xs" />
                              <span>
                                {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                              </span>
                            </div>
                            {!isBlocked && event.category && (
                              <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${getEventColor(event)} text-white`}>
                                {event.category}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Resumen estadísticas */}
                  <div className="mt-7 pt-4 border-t border-neutral-700">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Resumen</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-neutral-900/70 rounded">
                        <div className="text-lg font-bold text-white">
                          {sortedEvents.length}
                        </div>
                        <div className="text-xs text-gray-400">Total</div>
                      </div>
                      <div className="text-center p-2 bg-neutral-900/70 rounded">
                        <div className="text-lg font-bold text-white">
                          {sortedEvents.filter(e => !e.resource?.is_blocked).length}
                        </div>
                        <div className="text-xs text-gray-400">Activos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pie del modal */}
          <div className="sticky bottom-0 p-4 border-t border-neutral-700 bg-neutral-900">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <span className="text-gray-300">
                  {sortedEvents.filter(e => e.resource?.is_blocked).length > 0 && 
                    `${sortedEvents.filter(e => e.resource?.is_blocked).length} bloqueos • `
                  }
                  {sortedEvents.filter(e => !e.resource?.is_blocked).length} eventos activos
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    // Aquí podrías abrir modal de creación de evento
                    setNewEventDate(date);
                    setShowCrearEventoModal(true);
                    console.log('Crear nuevo evento en esta fecha '+formatFullDate(date));
                  }}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Agregar Evento
                </button>
                <button
                  onClick={() => {
                    // Aquí podrías abrir modal de creación de evento
                    setNewEventDate(date);
                    setShowBloquearPeriodoModal(true);
                    console.log('Crear bloqueo en esta fecha '+formatFullDate(date));
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Bloquear Periodo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de evento individual */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

        {/* Modal de creación de nuevo evento */}
        {showCrearEventoModal && newEventDate && (
        <CrearEventoModal
          selectedDate={newEventDate}
          profile={profile as any}
          open={showCrearEventoModal}
          onClose={() => {
            setShowCrearEventoModal(false);
            setNewEventDate(null);
          }}
        />
        )}
        {/* Modal de bloqueo de periodo */}
        {showBloquearPeriodoModal && newEventDate && (
          <BlockDateModal
            initialDate={newEventDate}
            profile={profile as any}
            open={showBloquearPeriodoModal} 
            onClose={() => {
              setShowBloquearPeriodoModal(false);
              setNewEventDate(null);
              
            }}
          />
        )}


    </>
  );
}