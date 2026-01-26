// app/dashboard/agenda/CalendarView.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, getDay, isSameDay, isSameMonth, isWithinInterval } from 'date-fns';
import { HiChevronDown, HiCalendar, HiPlus, HiLockClosed, HiCog } from 'react-icons/hi';
import { es } from 'date-fns/locale';
import { FiCalendar, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

import BlockDateModal from './BlockDateModal';
import CrearEventoModal from './CrearEventoModal';
import { Profile } from '@/types/profile'; 
import EventBadge from './EventBadge';
import EventModal from './EventModal';
import DayTimelineModal from './DayTimelineModal';
import DesbloquearModal from './DesbloquearModal';

import { getEventosByPerfilParticipacion } from '../actions/actions';
import { EventoCalendario } from '@/types/profile';
const localizer = dateFnsLocalizer({
  format,
  parse: (str: string) => new Date(str),
  startOfWeek,
  getDay,
  locales: { es },
});

export default function CalendarView({ profileId, perfil }: { profileId: string; perfil: Profile }) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [blockInitialDate, setBlockInitialDate] = useState<Date | null>(null);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<Date | null>(null);

  const [events, setEvents] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [dayEventsForTimeline, setDayEventsForTimeline] = useState<EventoCalendario[]>([]);
  const [selectedDayForTimeline, setSelectedDayForTimeline] = useState<Date | null>(null);

  const [selectedBlock, setSelectedBlock] = useState<EventoCalendario | null>(null);
  const [desbloquearModalOpen, setDesbloquearModalOpen] = useState(false);

  const [showDateSelectors, setShowDateSelectors] = useState(false);

  const [estadoEvento, setEstadoEvento] = useState<string>(''); // '' = TODOS

  useEffect(() => {
    fetchEvents();
  }, [profileId, estadoEvento]);

 // console.log('calendarview events: ',events)
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedEvents = await getEventosByPerfilParticipacion(
        profileId,
        estadoEvento || undefined
      );

      setEvents(fetchedEvents);
    } catch (err: any) {
      console.error('Error cargando eventos:', err);
      setError(err.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: EventoCalendario) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleMultipleEventsClick = (eventsList: EventoCalendario[], date: Date) => {
    setDayEventsForTimeline(eventsList);
    setSelectedDayForTimeline(date);
    setTimelineModalOpen(true);
  };

  const handleBlockClick = (blockEvent: EventoCalendario) => {
    setSelectedBlock(blockEvent);
    setDesbloquearModalOpen(true);
  };

  const handleBlockDeleted = () => {
    fetchEvents();
  };

  const getEventsForDate = (targetDate: Date): EventoCalendario[] => {
    return events.filter(event => {
      const eventStart = event.inicio;
      const eventEnd = event.fin || event.inicio;
      return isSameDay(eventStart, targetDate) ||
             isSameDay(eventEnd, targetDate) ||
             isWithinInterval(targetDate, { start: eventStart, end: eventEnd });
    });
  };

  const CustomDateCellWrapper = ({ children, value }: any) => {
    const dayEvents = getEventsForDate(value);
    const isToday = isSameDay(value, new Date());
    const isCurrentMonth = isSameMonth(value, date);
    const isEmptyDay = dayEvents.length === 0 && isCurrentMonth;

    if (!isCurrentMonth) {
      return (
        <div className="relative h-full w-full opacity-40">
          {children}
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        {isToday && (
          <div className="absolute inset-0 border-2 border-indigo-100 bg-indigo-600/50 rounded-lg pointer-events-none z-10" />
        )}

        <div className="relative z-10 h-full">
          {children}
        </div>

        {dayEvents.length > 0 && (
          <EventBadge 
            events={dayEvents}
            profile={perfil}
            date={value} 
            view={view}
            onEventClick={handleEventClick}
            onMultipleEventsClick={handleMultipleEventsClick}
            onBlockClick={handleBlockClick}
          />
        )}

        {isEmptyDay && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 md:gap-2 z-20 bg-neutral-800/40 hover:bg-neutral-700/80 shine rounded-lg transition-opacity duration-200 pointer-events-auto">
            <div className="md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedDate(value);
                  setShowActionModal(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                title="Gestionar día"
              >
                <HiCog size={16} />
              </button>
            </div>

            <div className="hidden md:flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedEventDate(value);
                  setCreateEventModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                title="Agregar evento"
              >
                <HiPlus size={18} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setBlockModalOpen(true);
                  setBlockInitialDate(value);
                }}
                className="bg-red-600 hover:bg-red-800/80 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                title="Bloquear día"
              >
                <HiLockClosed size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CustomTimeSlotWrapper = ({ children, value }: any) => {
    const slotDate = new Date(value);
    
    const eventsAtThisSlot = events.filter(event => {
      return slotDate >= event.inicio && slotDate < (event.fin || event.inicio);
    });

    const isBlockedAtThisSlot = eventsAtThisSlot.some(event => event.es_bloqueo);
    const hasEventsAtThisSlot = eventsAtThisSlot.length > 0;
    const isEmptySlot = !hasEventsAtThisSlot && !isBlockedAtThisSlot;

    return (
      <div className="relative h-full w-full group bg-card">
        {children}
        
        {hasEventsAtThisSlot && (
          <EventBadge 
            profile={perfil}
            events={eventsAtThisSlot}
            date={slotDate} 
            view={view}
            slotTime={slotDate}
            onEventClick={handleEventClick}
            onMultipleEventsClick={handleMultipleEventsClick}
            onBlockClick={handleBlockClick}
          />
        )}
        
        {isEmptySlot && view !== Views.MONTH && (
          <div className="absolute inset-0 flex items-center justify-center z-20 rounded transition-opacity duration-200">
            <div className="md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedDate(slotDate);
                  setShowActionModal(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                title="Gestionar horario"
              >
                <HiCog size={12} />
              </button>
            </div>

            <div className="hidden md:flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedEventDate(slotDate);
                  setCreateEventModalOpen(true);
                }}
                className="bg-green-600 hover:bg-green-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                title="Agregar evento"
              >
                <HiPlus size={14} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setBlockModalOpen(true);
                  setBlockInitialDate(value);
                }}
                className="bg-gray-600 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
                title="Bloquear horario"
              >
                <HiLockClosed size={14} />
              </button>
            </div>
          </div>
        )}

        {isBlockedAtThisSlot && view !== Views.MONTH && (
          <div className="absolute inset-0 bg-red-900/40 pointer-events-none z-10 flex items-center justify-center">
            <HiLockClosed size={20} className="text-red-400 opacity-70" />
          </div>
        )}
      </div>
    );
  };

  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToToday = () => toolbar.onNavigate('TODAY');

    return (
      <div className="flex flex-col md:flex-row justify-between items-center mt-14 mb-4 gap-2">
        <div className="flex items-center gap-5 order-2 md:order-1">
          <button
            className="rbc-btn rbc-btn-group bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg"
            onClick={goToBack}
          >
            ←
          </button>
          <button
            className="rbc-btn bg-sky-600 hover:bg-sky-700 px-4 py-1.5 rounded-lg font-medium"
            onClick={goToToday}
          >
            Hoy
          </button>
          <button
            className="rbc-btn rbc-btn-group bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg"
            onClick={goToNext}
          >
            →
          </button>
        </div>
      
        <div className="text-lg font-semibold flex items-center justify-center flex-col gap-3 mb-6 text-white order-1 md:order-2">
          {toolbar.label}
          <div className="grid grid-cols-2 md:flex items-center gap-1 order-3">
            <button
              onClick={() => setEstadoEvento('')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estadoEvento === '' ? 'bg-green-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
            >
              <FiCalendar className="h-4 w-4" />
              Todos
            </button>
                
            <button
              onClick={() => setEstadoEvento('pendiente')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estadoEvento === 'pendiente' ? 'bg-yellow-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
            >
              <FiClock className="h-4 w-4" />
              Pendientes
            </button>
                
            <button
              onClick={() => setEstadoEvento('confirmado')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estadoEvento === 'confirmado' ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
            >
              <FiCheckCircle className="h-4 w-4" />
              Confirmados
            </button>
            <button
              onClick={() => setEstadoEvento('rechazado')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estadoEvento === 'rechazado' ? 'bg-red-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700'}`}
            >
              <FiXCircle className="h-4 w-4" />
              Rechazados
            </button>
          </div>
        </div>

        <div className="flex items-center gap-5 order-3">
          <button
            className={`rbc-btn ${toolbar.view === 'month' ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'} px-3 py-1.5 rounded-lg text-sm`}
            onClick={() => toolbar.onView('month')}
          >
            Mes
          </button>
          <button
            className={`rbc-btn ${toolbar.view === 'week' ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'} px-3 py-1.5 rounded-lg text-sm`}
            onClick={() => toolbar.onView('week')}
          >
            Semana
          </button>
          <button
            className={`rbc-btn ${toolbar.view === 'day' ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'} px-3 py-1.5 rounded-lg text-sm`}
            onClick={() => toolbar.onView('day')}
          >
            Día
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-[750px] md:h-[1050px] lg:h-[1050px] mt-10 bg-neutral-900/20 rounded-2xl md:p-2 overflow-hidden md:border-4 border-neutral-800/70 relative">
        
        {/* FloatingDateSelector completo */}
        <button
          onClick={() => setShowDateSelectors(!showDateSelectors)}
          className="absolute top-2 right-[30%] md:right-4 z-40 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg border border-neutral-700 shadow-lg transition-all"
        >
          <HiCalendar size={16} />
          <span className="hidden sm:inline">
            {date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </span>
          <span className="sm:hidden">
            {date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
          </span>
          <HiChevronDown size={16} className={`transition-transform ${showDateSelectors ? 'rotate-180' : ''}`} />
        </button>

        {showDateSelectors && (
          <div className="absolute top-16 right-4 z-30 bg-neutral-800/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-700 shadow-2xl w-64">
            <div className="mb-3">
              <label className="block text-sm text-neutral-300 mb-1">Seleccionar Mes</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ].map((month, index) => (
                  <button
                    key={month}
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setMonth(index);
                      setDate(newDate);
                      setShowDateSelectors(false);
                    }}
                    className={`p-2 text-xs rounded-lg transition-all ${
                      date.getMonth() === index ? 'bg-sky-600 text-white' : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                    }`}
                  >
                    {month.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm text-neutral-300 mb-1">Seleccionar Año</label>
              <select
                value={date.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(date);
                  newDate.setFullYear(parseInt(e.target.value));
                  setDate(newDate);
                }}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 3 + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setDate(new Date());
                setShowDateSelectors(false);
              }}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Ir al Mes Actual
            </button>
          </div>
        )}

        <BigCalendar
          localizer={localizer}
          events={[]} // ← Como tú dijiste: NO se usan eventos aquí, EventBadge los renderiza
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week', 'day']}
          culture="es"
          selectable
          popup
          step={60}
          messages={{
            next: '→',
            previous: '←',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
          components={{
            toolbar: CustomToolbar,
            dateCellWrapper: CustomDateCellWrapper,
            timeSlotWrapper: CustomTimeSlotWrapper,
            header: ({ label }: any) => (
              <div className="text-md  md:text-xl md:text-center">
                {label}
              </div>
            ),
          }}
        />
      </div>

      {/* Modal de acciones para móvil */}
      {showActionModal && selectedDate && (
        <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4 md:hidden">
          <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-bold mb-4">
              Gestiona {format(selectedDate, 'dd/MM/yyyy')}
            </h3>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setSelectedEventDate(selectedDate);
                  setCreateEventModalOpen(true);
                  setShowActionModal(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <HiPlus size={20} />
                Evento
              </button>
              
              <button
                onClick={() => {
                  setBlockModalOpen(true);
                  setBlockInitialDate(selectedDate);
                  setShowActionModal(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <HiLockClosed size={20} />
                Bloquear
              </button>
            </div>
            
            <button
              onClick={() => setShowActionModal(false)}
              className="w-full bg-neutral-500 hover:bg-neutral-600 text-white py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {blockModalOpen && (
        <BlockDateModal
          open={blockModalOpen}
          onClose={() => {
            setBlockModalOpen(false);
            fetchEvents();
          }}
          profile={perfil}
          initialDate={blockInitialDate || new Date()}
        />
      )}

      {createEventModalOpen && selectedEventDate && (
        <CrearEventoModal
          open={createEventModalOpen}
          onClose={() => {
            setCreateEventModalOpen(false);
            setSelectedEventDate(null);
            fetchEvents();
          }}
          profile={perfil}
          selectedDate={selectedEventDate}
        />
      )}

      {eventModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={eventModalOpen}
          onRequestClose={() => {
            setEventModalOpen(false);
            setSelectedEvent(null);
          }}
          profile={perfil}
          onEventUpdated={fetchEvents}
        />
      )}

      {timelineModalOpen && selectedDayForTimeline && (
        <DayTimelineModal
          profile={perfil}
          date={selectedDayForTimeline}
          isOpen={timelineModalOpen}
          onClose={() => {
            setTimelineModalOpen(false);
            setDayEventsForTimeline([]);
            setSelectedDayForTimeline(null);
            fetchEvents();
          }}
          onEventUpdated={fetchEvents}
        />
      )}

      {desbloquearModalOpen && selectedBlock && (
        <DesbloquearModal
          event={selectedBlock}
          isOpen={desbloquearModalOpen}
          onClose={() => {
            setDesbloquearModalOpen(false);
            setSelectedBlock(null);
          }}
          onBlockDeleted={handleBlockDeleted}
        />
      )}
    </>
  );
}