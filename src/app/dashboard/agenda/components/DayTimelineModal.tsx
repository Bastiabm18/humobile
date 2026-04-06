// components/calendar/DayTimelineModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCheckCircle, FaLock, FaCalendarAlt,FaCrown, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaLink, FaImage, FaChevronRight } from 'react-icons/fa';
import { HiCalendar, HiChevronRight, HiX } from 'react-icons/hi';
import EventModal from './EventModal';
import CrearEventoModal from './CrearEventoModal';
import BlockDateModal from './BlockDateModal';
import { getEventsByDiaYPerfilId } from '../actions/actions';
import { EventoCalendario } from '@/types/profile';
import { usePermisos } from '@/app/hooks/usePermisos';

interface DayTimelineModalProps {
  profile: any;
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: () => void;
}

export default function DayTimelineModal({ profile, date, isOpen, onClose, onEventUpdated }: DayTimelineModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDesbloquearModal, setshowDesbloquearModal] = useState(false);
  const [events, setEvents] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCrearEventoModal, setShowCrearEventoModal] = useState(false);
  const [showBloquearPeriodoModal, setShowBloquearPeriodoModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const { activo } = usePermisos({});
  const puedeCrearEvento = activo('CREAR_EVENTO');
  useEffect(() => {
    if (isOpen && profile?.id) {
      fetchEventosParaElDia();
    } else {
      setEvents([]);
      setError(null);
    }
  }, [isOpen, date, profile?.id]);

  const fetchEventosParaElDia = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventosDelDia = await getEventsByDiaYPerfilId(date, profile.id);
      setEvents(eventosDelDia);
      console.log(eventosDelDia)
    } catch (err: any) {
      console.error('Error cargando eventos del día:', err);
      setError(err.message || 'Error al cargar los eventos del día');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || events.length === 0) return null;

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
  );

  const getEventColor = (event: EventoCalendario) => {
  if (event.estado_participacion === 'rechazado') return 'bg-red-500/70';
  if ( event.estado_participacion === 'pendiente') return 'bg-yellow-500/70';
  if ( event.estado_participacion === 'confirmado' && event.es_bloqueo) return 'bg-red-500/70 border-red-500';
  if ( event.estado_participacion === 'confirmado' && event.es_evento_banda) return 'bg-green-500/70 border-green-500';
  if ( event.estado_participacion === 'confirmado' && event.es_evento_integrante) return 'bg-gray-500/70 border-gray-500';
if (event.estado_participacion === 'confirmado' &&
   !event.es_bloqueo && 
   !event.es_evento_banda && 
   !event.es_evento_integrante) return 'bg-sky-500/70 border-sky-500';
    
  
  };

  const getEventIcon = (event: EventoCalendario) => {
    if (event.es_bloqueo) return <FaLock className="text-sm" />;
    return <FaCheckCircle className="text-sm" />;
  };

const calculateEventPosition = (event: EventoCalendario) => {
  // 1. Obtenemos el objeto Date (que ya viene corregido desde el action)
  const eStart = new Date(event.inicio);
  const eEnd = event.fin ? new Date(event.fin) : eStart;

  // 2. Calculamos cuántos minutos han pasado desde las 00:00
  // Usamos getHours() y getMinutes() normales porque el "hachazo" del 
  // replace('+00', '') hizo que la hora de la DB se vuelva la hora local.
  const startMinutes = eStart.getHours() * 60 + eStart.getMinutes();
  
  // Calculamos la duración en minutos
  let endMinutes = eEnd.getHours() * 60 + eEnd.getMinutes();
  
  // Caso borde: si el evento termina el día siguiente o a las 00:00
  if (endMinutes <= startMinutes && event.fin) {
     endMinutes = 24 * 60; // Lo dibujamos hasta el final del día
  }

  const totalMinutesInDay = 24 * 60;
  
  // 3. Calculamos posición (usando tu escala de 120)
  const top = (startMinutes / totalMinutesInDay) * 120;
  let duration = endMinutes - startMinutes;
  
  // Si no tiene duración o es muy corta, le damos 30 min mínimo para que se vea la caja
  if (duration <= 0) duration = 30; 

  const height = (duration / totalMinutesInDay) * 120;
  
  return { 
    top: `${top}%`, 
    height: `${height}%`,
    position: 'absolute' // Asegúrate de que esto se mantenga
  };
};

