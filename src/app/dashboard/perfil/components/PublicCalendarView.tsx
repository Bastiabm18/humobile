// app/perfil/components/PublicCalendarView.tsx
'use client';

import { useEffect, useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, getDay, isSameDay, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { HiCalendar, HiChevronDown } from 'react-icons/hi';
import { FaPaperPlane, FaCrown } from 'react-icons/fa';
import { BsFillInfoSquareFill } from 'react-icons/bs';
import PublicEventBadge from './PublicEventBadge';
import { getEventosByPerfilParticipacion } from '../../agenda/actions/actions';
import { usePermisos } from '@/app/hooks/usePermisos';
import { EventoCalendario } from '@/types/profile';
import { useRouter } from 'next/navigation';

const localizer = dateFnsLocalizer({
  format,
  parse: (str: string) => new Date(str),
  startOfWeek,
  getDay,
  locales: { es },
});

interface PublicCalendarViewProps {
  profileId: string;
  perfilTipo: string;
  perfilNombre: string;
  onInvitar?: (fecha?: Date, horaInicio?: Date, horaFin?: Date) => void;
}

export default function PublicCalendarView({ 
  profileId, 
  perfilTipo, 
  perfilNombre,
  onInvitar 
}: PublicCalendarViewProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDateSelectors, setShowDateSelectors] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [verModalInformativo, setVerModalInformativo] = useState(false);
  
  const router = useRouter();
  const { activo } = usePermisos({});
  const puedeInvitar = activo('CREAR_EVENTO');

  const defaultScrollTime = new Date();
  defaultScrollTime.setHours(8, 0, 0);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await getEventosByPerfilParticipacion(profileId, 'confirmado');
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Error cargando eventos públicos:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [profileId]);

  const getEventsForDate = (targetDate: Date): EventoCalendario[] => {
    const targetString = format(targetDate, 'yyyy-MM-dd');
    return events.filter(event => {
      const startString = format(event.inicio, 'yyyy-MM-dd');
      const endString = event.fin ? format(event.fin, 'yyyy-MM-dd') : startString;
      return startString === targetString || endString === targetString ||
             (event.inicio < targetDate && event.fin > targetDate);
    });
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    if (!puedeInvitar) return;
    // ===== VALIDACIÓN: VERIFICAR SI HAY EVENTOS EN ESE RANGO =====
    const slotStart = slotInfo.start.getTime();
    const slotEnd = slotInfo.end.getTime();

    const hayEventos = events.some(event => {
      const eventStart = event.inicio.getTime();
      const eventEnd = event.fin ? event.fin.getTime() : eventStart + 3600000;
      return slotStart < eventEnd && slotEnd > eventStart;
    });

    // Si hay eventos (públicos o privados), no hacer nada
    if (hayEventos) return;
    // ============================================================
    
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setSelectedDate(slotInfo.start);
    setShowActionModal(true);
  };

  const handleInviteClick = () => {
    if (selectedSlot && onInvitar) {
      onInvitar(selectedDate!, selectedSlot.start, selectedSlot.end);
    } else if (selectedDate && onInvitar) {
      onInvitar(selectedDate);
    }
    setShowActionModal(false);
    setSelectedSlot(null);
    setSelectedDate(null);
  };

  const CustomDateCellWrapper = ({ children, value }: any) => {
    const dayEvents = getEventsForDate(value);
    const isToday = isSameDay(value, new Date());
    const isCurrentMonth = isSameMonth(value, date);
    const isEmptyDay = dayEvents.length === 0 && isCurrentMonth;

    if (!isCurrentMonth) {
      return <div className="relative h-full w-full opacity-40">{children}</div>;
    }

    return (
      <div className="relative h-full w-full">
        {isToday && (
          <div className="absolute inset-0 border-2 border-sky-100 bg-sky-600/50 rounded-lg pointer-events-none z-10" />
        )}
        
        <div className="relative z-10 h-full">{children}</div>
        
        {dayEvents.length > 0 && (
          <PublicEventBadge 
            events={dayEvents}
            profile={{ id: profileId, tipo: perfilTipo, nombre: perfilNombre }} 
            date={value} 
            view={view}
            onEventClick={() => {}}
            onMultipleEventsClick={() => {}}
            onBlockClick={() => {}}
          />
        )}

        {/* Botones en celdas vacías (vista mes) */}
        {isEmptyDay && view === Views.MONTH && (
          <div className="absolute inset-0 flex items-center justify-center gap-1 md:gap-2 z-20 bg-neutral-800/40 hover:bg-neutral-700/80 rounded-lg transition-opacity duration-200 pointer-events-auto">
            <div className="md:hidden border border-neutral-500/40 w-[99vw] h-[99%] flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (puedeInvitar) {
                    setSelectedDate(value);
                    setShowActionModal(true);
                  }
                }}
                className="text-green-700/90 p-2 w-full h-full shadow-xl hover:scale-110 transition-all duration-200"
                title={`Invitar a ${perfilNombre} en esta fecha`}
              >
                <FaPaperPlane size={18} />
              </button>
            </div>

            <div className="hidden md:flex gap-2 z-40 relative">
              <div className={`flex gap-2 ${!puedeInvitar ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (puedeInvitar) {
                      setSelectedDate(value);
                      setShowActionModal(true);
                    }
                  }}
                  className="bg-green-600/70 hover:bg-green-700/80 text-white p-2 rounded-full shadow-xl hover:scale-110 transition-all duration-200"
                  title={`Invitar a ${perfilNombre} en esta fecha`}
                >
                  <FaPaperPlane size={18} />
                </button>
              </div>

              {!puedeInvitar && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/dashboard/serPremium');
                  }}
                  className="absolute -bottom-1/2 left-1/2 transform -translate-x-1/2 z-[9999] bg-neutral-900/60 border border-neutral-700 rounded-lg p-3 shadow-xl whitespace-nowrap hover:bg-red-900/90 hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-yellow-400 font-medium text-xs flex-col">
                    <span className='text-center'>Mejora tu plan<br/>para enviar invitaciones</span>
                    <div className="flex items-center gap-1 mt-2">
                      <FaCrown className='text-yellow-400'/>
                      <span className="text-green-400 hover:text-green-300 text-sm font-medium">Mejorar Plan</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CustomTimeSlotWrapper = ({ children, value, resource }: any) => {
    const esColumnaHora = resource === undefined || resource === 'timeGutter';
    const slotDate = value;
    const slotMs = slotDate.getTime();
    
    const eventsAtThisSlot = events.filter(event => {
      const inicioMs = event.inicio.getTime();
      const finMs = event.fin ? event.fin.getTime() : inicioMs + 3600000;
      return slotMs >= inicioMs && slotMs < finMs;
    });
    
    const hasEventsAtThisSlot = eventsAtThisSlot.length > 0;
    const isEmptySlot = !hasEventsAtThisSlot;

    return (
      <div className="relative h-full w-full group">
        {children}
        
        {hasEventsAtThisSlot && !esColumnaHora && (
              <PublicEventBadge 
                profile={{ id: profileId, tipo: perfilTipo, nombre: perfilNombre }}
                events={eventsAtThisSlot}
                date={slotDate} 
                view={view}
                slotTime={slotDate}
                onEventClick={() => {}}
                onMultipleEventsClick={() => {}}
                onBlockClick={() => {}}
                esColumnaHora={esColumnaHora}
              />
            )}
        {/* Botón de invitar en slots vacíos (vista semana/día) */}
        {isEmptySlot && view !== Views.MONTH && !esColumnaHora && puedeInvitar && (
          <div className="absolute inset-0 flex items-center justify-center z-40 rounded transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedSlot({ start: slotDate, end: new Date(slotDate.getTime() + 3600000) });
                setSelectedDate(slotDate);
                setShowActionModal(true);
              }}
              className="bg-green-600/80 hover:bg-green-700 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-all"
              title={`Invitar a ${perfilNombre} en este horario`}
            >
              <FaPaperPlane size={14} />
            </button>
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
          <button className="rbc-btn bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg" onClick={goToBack}>←</button>
          <button className="rbc-btn bg-sky-600 hover:bg-sky-700 px-4 py-1.5 rounded-lg font-medium" onClick={goToToday}>Hoy</button>
          <button className="rbc-btn bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg" onClick={goToNext}>→</button>
        </div>
      
        <div className="text-lg font-semibold flex items-center justify-center flex-col gap-3 mb-6 text-white order-1 md:order-2">
          {toolbar.label}
        </div>

        <div className="flex items-center gap-5 order-3">
          <button className={`rbc-btn ${toolbar.view === 'month' ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'} px-3 py-1.5 rounded-lg text-sm`} onClick={() => toolbar.onView('month')}>Mes</button>
          <button className={`rbc-btn ${toolbar.view === 'week' ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'} px-3 py-1.5 rounded-lg text-sm`} onClick={() => toolbar.onView('week')}>Semana</button>
          <button className={`rbc-btn ${toolbar.view === 'day' ? 'bg-sky-600' : 'bg-neutral-800 hover:bg-neutral-700'} px-3 py-1.5 rounded-lg text-sm`} onClick={() => toolbar.onView('day')}>Día</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="h-[750px] md:h-[1050px] bg-neutral-900/20 rounded-2xl animate-pulse" />;
  }

  return (
    <>
      <div className="h-[95vh] bg-neutral-900/20 rounded-2xl md:p-2 overflow-hidden md:border-4 border-neutral-800/70 relative">
        
        {/* Botón de información */}
        <button 
          onClick={() => setVerModalInformativo(true)}
          className="absolute top-2 left-[5%] md:left-4 z-40 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg border border-neutral-700 shadow-lg transition-all"
        >
          <BsFillInfoSquareFill size={16} /> Info
        </button>
        
        {/* Selector de fecha */}
        <button
          onClick={() => setShowDateSelectors(!showDateSelectors)}
          className="absolute top-2 right-[5%] md:right-4 z-40 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg border border-neutral-700 shadow-lg transition-all"
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

        {/* Selector de fecha desplegable */}
        {showDateSelectors && (
          <div className="absolute top-16 right-4 z-50 bg-neutral-800/95 backdrop-blur-sm p-4 rounded-xl border border-neutral-700 shadow-2xl w-64">
            <div className="mb-3">
              <label className="block text-sm text-neutral-300 mb-1">Seleccionar Mes</label>
              <div className="grid grid-cols-3 gap-2">
                {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, index) => (
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
                    {month}
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
                  <option key={year} value={year}>{year}</option>
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
          events={[]}
          startAccessor="start"
          endAccessor="end"
          scrollToTime={defaultScrollTime}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          views={['month', 'week', 'day']}
          culture="es"
          selectable={puedeInvitar}
          onSelectSlot={handleSelectSlot}
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
              <div className="text-md md:text-xl md:text-center">{label}</div>
            ),
          }}
        />
      </div>

      {/* Modal de invitación */}
      {showActionModal && selectedDate && (
        <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-bold mb-4">
              Invitar a {perfilNombre}
            </h3>
            <p className="text-neutral-300 mb-4">
              {selectedSlot ? (
                <>Fecha: {format(selectedDate, 'dd/MM/yyyy')}<br/>
                Horario: {format(selectedSlot.start, 'HH:mm')} - {format(selectedSlot.end, 'HH:mm')}</>
              ) : (
                <>Fecha: {format(selectedDate, 'dd/MM/yyyy')}</>
              )}
            </p>
            
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleInviteClick}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <FaPaperPlane size={20} />
                Enviar Invitación
              </button>
            </div>
            
            <button
              onClick={() => {
                setShowActionModal(false);
                setSelectedSlot(null);
                setSelectedDate(null);
              }}
              className="w-full bg-neutral-500 hover:bg-neutral-600 text-white py-2 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal informativo */}
      {verModalInformativo && (
        <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">ℹ️ Información de la Agenda</h3>
            <div className="space-y-3 text-neutral-300">
              <p> Los eventos mostrados son los <strong className="text-green-400">confirmados</strong> de {perfilNombre}.</p>
              <p> Puedes invitar a {perfilNombre} a tus eventos seleccionando una fecha u horario disponible.</p>
              <p> Los espacios con eventos ya están ocupados.</p>
              <p> Al invitar, {perfilNombre} recibirá una notificación y podrá aceptar o rechazar tu invitación.</p>
            </div>
            <button
              onClick={() => setVerModalInformativo(false)}
              className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}