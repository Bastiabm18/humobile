// components/EventosTable.tsx
'use client';

import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaTrash, FaEye, FaCalendarPlus, FaLock, FaSort, FaSortUp, FaSortDown, FaCheck } from 'react-icons/fa';
import { HiCalendar, HiLocationMarker, HiUser } from 'react-icons/hi';
import { filterProps, motion } from 'framer-motion';
import { CalendarEvent, Profile } from '@/types/profile';
import { eliminarEvento, getEventsByProfile } from '../actions/actions';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import NeonSign from '@/app/components/NeonSign';
import EventModal from '../../agenda/components/EventModal';
import { aceptarSolicitud, rechazarSolicitud } from '../actions/actions';
import { MdOutlineBlock } from 'react-icons/md';
import { filter } from 'framer-motion/client';
import { FaTrashCan } from 'react-icons/fa6';
import RespuestaModal from './RespuestaModal';


interface EventosTableProps {
  profile:Profile
  onCreateEvent?: () => void;
  onBlockDate?: () => void;
}

type SortField = 'fecha_hora_ini' | 'title' | 'status';
type SortDirection = 'asc' | 'desc';

export default function EventosTable({ profile, onCreateEvent, onBlockDate }: EventosTableProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('fecha_hora_ini');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [actionType, setActionType] = useState<'accept' | 'delete' | 'reject' | null>(null);
const [eventToAction, setEventToAction] = useState<CalendarEvent | null>(null);

const [statusFilter, setStatusFilter] = useState< string | null>(null);

// para pasar el id del evento a las actions
const [id_perfil , setid_perfil] = useState(profile.id);


// Estado para el modal de respuesta
const [showRespuestaModal, setShowRespuestaModal] = useState(false);
const [respuestaModalProps, setRespuestaModalProps] = useState({
  type: 'success' as 'success' | 'error' | 'warning',
  title: '',
  message: '',
});


  // Cargar eventos

   console.log('Profile en EventosTable:', profile);
  useEffect(() => {
    loadEvents(statusFilter || '');
  }, [profile.id, profile.tipo, statusFilter]);

  const handleFilterChange = (status: string | null) => {
  setStatusFilter(status);
  loadEvents(status || '');
};

const getFilterButtonClass = (filterStatus: string | null) => {
  const isActive = statusFilter === filterStatus;
  return `flex-1 sm:flex-none px-4 py-2 rounded-xl font-medium transition-all ${
    isActive 
      ? filterStatus === null 
        ? 'bg-blue-600 text-white' 
        : filterStatus === 'pending'
        ? 'bg-yellow-600 text-white'
        : filterStatus === 'approved'
        ? 'bg-green-600 text-white'
        : 'bg-red-600 text-white'
      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
  }`;
};
 const handleViewEvent = (event: CalendarEvent) => {
  setSelectedEvent(event);
  setIsModalOpen(true);
};
  const loadEvents = async (filterStatus?: string | null) => {
    try {
      setLoading(true);
      const data = await getEventsByProfile(profile.id, profile.tipo, filterStatus || ''  );
      setEvents(data);
      console.log('Loaded Events:', data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  // Ordenar eventos
  const sortedEvents = [...events].sort((a, b) => {
    let aValue: any, bValue: any;
    
    if (sortField === 'fecha_hora_ini') {
      aValue = new Date(a.resource.fecha_hora_ini).getTime();
      bValue = new Date(b.resource.fecha_hora_ini).getTime();
    } else if (sortField === 'title') {
      aValue = a.title.toLowerCase();
      bValue = b.title.toLowerCase();
    } else {
      aValue = a.resource.status || '';
      bValue = b.resource.status || '';
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Formatear fecha
  const formatEventDate = (date: Date) => {
    return format(new Date(date), "dd 'de' MMMM yyyy 'a las' HH:mm", { locale: es });
  };

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pendiente': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'rechazado': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'vencido': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  // Obtener ícono según estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado': return <FaCheckCircle className="text-green-400" />;
      case 'pendiente': return <FaClock className="text-yellow-400" />;
      case 'rechazado': return <FaTimesCircle className="text-red-400" />;
      case 'vencido': return <FaTimesCircle className="text-gray-400" />;
      default: return <FaClock className="text-blue-400" />;
    }
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'rechazado': 'Rechazado',
      'vencido': 'vencido'
    };
    return texts[status] || status;
  };

const handleAcceptEvent = (event: CalendarEvent) => {
  setEventToAction(event);
  setActionType('accept');
  setShowConfirmModal(true);
};

const handleRechazarEvent = (event: CalendarEvent) => {
  setEventToAction(event);
  setActionType('reject');
  setShowConfirmModal(true);
};

const handleEliminarEvent = (event: CalendarEvent) => {
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
        id_perfil 
      });
    } else if (actionType === 'delete') {
      result = await eliminarEvento({ 
        id_evento: eventToAction.id, 
        motivo: 'eliminado por el usuario', 
        id_perfil 
      });
    } else if (actionType === 'reject') {
      result = await rechazarSolicitud({ 
        id_evento: eventToAction.id, 
        motivo: 'rechazado por el usuario', 
        id_perfil 
      });
    }

    // Modal de respuesta BASADO EN result.success
    setRespuestaModalProps({
      type: result?.success ? 'success' : 'error',
      title: result?.success ? '¡Éxito!' : 'Error',
      message: result?.success 
        ? `Evento ${actionType === 'accept' ? 'aceptado' : actionType === 'delete' ? 'eliminado' : 'rechazado'} exitosamente`
        : result?.error || 'Error desconocido'
    });
    
    if (result?.success) {
      loadEvents(statusFilter || '');
    }
    
    setShowRespuestaModal(true);
    
  } catch (error: any) {
    setRespuestaModalProps({
      type: 'error',
      title: 'Error',
      message: 'Error al procesar la acción',
    });
    setShowRespuestaModal(true);
  } finally {
    setShowConfirmModal(false);
    setEventToAction(null);
    setActionType(null);
  }
};
  const ConfirmModal = () => {
  if (!showConfirmModal) return null;
  
  const getModalContent = () => {
    switch (actionType) {
      case 'accept':
        return {
          title: 'Confirmar Aprobación',
          message: '¿Estás seguro de que quieres aprobar este evento?',
          confirmText: 'Sí, aprobar',
          confirmColor: 'bg-green-600 hover:bg-green-700',
          icon: <FaCheckCircle className="text-green-400 text-3xl" />
        };
      case 'delete':
        return {
          title: 'Confirmar Eliminar',
          message: '¿Estás seguro de que quieres Eliminar este evento? Esta acción no se puede deshacer.',
          confirmText: 'Sí, Eliminar',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          icon: <FaTimesCircle className="text-red-400 text-3xl" />
        };
      case 'reject':
        return {
          title: 'Confirmar Rechazo',
          message: '¿Estás seguro de que quieres rechazar este evento? Esta acción no se puede deshacer.',
          confirmText: 'Sí, Rechazar',
          confirmColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: <FaTimesCircle className="text-yellow-400 text-3xl" />
        };
      default:
        return {
          title: 'Confirmar Acción',
          message: '¿Estás seguro?',
          confirmText: 'Confirmar',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          icon: <FaCheckCircle className="text-blue-400 text-3xl" />
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 flex z-[9999] items-center justify-center p-4 bg-black/70">
      <div className="bg-neutral-900 rounded-xl border border-neutral-700 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            {content.icon}
            <h3 className="text-xl font-bold text-white">{content.title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">{content.message}</p>
          
          {eventToAction && (
            <div className="bg-neutral-800/50 p-4 rounded-lg mb-6">
              <p className="text-white font-medium">{eventToAction.title}</p>
              <p className="text-gray-400 text-sm mt-1">
                {formatEventDate(eventToAction.resource.fecha_hora_ini)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
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
            className={`flex-1 py-3 ${content.confirmColor} text-white font-bold rounded-lg transition`}
          >
            {content.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-128">
      <NeonSign/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
        <FaTimesCircle className="text-red-400 text-3xl mx-auto mb-3" />
        <p className="text-red-300 font-medium">{error}</p>
        <button
          onClick={()=>loadEvents()}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER CON BOTONES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
        <div>
          <h2 className="text-2xl font-bold text-white">Eventos de {profile.nombre || 'Perfil'}</h2>
       <p className="text-gray-400 mt-1">
          {events.length} evento{events.length !== 1 ? 's' : ''} 
          {statusFilter && ` ${getStatusText(statusFilter).toLowerCase()}`}
        </p>
        </div>
     
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onCreateEvent}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-800/90 text-white font-medium rounded-xl transition-all hover:scale-[1.02] shadow-lg"
          >
            <FaCalendarPlus />
            <span>Crear Evento</span>
          </button>
          <button
            onClick={onBlockDate}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-700 hover:bg-red-800/90 text-white font-medium rounded-xl transition-all hover:scale-[1.02] shadow-lg"
          >
            <FaLock />
            <span>Bloquear Fecha</span>
          </button>
          
        </div>
           <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => handleFilterChange(null)}
                className={getFilterButtonClass(null)}
              >
                Todos
              </button>
              <button
                onClick={() => handleFilterChange('pending')}
                className={getFilterButtonClass('pending')}
              >
                <FaClock className="inline mr-2" />
                Pendientes
              </button>
              <button
                onClick={() => handleFilterChange('approved')}
                className={getFilterButtonClass('approved')}
              >
                <FaCheckCircle className="inline mr-2" />
                Aprobados
              </button>
              <button
                onClick={() => handleFilterChange('rejected')}
                className={getFilterButtonClass('rejected')}
              >
                <FaTimesCircle className="inline mr-2" />
                Rechazados
              </button>
        </div>

        
      </div>

      {/* TABLA */}
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => handleSort('fecha_hora_ini')}
                >
                  <div className="flex items-center gap-2">
                    <HiCalendar />
                    <span className="font-semibold text-gray-300">Fecha</span>
                    {sortField === 'fecha_hora_ini' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'fecha_hora_ini' && <FaSort className="opacity-50" />}
                  </div>
                </th>
                
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Evento</span>
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'title' && <FaSort className="opacity-50" />}
                  </div>
                </th>
                
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-300">Estado</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'status' && <FaSort className="opacity-50" />}
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
                      <p className="text-gray-500 mt-1">Crea tu primer evento o bloquea fechas en el calendario</p>
                      <div className="mt-6 flex gap-3 justify-center">
                        <button
                          onClick={onCreateEvent}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          Crear Evento
                        </button>
                        <button
                          onClick={onBlockDate}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          Bloquear Fecha
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedEvents.map((event, index) => (
                  <motion.tr
                    key={event.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`hover:bg-gray-800/30 transition-colors ${
                      event.resource.is_blocked ? 'bg-red-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-white">
                          {formatEventDate(event.resource.fecha_hora_ini)}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-white flex items-center gap-2">
                          {event.title}
                          {event.resource.is_blocked && (
                            <FaLock className="text-red-400 text-xs" />
                          )}
                        </div>
                        {event.description && (
                          <div className="text-sm text-gray-400 line-clamp-2">
                            {event.description}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(event.resource.status || 'pending')}`}>
                        {getStatusIcon(event.resource.status || 'pending')}
                        <span className="font-medium text-sm">
                          {getStatusText(event.resource.status || 'pending')}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-white">
                          {event.resource.custom_place_name || 'Por definir'}
                        </div>
                        {event.resource.address && (
                          <div className="text-sm text-gray-400">
                            {event.resource.address}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <FaEye />
                        </button>
                        
                        <button
                          className="p-2 bg-green-700/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                          title="Aceptar"
                          onClick={()=>handleAcceptEvent(event)}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="p-2 bg-yellow-700/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
                          title="Rechazar"
                          onClick={()=>handleRechazarEvent(event)}
                        >
                          <MdOutlineBlock />
                        </button>
                        <button
                          onClick={() => handleEliminarEvent(event)}
                          className="p-2 bg-red-700/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                          title="Eliminar"
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
                profile={profile as any}
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