const formatTime = (dateInput: string | Date) => {
  const d = new Date(dateInput);
  // Usamos getHours/Minutes normales porque ya "engañamos" al sistema 
  // en el action.ts quitando el +00
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
};


  const formatFullDate = (date: Date) => format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  const MobileView = () => (
    <div className="md:hidden">
      <div className="space-y-3">
        {sortedEvents.map((event, index) => {
          const isBlocked = event.es_bloqueo;
            const esEventoDeIntegrante = event.es_evento_integrante;
       
          return (
          <div key={event.id || index}>
          {!esEventoDeIntegrante? (
            <>
            <div
              key={event.id || index}
              className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 cursor-pointer transition-colors border border-neutral-700"
              onClick={() => {
                if(isBlocked){
                  
                  setshowDesbloquearModal(true);
                }else{
                  setShowEventModal(true);
                }
                setSelectedEvent(event);
              }}
            >
              <div className={`p-2 rounded ${getEventColor(event)}`}>
                {getEventIcon(event)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium ${isBlocked ? 'text-red-200' : 'text-white'}`}>
                  {event.titulo}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <FaClock className="text-xs" />
                  <span>
                    {formatTime((event.inicio))} - {event.fin ? formatTime((event.fin)) : 'Sin fin'}
                  </span>
                </div>
              </div>
              <HiChevronRight className="text-gray-400 text-xl ml-2" />
            </div>
            </>
            ):(
            <>
               <div
              key={event.id || index}
              className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800/70 cursor-pointer transition-colors border border-neutral-700"
             
            >
              <div className={`p-2 rounded bg-gray-500/70`}>
               <HiCalendar/>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-white'`}>
                   Evento integrante
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <FaClock className="text-xs" />
                  <span>
                    {formatTime((event.inicio))} - {event.fin ? formatTime((event.fin)) : 'Sin fin'}
                  </span>
                </div>
              </div>
              <HiChevronRight className="text-gray-400 text-xl ml-2" />
            </div>
            </>
          )}
          </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="relative bg-neutral-900 rounded-xl shadow-2xl w-full md:max-w-4xl max-h-[95vh] min-h-[95vh] overflow-hidden border border-neutral-700">
          {/* Header */}
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

          {/* Contenido */}
          <div className="p-6 h-[75vh] overflow-y-hidden">
            <MobileView />

            {/* Desktop timeline */}
            <div className="hidden md:flex gap-6 h-full">
              <div className="flex-1">
                <div className="relative h-full bg-neutral-800/50 rounded-lg border border-neutral-700">
                  <div className="absolute left-0 right-0 h-full overflow-y-scroll custom-scrollbar">
                    {/* Marcas horarias */}
                    {[...Array(13)].map((_, i) => {
                      const hour = i * 2;
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

                    {/* Eventos */}
                    {sortedEvents.map((event, index) => {
                      const position = calculateEventPosition(event);
                      const isBlocked = event.es_bloqueo;
                      const esEventoDeIntegrante = event.es_evento_integrante;

                      return (
                        <div
                          key={event.id || index}
                          className={`absolute z-50 left-4 right-4 rounded-lg border ${getEventColor(event)} ${isBlocked && !esEventoDeIntegrante ? 'border-red-500' : 'border-gray-300/50'}${esEventoDeIntegrante?'z-0':'z-9999'} shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all`}
                          style={{
                            top: position.top,
                            height: position.height,
                          }}
                          onClick={() => {
                                if(isBlocked){
                  
                                  setshowDesbloquearModal(true);
                                }else{
                                   setShowEventModal(true);
                                 }
                                 setSelectedEvent(event);
                                }}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getEventColor(event)}`} />
                          <div className="absolute inset-0 pl-3 pr-2 py-2">
                            <div className="flex items-start gap-2 h-full">
                              <div className="mt-1">
                                {!esEventoDeIntegrante? (
                                  <>
                                {getEventIcon(event)}
                                  </>
                                  ):(
                                  <>
                                  <HiCalendar/>
                                  </>
                                  )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className={`font-semibold truncate ${isBlocked && !esEventoDeIntegrante? 'text-red-200' : 'text-white'}`}>
                                   {!esEventoDeIntegrante? 
                                    (<>
                                    {event.titulo}
                                    </>):(
                                      <>
                                      <p>Evento Integrante</p>
                                      </>
                                    )}
                                  </h4>
                                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {formatTime(event.inicio)} - {event.fin ? formatTime(event.fin) : 'Sin fin'}
                                  </span>
                                </div>
                                {isBlocked && !esEventoDeIntegrante && event.motivo_bloqueo && (
                                  <p className="text-xs text-red-300 mt-1 truncate">
                                    {event.motivo_bloqueo}
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

              {/* Leyenda */}
              <div className="w-64 hidden lg:block">
                <div className="bg-neutral-800/50 h-full rounded-lg p-4 border border-neutral-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Eventos del día</h3>
                  <div className="space-y-3 overflow-y-scroll custom-scrollbar h-[calc(100%-100px)]">
                    {sortedEvents.map((event, index) => {
                      const isBlocked = event.es_bloqueo;
                      const esEventoDeIntegrante = event.es_evento_integrante;

                      return (
                        <div
                          key={event.id || index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/70 cursor-pointer transition-colors"
                          onClick={() => {
                        if(isBlocked){
                  
                          setshowDesbloquearModal(true);
                          }else{
                             setShowEventModal(true);
                           }
                           setSelectedEvent(event);
                                     }}
                        >
                          <div className={`p-2 rounded ${getEventColor(event)}`}>
                                         {!esEventoDeIntegrante? (
                                <>
                              {getEventIcon(event)}
                                </>
                                ):(
                                <>
                               <HiCalendar/>
                                </>
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium ${isBlocked && !esEventoDeIntegrante ? 'text-red-200' : 'text-white'}`}>
                              {!esEventoDeIntegrante? (
                                <>
                              {event.titulo}
                                </>
                                ):(
                                <>
                                <p>Evento Integrante</p>
                                </>
                              )}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <FaClock className="text-xs" />
                              <span>
                                {formatTime(event.inicio)} - {event.fin ? formatTime(event.fin) : 'Sin fin'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t border-neutral-700 bg-neutral-900">
            <div className="flex flex-col gap-2">
              {/* Mensaje si no tiene permiso */}
              {!puedeCrearEvento && (
                <div className="text-right text-xs text-yellow-400 flex items-center justify-end gap-1.5 pr-1">
                  <FaCrown className="w-3 h-3" />
                  <span>Mejora tu plan para gestionar agenda</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  <span className="text-gray-300">
                    {sortedEvents.filter(e => e.es_bloqueo).length > 0 && 
                      `${sortedEvents.filter(e => e.es_bloqueo).length} bloqueos • `}
                    {sortedEvents.filter(e => !e.es_bloqueo).length} eventos activo (s)
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                  
                  {/* Contenedor de botones que se bloquea */}
                  <div className={`flex gap-3 ${!puedeCrearEvento ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button
                      onClick={() => {
                        setNewEventDate(date);
                        console.log(date);
                        setShowCrearEventoModal(true);
                      }}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Agregar Evento
                    </button>
                    <button
                      onClick={() => {
                        setNewEventDate(date);
                        setShowBloquearPeriodoModal(true);
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
        </div>
      </div>

      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={showEventModal}
          onRequestClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
          profile={profile}
          onEventUpdated={() => {
            fetchEventosParaElDia();
            if (onEventUpdated) onEventUpdated();
          }}
        />
      )}

      {showCrearEventoModal && newEventDate && (
        <CrearEventoModal
          selectedDate={newEventDate}
          profile={profile}
          open={showCrearEventoModal}
          onClose={() => {
            setShowCrearEventoModal(false);
            setNewEventDate(null);
            fetchEventosParaElDia(); // Refresca después de crear
          }}
        />
      )}

      {showBloquearPeriodoModal && newEventDate && (
        <BlockDateModal
          initialDate={newEventDate}
          profile={profile}
          open={showBloquearPeriodoModal}
          onClose={() => {
            setShowBloquearPeriodoModal(false);
            setNewEventDate(null);
            fetchEventosParaElDia(); // Refresca después de bloquear
          }}
        />
      )}
    </>
  );
}