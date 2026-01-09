// components/calendar/EventModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { CalendarEvent, eventoCompleto } from '@/types/profile';
import { 
  FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaUser, FaEnvelope, FaLink, FaImage, FaLock, 
  FaMusic, FaUsers, FaGuitar, FaMicrophone,
  FaMapPin, FaTag, FaInfoCircle,
  FaStar, FaCalendarDay, FaHourglassStart, FaHourglassEnd,
  FaTrashAlt,
  FaEdit
} from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { MdDescription } from 'react-icons/md';
import EditarEventoModal from './EditarEventoModal';
import { getEventoById } from '../actions/actions';
import NeonSign from '@/app/components/NeonSign';
import { FaSpinner } from 'react-icons/fa6';
import EliminarEventoModal from './EliminarEventoModal';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onEventUpdated?: () => void;
}

export default function EventModal({ event, isOpen, onClose, profile, onEventUpdated }: EventModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<eventoCompleto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'participantes' | 'detalles'>('info');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [esCreador, setEsCreador] = useState(false);
  console.log(profile)
  useEffect(() => {
    if (isOpen && event?.id) {
      fetchEventData();
      if (event.resource.creator_profile_id === profile.id){
          setEsCreador(true)
      }else{
          setEsCreador(false)
      }
    } else {
      // Resetear cuando se cierra
      setEventData(null);
      setError(null);
      setActiveTab('info');
    }
  }, [isOpen, event?.id]);

  const fetchEventData = async () => {
    if (!event?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      // IMPORTANTE: Asegúrate que getEventoById devuelva eventoCompleto
      const data = await getEventoById(event.id);
      setEventData(data);
    } catch (err: any) {
      console.error('Error cargando evento completo:', err);
      setError(err.message || 'Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };
  console.log(eventData)
  console.log('es creador?', esCreador)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': 
      case 'confirmed': return 'bg-green-500';
      case 'rejected':
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'confirmed': return 'Confirmado';
      case 'rejected': return 'Rechazado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

 

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex z-40 items-center justify-center p-4 bg-black/80">
        <div className=" flex justify-center items-center rounded-xl w-[60vw] h-[40vh] p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <NeonSign/>
            <FaSpinner className=' animate-spin' />
        </div>
      </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="fixed inset-0 flex z-[40] items-center justify-center p-4 bg-black/50">
        <div className="bg-neutral-900 rounded-xl p-6 max-w-md">
          <div className="text-red-400 mb-4">
            <h3 className="text-lg font-semibold">Error al cargar el evento</h3>
            <p className="text-sm">{error || 'No se pudo cargar la información del evento'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Datos del evento
  const participantes = eventData.participantes || [];
  const artistas = eventData.artistas || [];
  const bandas = eventData.bandas || [];
  const lugares = eventData.lugares || [];
  const integrantes = eventData.integrantes || [];

   const calendarEventForEdit: CalendarEvent = {
  id: eventData.id,
  title: eventData.title,
  start: new Date(eventData.fecha_hora_ini),
  end: new Date(eventData.fecha_hora_fin),
  description: eventData.description,
  category: eventData.category || '',
  status: eventData.status,
  tipo: eventData.creator_type === 'artist' ? 'artist' : 
        eventData.creator_type === 'band' ? 'band' : 
        eventData.creator_type === 'place' ? 'place' : '',
  
  resource: {
    creator_profile_id: eventData.creator_profile_id,
    creator_type: eventData.creator_type as 'artist' | 'band' | 'place',
    fecha_hora_ini: new Date(eventData.fecha_hora_ini),
    fecha_hora_fin: new Date(eventData.fecha_hora_fin),
    place_profile_id: eventData.place_profile_id || '',
    custom_place_name: eventData.custom_place_name || '',
    address: eventData.address || '',
    organizer_name: eventData.organizer_name || '',
    organizer_contact: eventData.organizer_contact || '',
    ticket_link: eventData.ticket_link || '',
    instagram_link: eventData.instagram_link || '',
    flyer_url: eventData.flyer_url || '',
    category: eventData.category || '',
    status: eventData.status,
    created_at: eventData.created_at,
    updated_at: eventData.updated_at,
    is_blocked: eventData.is_blocked || false,
    blocked_reason: eventData.blocked_reason || ''
  }
};

  return (
    <>
      <div className="fixed inset-0 flex z-[40] items-center justify-center p-4 bg-black/50">
        <div className="relative bg-neutral-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-700 bg-neutral-900 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${eventData.is_blocked ? 'bg-red-900/80' : 'bg-neutral-700/80'}`}>
                {eventData.is_blocked ? (
                  <FaLock className="text-red-300 text-xl" />
                ) : (
                  <FaCheckCircle className="text-sky-300 text-xl" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{eventData.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(eventData.status)} text-white`}>
                    {getStatusText(eventData.status)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {eventData.category === 'meeting' ? 'Reunión' : eventData.category || 'Evento'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <HiX className="text-xl" />
            </button>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'info' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <FaInfoCircle className="inline mr-2" />
                Información
              </button>
              <button
                onClick={() => setActiveTab('participantes')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'participantes' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <FaUsers className="inline mr-2" />
                Participantes ({participantes.length})
              </button>
              <button
                onClick={() => setActiveTab('detalles')}
                className={`flex-1 py-3 px-4 text-sm font-medium ${activeTab === 'detalles' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-gray-300'}`}
              >
                <FaStar className="inline mr-2" />
                Detalles
              </button>
            </div>
          </div>

          {/* Contenido de los tabs */}
          <div className="p-6">
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Flyer y descripción */}
                {eventData.flyer_url && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FaImage className="text-yellow-400 text-xl" />
                      <h3 className="text-lg font-semibold text-white">Flyer del Evento</h3>
                    </div>
                    <div className="bg-neutral-800/30 rounded-lg overflow-hidden flex justify-center">
                      <img
                        src={eventData.flyer_url}
                        alt={`Flyer para ${eventData.title}`}
                        className="max-w-full max-h-96 object-contain"
                      />
                    </div>
                  </div>
                )}

                {eventData.description && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <MdDescription className="text-blue-400 text-xl" />
                      <h3 className="text-lg font-semibold text-white">Descripción</h3>
                    </div>
                    <p className="text-gray-300 bg-neutral-800/50 p-4 rounded-lg">
                      {eventData.description}
                    </p>
                  </div>
                )}

                {/* Información principal en grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fechas y horarios */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-sky-600 p-2 rounded-lg">
                        <FaCalendarAlt className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Fechas</h4>
                        <p className="text-white font-medium">{formatDate(eventData.fecha_hora_ini)}</p>
                        {formatDate(eventData.fecha_hora_fin) !== formatDate(eventData.fecha_hora_ini) && (
                          <p className="text-white font-medium">al {formatDate(eventData.fecha_hora_fin)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-sky-600 p-2 rounded-lg">
                        <FaClock className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Horario</h4>
                        <p className="text-white font-medium">
                          {formatTime(eventData.fecha_hora_ini)} - {formatTime(eventData.fecha_hora_fin)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lugar y dirección */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-600 p-2 rounded-lg">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-1">Lugar</h4>
                        <p className="text-white font-medium">
                          {eventData.custom_place_name || 'Sin lugar específico'}
                        </p>
                        {eventData.address && (
                          <p className="text-gray-300 text-sm mt-1">{eventData.address}</p>
                        )}
                      </div>
                    </div>

                    {eventData.organizer_name && (
                      <div className="flex items-start gap-3">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <FaUser className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-1">Organizador</h4>
                          <p className="text-white font-medium">{eventData.organizer_name}</p>
                          {eventData.organizer_contact && (
                            <p className="text-gray-300 text-sm mt-1">{eventData.organizer_contact}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enlaces */}
                {(eventData.ticket_link || eventData.instagram_link) && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Enlaces</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {eventData.ticket_link && (
                        <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                          <div className="bg-green-600 p-2 rounded-lg">
                            <FaLink className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-400">Tickets</p>
                            <a
                              href={eventData.ticket_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-300 hover:text-green-200 font-medium truncate block"
                            >
                              {eventData.ticket_link}
                            </a>
                          </div>
                        </div>
                      )}

                      {eventData.instagram_link && (
                        <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                          <div className="bg-purple-600 p-2 rounded-lg">
                            <FaLink className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-400">Instagram</p>
                            <a
                              href={eventData.instagram_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-300 hover:text-purple-200 font-medium truncate block"
                            >
                              {eventData.instagram_link}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'participantes' && (
              <div className="space-y-6">
                {/* Resumen de participantes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-neutral-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{participantes.length}</p>
                  </div>
                  <div className="bg-neutral-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Artistas</p>
                    <p className="text-2xl font-bold text-sky-400">{artistas.length}</p>
                  </div>
                  <div className="bg-neutral-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Bandas</p>
                    <p className="text-2xl font-bold text-green-400">{bandas.length}</p>
                  </div>
                  <div className="bg-neutral-800/50 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Lugares</p>
                    <p className="text-2xl font-bold text-red-400">{lugares.length}</p>
                  </div>
                </div>

                {/* Lista de participantes */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Lista de Participantes</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                    {participantes.map((participante, index) => (
                      <div key={participante.id || index} className="bg-neutral-800/30 p-3 rounded-lg flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${participante.estado === 'confirmado' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                          {participante.nombre_artistico ? (
                            <FaMicrophone className="text-white" />
                          ) : participante.nombre_banda ? (
                            <FaUsers className="text-white" />
                          ) : (
                            <FaMapPin className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {participante.nombre_artistico || participante.nombre_banda || participante.nombre_local || 'Sin nombre'}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-0.5 rounded-full ${participante.estado === 'confirmado' ? 'bg-green-600/20 text-green-300' : 'bg-yellow-600/20 text-yellow-300'}`}>
                              {participante.estado}
                            </span>
                            {participante.email && (
                              <span className="text-gray-400">{participante.email}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integrantes de banda (si hay) */}
                {integrantes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Integrantes de Banda</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {integrantes.map((integrante, index) => (
                        <div key={integrante.id || index} className="bg-neutral-800/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <FaGuitar className="text-purple-400" />
                            <span className="text-sm text-gray-400">{integrante.tipo}</span>
                          </div>
                          <p className="text-white font-medium">{integrante.tipo}</p>
                          <p className="text-xs text-gray-400">Estado: {integrante.estado}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'detalles' && (
              <div className="space-y-6">
                {/* Información del creador */}
                <div className="bg-neutral-800/30 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <FaUser className="text-sky-400" />
                    Creador del Evento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Tipo de creador</p>
                      <p className="text-white font-medium">{eventData.creator_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">ID del creador</p>
                      <p className="text-white font-medium text-sm font-mono">
                        {eventData.creator_profile_id?.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información del artista/banda */}
                {(eventData.nombre_artista || eventData.id_artista) && (
                  <div className="bg-neutral-800/30 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <FaMusic className="text-green-400" />
                      Artista/Banda Principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Nombre</p>
                        <p className="text-white font-medium">{eventData.nombre_artista || 'No especificado'}</p>
                      </div>
                      {eventData.id_tipo_artista && (
                        <div>
                          <p className="text-sm text-gray-400">Tipo</p>
                          <p className="text-white font-medium">{eventData.id_tipo_artista}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metadatos del evento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-800/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarDay className="text-blue-400" />
                      <p className="text-sm text-gray-400">Creado</p>
                    </div>
                    <p className="text-white font-medium">
                      {new Date(eventData.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="bg-neutral-800/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaHourglassStart className="text-yellow-400" />
                      <p className="text-sm text-gray-400">Inicio</p>
                    </div>
                    <p className="text-white font-medium">{formatDate(eventData.fecha_hora_ini)}</p>
                    <p className="text-gray-300 text-sm">{formatTime(eventData.fecha_hora_ini)}</p>
                  </div>

                  <div className="bg-neutral-800/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaHourglassEnd className="text-red-400" />
                      <p className="text-sm text-gray-400">Fin</p>
                    </div>
                    <p className="text-white font-medium">{formatDate(eventData.fecha_hora_fin)}</p>
                    <p className="text-gray-300 text-sm">{formatTime(eventData.fecha_hora_fin)}</p>
                  </div>

                  <div className="bg-neutral-800/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FaTag className="text-purple-400" />
                      <p className="text-sm text-gray-400">Categoría</p>
                    </div>
                    <p className="text-white font-medium">{eventData.category || 'No especificada'}</p>
                  </div>
                </div>

                {/* Bloqueo (si aplica) */}
                {eventData.is_blocked && eventData.blocked_reason && (
                  <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <FaLock className="text-red-400" />
                      <h3 className="text-lg font-semibold text-white">Día Bloqueado</h3>
                    </div>
                    <p className="text-red-300">{eventData.blocked_reason}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t border-gray-700 bg-neutral-900 rounded-b-xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                ID: <span className="text-gray-300 font-mono">{eventData.id.substring(0, 12)}...</span>
              </div>
              <div className="flex gap-3">
    { esCreador && (
      <>
                  <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FaEdit className="text-sm" />
                  Editar
                </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaTrashAlt className="text-sm" />
                    Eliminar
                  </button>
      </>
  
  
  )

    }
  
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-white bg-neutral-600 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <HiX className="text-sm" />
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición - Necesita un CalendarEvent, no eventoCompleto */}
      {showEditModal && (
        <EditarEventoModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            fetchEventData(); // Recargar datos después de editar
          }}
          profile={profile}
          evento={calendarEventForEdit}
          onSuccess={() => {
            setShowEditModal(false);
            fetchEventData(); // Recargar datos
            if (onEventUpdated) {
              onEventUpdated(); // Notificar al calendario
            }
          }}
        />
      )}

              {showDeleteModal && (
          <EliminarEventoModal
            eventId={eventData.id}
            eventTitle={eventData.title}
            perfilId={profile.id}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onSuccess={() => {
              onClose(); // Cerrar este modal también
              if (onEventUpdated) {
                onEventUpdated(); // Refrescar calendario
              }
            }}
          />
        )}
    </>
  );
}