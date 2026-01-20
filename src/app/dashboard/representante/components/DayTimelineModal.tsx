// components/calendar/DayTimelineModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaCheckCircle, FaLock, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaLink, FaImage, FaChevronRight } from 'react-icons/fa';
import { HiChevronRight, HiX } from 'react-icons/hi';
import EventModal from './EventModal';
import CrearEventoModal from './CrearEventoModal';
import BlockDateModal from './BlockDateModal';
import { getEventsByDiaYPerfilId } from '../actions/actions';
import { EventoCalendario } from '@/types/profile';

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
  const [events, setEvents] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCrearEventoModal, setShowCrearEventoModal] = useState(false);
  const [showBloquearPeriodoModal, setShowBloquearPeriodoModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);

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
    if (event.es_bloqueo) return 'bg-red-600/40';
    return 'bg-sky-600/40'; // Puedes agregar más condiciones si quieres
  };

  const getEventIcon = (event: EventoCalendario) => {
    if (event.es_bloqueo) return <FaLock className="text-sm" />;
    return <FaCheckCircle className="text-sm" />;
  };

  const calculateEventPosition = (event: EventoCalendario) => {
    const eventStart = new Date(event.inicio);
    const eventEnd = event.fin ? new Date(event.fin) : new Date(event.inicio);
    
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(24, 0, 0, 0);

    const start = Math.max(eventStart.getTime(), dayStart.getTime());
    const end = Math.min(eventEnd.getTime(), dayEnd.getTime());
    
    const totalDayDuration = 24 * 60 * 60 * 1000;
    const startOffset = start - dayStart.getTime();
    const duration = end - start;
    
    const top = (startOffset / totalDayDuration) * 120;
    const height = (duration / totalDayDuration) * 120;
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const formatTime = (date: Date) => format(date, 'HH:mm', { locale: es });
  const formatFullDate = (date: Date) => format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });

  const MobileView = () => (
    <div className="md:hidden">
      <div className="space-y-3">
        {sortedEvents.map((event, index) => {
          const isBlocked = event.es_bloqueo;
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
                  {event.titulo}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <FaClock className="text-xs" />
                  <span>
                    {formatTime(new Date(event.inicio))} - {event.fin ? formatTime(new Date(event.fin)) : 'Sin fin'}
                  </span>
                </div>
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

                      return (
                        <div
                          key={event.id || index}
                          className={`absolute z-50 left-4 right-4 rounded-lg border ${getEventColor(event)} ${isBlocked ? 'border-red-500' : 'border-gray-300/50'} shadow-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all`}
                          style={{
                            top: position.top,
                            height: position.height,
                          }}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getEventColor(event)}`} />
                          <div className="absolute inset-0 pl-3 pr-2 py-2">
                            <div className="flex items-start gap-2 h-full">
                              <div className="mt-1">
                                {getEventIcon(event)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <h4 className={`font-semibold truncate ${isBlocked ? 'text-red-200' : 'text-white'}`}>
                                    {event.titulo}
                                  </h4>
                                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                    {formatTime(new Date(event.inicio))} - {event.fin ? formatTime(new Date(event.fin)) : 'Sin fin'}
                                  </span>
                                </div>
                                {isBlocked && event.motivo_bloqueo && (
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
                      return (
                        <div
                          key={event.id || index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-neutral-900/50 hover:bg-neutral-800/70 cursor-pointer transition-colors"
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
                              {event.titulo}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <FaClock className="text-xs" />
                              <span>
                                {formatTime(new Date(event.inicio))} - {event.fin ? formatTime(new Date(event.fin)) : 'Sin fin'}
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
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                <span className="text-gray-300">
                  {sortedEvents.filter(e => e.es_bloqueo).length > 0 && 
                    `${sortedEvents.filter(e => e.es_bloqueo).length} bloqueos • `}
                  {sortedEvents.filter(e => !e.es_bloqueo).length} eventos activos
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
                    setNewEventDate(date);
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

      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={showEventModal}
          onClose={() => {
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