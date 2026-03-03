// app/dashboard/agenda/CalendarView.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, getDay, isSameDay, isSameMonth, isWithinInterval, subHours } from 'date-fns';
import { HiChevronDown, HiCalendar, HiPlus, HiLockClosed, HiCog } from 'react-icons/hi';
import { es } from 'date-fns/locale';
import { FiCalendar, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import { addHours } from 'date-fns';

import BlockDateModal from './BlockDateModal';
import CrearEventoModal from './CrearEventoModal';
import { Profile } from '@/types/profile'; 
import EventBadge from './EventBadge';
import EventModal from './EventModal';
import DayTimelineModal from './DayTimelineModal';
import DesbloquearModal from './DesbloquearModal';

import { getEventosByPerfilParticipacion } from '../actions/actions';
import { EventoCalendario } from '@/types/profile';
import IntegrantesEventoModal from './IntegrantesEventoModal';
const localizer = dateFnsLocalizer({
  format,
  parse: (str: string) => new Date(str),
  startOfWeek,
  getDay,
  locales: { es },
});

export default function CalendarView({ profileId, perfil }: { profileId: string; perfil: Profile }) {
  // PARTIMOS EN VISTA SEMANA??
  const [view, setView] = useState<View>(Views.WEEK);
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

  const [selectedEventointegrante, SetselectedEventointegrante] = useState<string | null>(null)
  const [eventoIntegranteModalOpen, SeteventoIntegranteModalOpen]= useState(false)

  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [dayEventsForTimeline, setDayEventsForTimeline] = useState<EventoCalendario[]>([]);
  const [selectedDayForTimeline, setSelectedDayForTimeline] = useState<Date | null>(null);

  const [selectedBlock, setSelectedBlock] = useState<EventoCalendario | null>(null);
  const [desbloquearModalOpen, setDesbloquearModalOpen] = useState(false);

  const [showDateSelectors, setShowDateSelectors] = useState(false);

  const [estadoEvento, setEstadoEvento] = useState<string>(''); // '' = TODOS
  // states para el selector de horas por arrastre 
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);

  // states para seleccion multiple en vista semana 
  const [selectedFechaIni, setSelectedFechaIni] = useState<Date | undefined >(undefined);
  const [selectedFechaFin, setSelectedFechaFin] = useState<Date | undefined >(undefined);

  const [showHorasMultiplesModal, setShowHorasMultiplesModal] = useState(false);
  const [isButtonClick, setIsButtonClick] = useState(false);


  useEffect(() => {
  // Resetear isButtonClick después de cierto tiempo por si acaso MNO CAMBIA EL ESTADO A FALSE
  // IMPORTANTE PARA QUE FUNCIONE SELECTABLE EN VISTA SEMANA Y DIA
  const timer = setTimeout(() => {
    if (isButtonClick) {
      setIsButtonClick(false);
    }
  }, 500);
  
  return () => clearTimeout(timer);
}, [isButtonClick]);


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
      console.log(fetchedEvents)
    } catch (err: any) {
      console.error('Error cargando eventos:', err);
      setError(err.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

const handleSelectSlot = (slotInfo: { start: Date; end: Date; slots: Date[] }) => {
  // Si el clic viene de un botón, IGNORAR completamente
  if (isButtonClick) {
    console.log('Ignorando selectSlot porque es clic en botón');
    setIsButtonClick(false); // Reseteamos inmediatamente
    return;
  }

  const hasExistingEvent = events.some(event => {
    const eventStart = event.inicio.getTime();
    const eventEnd = event.fin ? event.fin.getTime() : eventStart + 3600000;
    const slotStart = slotInfo.start.getTime();
    const slotEnd = slotInfo.end.getTime();

    return slotStart < eventEnd && slotEnd > eventStart; // Sin subHours
  });

  if (hasExistingEvent) {
    return;
  }
  
  const fechaInicio = format(slotInfo.start, 'yyyy-MM-dd HH:mm:ss');
  const fechaFin = format(slotInfo.end, 'yyyy-MM-dd HH:mm:ss');

  console.log('Inicio:', fechaInicio);
  console.log('Fin:', fechaFin);
  setSelectedFechaIni(fechaInicio as unknown as Date);
  setSelectedFechaFin(fechaFin as unknown as Date);
  
  // Solo mostrar modal en vista SEMANA/DÍA
  if (view !== Views.MONTH) {
    setShowHorasMultiplesModal(true);
  }
};

// Añade esta función para manejar selección de eventos
const handleSelectEvent = (event: EventoCalendario) => {
  console.log('Evento seleccionado:', event);
  handleEventClick(event, event.es_evento_integrante);
};

  const handleEventClick = (event: EventoCalendario, es_evento_integrante: Boolean | undefined) => {
    console.log(es_evento_integrante)
    if(es_evento_integrante){
      console.log(event);
      SetselectedEventointegrante(event.id)
      console.log(profileId);
      SeteventoIntegranteModalOpen(true);

    }else{
      setSelectedEvent(event);
      setEventModalOpen(true);

    }
  };

  const handleMultipleEventsClick = (eventsList: EventoCalendario[], date: Date) => {
    setDayEventsForTimeline(eventsList);
    setSelectedDayForTimeline(date);
    setTimelineModalOpen(true);
  };

  const handleBlockClick = (blockEvent: EventoCalendario, es_evento_integrante: Boolean | undefined) => {
    if(es_evento_integrante){
      SetselectedEventointegrante(blockEvent.id)
      console.log(profileId);
      SeteventoIntegranteModalOpen(true);
    }else{
      blockEvent
      setSelectedBlock(blockEvent);
      setDesbloquearModalOpen(true);
    }
   
  };

  const handleBlockDeleted = () => {
    fetchEvents();
  };

const getEventsForDate = (targetDate: Date): EventoCalendario[] => {
  const targetString = format(targetDate, 'yyyy-MM-dd');
  return events.filter(event => {
    const startString = format(event.inicio, 'yyyy-MM-dd');
    const endString = event.fin ? format(event.fin, 'yyyy-MM-dd') : startString;
    return startString === targetString || endString === targetString ||
           (event.inicio < targetDate && event.fin > targetDate);
  });
};
  const defaultScrollTime = new Date();
    defaultScrollTime.setHours(8, 0, 0);

  const CustomDateCellWrapper = ({ children, value,resource }: any) => {
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
          <div className="absolute inset-0 border-2 border-sky-100 bg-sky-600/50 rounded-lg pointer-events-none z-10" />
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
          <div className="absolute inset-0  flex items-center justify-center gap-1 md:gap-2 z-20 bg-neutral-800/40 hover:bg-neutral-700/80 shine rounded-lg transition-opacity duration-200 pointer-events-auto">
            <div className="md:hidden border border-neutral-500/40 w-[99vw] h-[99%] flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedDate(value);
                  setShowActionModal(true);
                }}
                className=" text-green-100 p-2 w-full h-full  shadow-xl hover:scale-110 transition-all duration-200"
                title="Gestionar día"
              >
              
              </button>
            </div>

              {view == Views.MONTH && (
                <>
                            <div className="hidden md:flex gap-2 z-40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                 setIsButtonClick(true); 
                                setSelectedEventDate(value);
                                setCreateEventModalOpen(true);
                              }}
                              className="bg-green-600/70  hover:bg-green-700/80 text-green-100/80 p-2 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                              title="Agregar evento"
                            >
                              <HiPlus size={18} />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                 setIsButtonClick(true); 
                                setBlockModalOpen(true);
                                setBlockInitialDate(value);
                              }}
                              className="bg-red-600/70 hover:bg-red-800/80 text-red-100 p-2 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                              title="Bloquear día"
                            >
                              <HiLockClosed size={18} />
                            </button>
                          </div>
                </>
              )}
              
          </div>
        )}
      </div>
    );
  };

  const CustomTimeSlotWrapper = ({ children, value,resource }: any) => {
     // 'resource' indica la columna (undefined = columna de horas, 0 = Lunes, etc.)
  const esColumnaHora = resource === undefined || resource === 'timeGutter';
  const slotDate = value; // sin subHours
  const slotMs = slotDate.getTime();
  //console.log('Renderizando slot:', slotDate, 'Columna hora:', esColumnaHora);
  
  const eventsAtThisSlot = events.filter(event => {
    const inicioMs = event.inicio.getTime();
    const finMs = event.fin ? event.fin.getTime() : inicioMs + 3600000;
    return slotMs >= inicioMs && slotMs < finMs;
  });
    const isBlockedAtThisSlot = eventsAtThisSlot.some(event => event.es_bloqueo);
    const hasEventsAtThisSlot = eventsAtThisSlot.length > 0;
    const isEmptySlot = !hasEventsAtThisSlot && !isBlockedAtThisSlot;

    return (
      <div className="relative h-full w-full group transparent">
        {children}
        
        {hasEventsAtThisSlot && !esColumnaHora && (
          <EventBadge 
            profile={perfil}
            events={eventsAtThisSlot}
            date={slotDate} 
            view={view}
            slotTime={slotDate}
            onEventClick={handleEventClick}
            onMultipleEventsClick={handleMultipleEventsClick}
            onBlockClick={handleBlockClick}
             esColumnaHora={esColumnaHora}
          />
        )}
        
        {isEmptySlot && view !== Views.MONTH && !esColumnaHora && (
          <div className="absolute inset-0 flex items-center justify-center z-40 rounded transition-opacity duration-200">
            <div className="md:hidden  border border-neutral-500/40 w-[99vw] h-[99%] flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setSelectedDate(slotDate);
                  setShowActionModal(true);
                }}
                className="bg-neutral-800/30 hover:bg-green-500 w-full h-full text-white p-1.5 shadow-lg hover:scale-110 transition-all"
                title="Gestionar horario"
              >
              
              </button>
            </div>
{/**
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

             */}
          </div>
        )}

    {/** 
            * 
        {isBlockedAtThisSlot && view !== Views.MONTH && !esColumnaHora && (
          <div className="absolute inset-0 bg-red-900/40 pointer-events-none z-10 flex items-center justify-center">
            <HiLockClosed size={20} className="text-red-400 opacity-70" />
          </div>
        )}
          */}
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
          <div className="absolute top-16 right-4 z-50 bg-neutral-800/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-700 shadow-2xl w-64">
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
          events={[]} // NO se usan eventos aquí, EventBadge los renderiza
          startAccessor="start"
          endAccessor="end"
          scrollToTime={defaultScrollTime}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week', 'day']}
          culture="es"
          selectable       
  onSelectSlot={handleSelectSlot} // ← AÑADE ESTO
  
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
              Gestionar    {format(selectedDate, 'dd/MM/yyyy')}
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
      {/* Modal de acciones vista semana */}
      { showHorasMultiplesModal && selectedFechaIni && selectedFechaFin && (
        <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4 ">
          <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-bold mb-4">
              Gestiona {selectedFechaIni ? format(selectedFechaIni, 'dd-MM-yyyy') : ''}
            </h3>
            <h4>
            Periodo: {selectedFechaIni ? format(selectedFechaIni, 'HH:mm:ss') : ''} - {selectedFechaFin ? format(selectedFechaFin, 'HH:mm:ss') : ''}
            </h4>
    
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setSelectedEventDate(selectedFechaIni);
                  setCreateEventModalOpen(true);
                  setShowHorasMultiplesModal(false);
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
                  setShowHorasMultiplesModal(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-800 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <HiLockClosed size={20} />
                Bloquear
              </button>
            </div>
            
            <button
              onClick={() => setShowHorasMultiplesModal(false)}
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
            setSelectedFechaFin(undefined)
            setSelectedFechaIni(undefined)
          }}
          profile={perfil}
          initialDate={selectedFechaIni ? selectedFechaIni: blockInitialDate || new Date()}
          finalDate={selectedFechaFin}
        />
      )}

      {createEventModalOpen && selectedEventDate && (
        <CrearEventoModal
          open={createEventModalOpen}
          onClose={() => {
            setCreateEventModalOpen(false);
            setSelectedEventDate(null);
            fetchEvents();
            setSelectedFechaFin(undefined);
          }}
          profile={perfil}
          selectedDate={selectedEventDate}
          selectedEndDate={selectedFechaFin}
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

      {/**MUESTRA UN MODAL PARA INFORMAR A 1 BANDA CUANDO 1 INTEGRANTE TIENE 1 EVENTO EN UNA FECHA Y HORA DE MANERA INDIVIDUAL Y NO CON LA BANDA  */}
      {eventoIntegranteModalOpen &&  selectedEventointegrante &&(

        <IntegrantesEventoModal
          isOpen={eventoIntegranteModalOpen}
          onClose={()=>{
            SeteventoIntegranteModalOpen(false);
          }}
          bandaId={profileId}
          eventoId={selectedEventointegrante}
        
        
        />

      )}
    </>
  );
}