'use client';

import { useState, useEffect } from 'react';
import { 
  FaCheckCircle, FaTimesCircle, FaClock, FaEye, 
  FaCalendarPlus, FaLock, FaSort, FaSortUp, FaSortDown, FaCheck 
} from 'react-icons/fa';
import { HiCalendar, HiLocationMarker } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { EventoCalendario, Profile } from '@/types/profile';
import { getEventosByPerfilParticipacion } from '../actions/actions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import NeonSign from '@/app/components/NeonSign';
import EventModal from '../../agenda/components/EventModal';
import { aceptarSolicitud, rechazarSolicitud, eliminarEvento } from '../actions/actions';
import { MdOutlineBlock } from 'react-icons/md';
import { FaTrashCan } from 'react-icons/fa6';
import RespuestaModal from './RespuestaModal';

interface EventosTableProps {
  profile: Profile;
  onCreateEvent?: () => void;
  onBlockDate?: () => void;
}

type SortField = 'inicio' | 'titulo' | 'estado';
type SortDirection = 'asc' | 'desc';
type ParticipacionEstado = 'todos' | 'pendiente' | 'confirmado' | 'rechazado';

export default function EventosTable({ profile, onCreateEvent, onBlockDate }: EventosTableProps) {
  const [events, setEvents] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('inicio');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [selectedEvent, setSelectedEvent] = useState<{id:string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'delete' | 'reject' | null>(null);
  const [eventToAction, setEventToAction] = useState<EventoCalendario | null>(null);

  const [participacionFilter, setParticipacionFilter] = useState<ParticipacionEstado>('todos');

  const [showRespuestaModal, setShowRespuestaModal] = useState(false);
  const [respuestaModalProps, setRespuestaModalProps] = useState({
    type: 'success' as 'success' | 'error' | 'warning',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadEvents(participacionFilter);
  }, [profile.id, participacionFilter]);

  const loadEvents = async (filter: ParticipacionEstado) => {
    try {
      setLoading(true);
      setError(null);

      const estado = filter === 'todos' ? undefined : filter;
      const data = await getEventosByPerfilParticipacion(profile.id, estado);
      
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilterButtonClass = (filter: ParticipacionEstado) => {
    const isActive = participacionFilter === filter;
    let colorClass = '';
    
    if (filter === 'todos') colorClass = 'bg-blue-600 text-white';
    else if (filter === 'pendiente') colorClass = 'bg-yellow-600 text-white';
    else if (filter === 'confirmado') colorClass = 'bg-green-600 text-white';
    else if (filter === 'rechazado') colorClass = 'bg-red-600 text-white';

    return `flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium transition-all ${
      isActive 
        ? colorClass 
        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
    }`;
  };

  const handleViewEvent = (event: EventoCalendario) => {
    setSelectedEvent({id:event.id as string});
    setIsModalOpen(true);
  };

  const sortedEvents = [...events].sort((a, b) => {
    let aValue: any, bValue: any;
    
    if (sortField === 'inicio') {
      aValue = new Date(a.inicio).getTime();
      bValue = new Date(b.inicio).getTime();
    } else if (sortField === 'titulo') {
      aValue = a.titulo.toLowerCase();
      bValue = b.titulo.toLowerCase();
    } else {
      aValue = a.es_bloqueo ? 0 : 1; // bloqueados primero o después según prefieras
      bValue = b.es_bloqueo ? 0 : 1;
    }

    return sortDirection === 'asc' 
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusColor = (event: EventoCalendario) => {
    if (event.es_bloqueo) return 'bg-red-500/20 text-red-300 border-red-500/30';
    
    // Si no es bloqueo, usamos el filtro actual como guía visual
    if (participacionFilter === 'pendiente') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (participacionFilter === 'confirmado') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (participacionFilter === 'rechazado') return 'bg-red-500/20 text-red-300 border-red-500/30';
    
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30'; // fallback
  };

  const getStatusIcon = (event: EventoCalendario) => {
    if (event.es_bloqueo) return <FaLock className="text-red-400" />;
    
    if (participacionFilter === 'pendiente') return <FaClock className="text-yellow-400" />;
    if (participacionFilter === 'confirmado') return <FaCheckCircle className="text-green-400" />;
    if (participacionFilter === 'rechazado') return <FaTimesCircle className="text-red-400" />;
    
    return <FaCheckCircle className="text-gray-400" />;
  };

  const getStatusText = (event: EventoCalendario) => {
    if (event.es_bloqueo) return 'Bloqueado';
    if (participacionFilter === 'todos') return 'Activo';
    return participacionFilter.charAt(0).toUpperCase() + participacionFilter.slice(1);
  };

  const handleAcceptEvent = (event: EventoCalendario) => {
    setEventToAction(event);
    setActionType('accept');
    setShowConfirmModal(true);
  };

  const handleRechazarEvent = (event: EventoCalendario) => {
    setEventToAction(event);
    setActionType('reject');
    setShowConfirmModal(true);
  };

  const handleEliminarEvent = (event: EventoCalendario) => {
    setEventToAction(event);
    setActionType('delete');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!eventToAction || !actionType) return;

    try {
      let result;

      if (actionType === 'accept') {
        result = await aceptarSolicitud({ 
          id_evento: eventToAction.id, 
          motivo: '', 
          id_perfil: profile.id 
        });
      } else if (actionType === 'delete') {
        result = await eliminarEvento({ 
          id_evento: eventToAction.id, 
          motivo: 'eliminado por el usuario', 
          id_perfil: profile.id 
        });
      } else if (actionType === 'reject') {
        result = await rechazarSolicitud({ 
          id_evento: eventToAction.id, 
          motivo: 'rechazado por el usuario', 
          id_perfil: profile.id 
        });
      }

      setRespuestaModalProps({
        type: result?.success ? 'success' : 'error',
        title: result?.success ? '¡Éxito!' : 'Error',
        message: result?.success 
          ? `${actionType === 'accept' ? 'Aceptado' : actionType === 'delete' ? 'Eliminado' : 'Rechazado'} correctamente`
          : result?.error || 'Error desconocido'
      });

      if (result?.success) {
        loadEvents(participacionFilter);
      }

      setShowRespuestaModal(true);
    } catch (err: any) {
      setRespuestaModalProps({
        type: 'error',
        title: 'Error',
        message: 'No se pudo completar la acción'
      });
      setShowRespuestaModal(true);
    } finally {
      setShowConfirmModal(false);
      setEventToAction(null);
      setActionType(null);
    }
  };

  const ConfirmModal = () => {
    if (!showConfirmModal || !actionType) return null;

    const configs = {
      accept: {
        title: 'Confirmar aceptación',
        message: '¿Realmente deseas aceptar esta invitación?',
        confirmText: 'Sí, aceptar',
        confirmColor: 'bg-green-600 hover:bg-green-700',
        icon: <FaCheckCircle className="text-green-400 text-3xl" />
      },
      delete: {
        title: 'Confirmar eliminación',
        message: '¿Estás seguro? Esta acción no se puede deshacer.',
        confirmText: 'Sí, eliminar',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: <FaTrashCan className="text-red-400 text-3xl" />
      },
      reject: {
        title: 'Confirmar rechazo',
        message: '¿Realmente deseas rechazar esta invitación?',
        confirmText: 'Sí, rechazar',
        confirmColor: 'bg-red-600 hover:bg-red-700',
        icon: <FaTimesCircle className="text-red-400 text-3xl" />
      }
    };

    const config = configs[actionType];

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
        <div className="bg-neutral-900 rounded-xl border border-neutral-700 w-full max-w-md">
          <div className="p-6 border-b border-neutral-700 flex items-center gap-3">
            {config.icon}
            <h3 className="text-xl font-bold text-white">{config.title}</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-300 mb-6">{config.message}</p>
            {eventToAction && (
              <div className="bg-neutral-800/50 p-4 rounded-lg mb-6">
                <p className="text-white font-medium">{eventToAction.titulo}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {format(new Date(eventToAction.inicio), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-neutral-700 flex gap-3">
            <button
              onClick={() => {
                setShowConfirmModal(false);
                setEventToAction(null);
                setActionType(null);
              }}
              className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAction}
              className={`flex-1 py-3 ${config.confirmColor} text-white font-bold rounded-lg transition`}
            >
              {config.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-128"><NeonSign /></div>;

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
        <FaTimesCircle className="text-red-400 text-3xl mx-auto mb-3" />
        <p className="text-red-300 font-medium">{error}</p>
        <button
          onClick={() => loadEvents(participacionFilter)}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Mis participaciones</h2>
            <p className="text-gray-400 mt-1">
              {events.length} evento{events.length !== 1 ? 's' : ''}
              {participacionFilter !== 'todos' && ` (${participacionFilter})`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={onCreateEvent} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all hover:scale-[1.02] shadow-lg">
              <FaCalendarPlus /> Crear Evento
            </button>
            <button onClick={onBlockDate} className="flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white font-medium rounded-xl transition-all hover:scale-[1.02] shadow-lg">
              <FaLock /> Bloquear Fecha
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 w-full sm:w-auto">
            <button onClick={() => setParticipacionFilter('todos')} className={getFilterButtonClass('todos')}>Todos</button>
            <button onClick={() => setParticipacionFilter('pendiente')} className={getFilterButtonClass('pendiente')}>
              <FaClock className="inline mr-2" /> Pendientes
            </button>
            <button onClick={() => setParticipacionFilter('confirmado')} className={getFilterButtonClass('confirmado')}>
              <FaCheckCircle className="inline mr-2" /> Confirmados
            </button>
            <button onClick={() => setParticipacionFilter('rechazado')} className={getFilterButtonClass('rechazado')}>
              <FaTimesCircle className="inline mr-2" /> Rechazados
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('inicio')}>
                    <div className="flex items-center gap-2">
                      <HiCalendar />
                      <span className="font-semibold text-gray-300">Fecha</span>
                      {sortField === 'inicio' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'inicio' && <FaSort className="opacity-50" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('titulo')}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-300">Evento</span>
                      {sortField === 'titulo' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'titulo' && <FaSort className="opacity-50" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => handleSort('estado')}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-300">Estado</span>
                      {sortField === 'estado' && (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                      {sortField !== 'estado' && <FaSort className="opacity-50" />}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <HiLocationMarker />
                      <span className="font-semibold text-gray-300">Lugar</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="font-semibold text-gray-300">Acciones</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-700/50">
                {sortedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="max-w-md mx-auto">
                        <FaCalendarPlus className="text-gray-500 text-4xl mx-auto mb-3" />
                        <h3 className="text-gray-400 font-medium text-lg">No hay eventos</h3>
                        <p className="text-gray-500 mt-1">No tienes participaciones en este estado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-800/30 transition-colors ${event.es_bloqueo ? 'bg-red-900/10' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {format(new Date(event.inicio), "dd 'de' MMMM yyyy", { locale: es })}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {format(new Date(event.inicio), 'HH:mm')} – {event.fin ? format(new Date(event.fin), 'HH:mm') : 'Sin fin definido'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-white flex items-center gap-2">
                            {event.titulo}
                            {event.es_bloqueo && <FaLock className="text-red-400 text-xs" />}
                          </div>
                          {event.descripcion && (
                            <div className="text-sm text-gray-400 line-clamp-2">
                              {event.descripcion}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(event)}`}>
                          {getStatusIcon(event)}
                          <span className="font-medium text-sm">
                            {getStatusText(event)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {event.nombre_lugar || 'Sin lugar definido'}
                          </div>
                          {event.direccion_lugar && (
                            <div className="text-sm text-gray-400">{event.direccion_lugar}</div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewEvent(event)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </button>

                          {/* Solo mostramos aceptar/rechazar cuando estamos viendo pendientes */}
                          {participacionFilter === 'pendiente' && !event.es_bloqueo && (
                            <>
                              <button
                                onClick={() => handleAcceptEvent(event)}
                                className="p-2 bg-green-800/30 hover:bg-green-700/40 text-green-300 rounded-lg transition-colors"
                                title="Aceptar invitación"
                              >
                                <FaCheck />
                              </button>

                              <button
                                onClick={() => handleRechazarEvent(event)}
                                className="p-2 bg-red-800/30 hover:bg-red-700/40 text-red-300 rounded-lg transition-colors"
                                title="Rechazar invitación"
                              >
                                <MdOutlineBlock />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleEliminarEvent(event)}
                            className="p-2 bg-red-800/30 hover:bg-red-700/40 text-red-300 rounded-lg transition-colors"
                            title="Eliminar / Cancelar participación"
                          >
                            <FaTrashCan />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        profile={profile}
      />

      <ConfirmModal />

      <RespuestaModal
        isOpen={showRespuestaModal}
        type={respuestaModalProps.type}
        title={respuestaModalProps.title}
        message={respuestaModalProps.message}
        onClose={() => setShowRespuestaModal(false)}
      />
    </>
  );
}