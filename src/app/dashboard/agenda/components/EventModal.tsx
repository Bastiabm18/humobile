'use client';

import { useEffect, useState } from 'react';
import { 
  FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaUser, FaLink, FaImage, FaLock, 
  FaUsers, FaGuitar, FaMicrophone,
  FaMapPin, FaTag, FaInfoCircle,
  FaStar, FaCalendarDay, FaHourglassStart, FaHourglassEnd,
  FaTrashAlt, FaEdit
} from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { MdDescription, MdOutlineThumbDownOffAlt, MdOutlineThumbUp } from 'react-icons/md';
import EditarEventoModal from './EditarEventoModal';
import { aceptarRechazarParticipacionEvento, eliminarParticipacionEvento, getEventoById, getEventoByIdV2 } from '../actions/actions';
import NeonSign from '@/app/components/NeonSign';
import { FaSpinner, FaX } from 'react-icons/fa6';
import EliminarEventoModal from './EliminarEventoModal';
import { EventoCalendario } from '@/types/profile';
import { PiArrowCircleUpLeftThin } from 'react-icons/pi';
import { boolean } from 'zod';
import ConfirmarRechazarEventoModal from './ConfirmarRechazarEventoModal';
import EliminarParticipacionEventoModal from './EliminarParticipacionEventoModal';

interface EventModalProps {
  event: { id: string } | null; // Solo necesitamos el id para cargar el completo
  isOpen: boolean;
  onRequestClose: () => void;
  profile: { id: string; tipo: string; nombre?: string };
  onEventUpdated?: () => void;
}

export default function EventModal({ event, isOpen, onRequestClose, profile, onEventUpdated }: EventModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<EventoCalendario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'participantes' | 'detalles'>('info');
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [esCreador, setEsCreador] = useState(false);
  const [esPendiente, setEsPendiente]= useState(false);
  const [showConfirmarRechazarEvento, setShowConfirmarRechazarEvento] = useState(false);
  const [showEliminarEvento, setShowEliminarEvento] = useState(false);
  const [eleccion, setEleccion] = useState(Boolean);




  useEffect(() => {
    if (isOpen && event?.id) {
      setInitialLoading(true);
      setError(null);
      fetchEventData();
    } else {
      setEventData(null);
      setError(null);
      setActiveTab('info');
      setInitialLoading(false);
    }
  }, [isOpen, event?.id]);

  const fetchEventData = async () => {
    if (!event?.id) return;

    setLoading(true);
    try {
      const data = await getEventoByIdV2(event.id,profile.id);
      if (!data) throw new Error('No se encontró el evento');
      
      setEventData(data);
      console.log(data)
      setEsCreador(data.id_creador === profile.id);
      setEsPendiente(data.estado_participacion === 'pendiente'); // si estado participacion es pendiente se guarda como true 
    } catch (err: any) {
      console.error('Error cargando evento completo:', err);
      setError(err.message || 'Error al cargar detalles del evento');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };


  const handleEliminarParticipacion = async (eventoId: string, participanteId: string) => {
  try {
    const resultado = await eliminarParticipacionEvento(eventoId, participanteId);
    
    if (!resultado.success) {
      throw new Error(resultado.error);
    }
    
    // Éxito - recargar datos
    fetchEventData();
    if (onEventUpdated) onEventUpdated();
    setShowEliminarEvento(false);
      onRequestClose()
  } catch (error: any) {
    console.error('Error eliminando participación:', error);
    throw error;
  }
};

  const handleConfirmarRechazarParticipacion = async (eventoId: string, participanteId: string) => {
  try {
    const resultado = await aceptarRechazarParticipacionEvento(
      eventoId, 
      participanteId, 
      eleccion ? true : false
    );
    
    if (resultado.success) {
      // Recargar datos del evento
      fetchEventData();
      if (onEventUpdated) onEventUpdated();
    } else {
      throw new Error(resultado.error);
    }
  } catch (error: any) {
    console.error('Error al procesar participación:', error);
    throw error;
  }
};
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Usar UTC para el día también
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'  // <-- Esto asegura que use la fecha UTC
  };
  
  return dateObj.toLocaleDateString('es-ES', options);
};

const formatTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Usar UTC para mostrar la hora correcta
  const hours = dateObj.getUTCHours().toString().padStart(2, '0');
  const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
  const getStatusColor = (esBloqueo: boolean) => esBloqueo ? 'bg-red-500' : 'bg-sky-500';
  const getStatusText = (esBloqueo: boolean) => esBloqueo ? 'Bloqueo' : 'Evento';

  if (!isOpen) return null;

  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex z-40 items-center justify-center p-4 bg-black/80">
        <div className="flex flex-col items-center justify-center gap-4">
          <NeonSign />
          <FaSpinner className="animate-spin text-4xl text-sky-400" />
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="fixed inset-0 flex z-40 items-center justify-center p-4 bg-black/80">
        <div className="bg-neutral-900 rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-3xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-300 mb-6">{error || 'No se pudo cargar el evento'}</p>
          <button 
            onClick={onRequestClose}
            className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const {
    titulo,
    descripcion,
    inicio,
    fin,
    nombre_categoria,
    flyer_url,
    video_url,
    nombre_creador,
    tipo_perfil_creador,
    nombre_lugar,
    direccion_lugar,
    tickets_evento,
    es_publico,
    es_bloqueo,
    motivo_bloqueo,
    created_at,
    updated_at,
    participantes = []
  } = eventData;

  return (
    <>
      <div className="fixed inset-0 flex z-[40] items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden border border-neutral-800">
          
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${es_bloqueo ? 'bg-red-900/60' : 'bg-sky-900/60'}`}>
                {es_bloqueo ? (
                  <FaLock className="text-red-300 text-2xl" />
                ) : (
                  <FaCheckCircle className="text-sky-300 text-2xl" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{titulo}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(es_bloqueo)} text-white`}>
                    {getStatusText(es_bloqueo)}
                  </span>
                  {nombre_categoria && (
                    <span className="text-sm text-gray-300 bg-neutral-800/50 px-3 py-1 rounded-full">
                      {nombre_categoria}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onRequestClose}
              className="p-3 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-neutral-800 bg-neutral-950/60">
            <div className="flex">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === 'info' 
                    ? 'text-sky-400 border-b-2 border-sky-400 bg-neutral-900/40' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-900/30'
                }`}
              >
                <FaInfoCircle className="inline mr-2" />
                Información
              </button>
              <button
                onClick={() => setActiveTab('participantes')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === 'participantes' 
                    ? 'text-green-400 border-b-2 border-green-400 bg-neutral-900/40' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-900/30'
                }`}
              >
                <FaUsers className="inline mr-2" />
                Participantes ({participantes.length})
              </button>
              <button
                onClick={() => setActiveTab('detalles')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                  activeTab === 'detalles' 
                    ? 'text-purple-400 border-b-2 border-purple-400 bg-neutral-900/40' 
                    : 'text-gray-400 hover:text-gray-300 hover:bg-neutral-900/30'
                }`}
              >
                <FaStar className="inline mr-2" />
                Detalles
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 overflow-y-auto max-h-[calc(92vh-180px)] custom-scrollbar">
            {activeTab === 'info' && (
              <div className="space-y-8">
                {flyer_url && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <FaImage className="text-yellow-400" />
                      Flyer del Evento
                    </h3>
                    <div className="rounded-xl overflow-hidden border border-neutral-800 shadow-lg">
                      <img
                        src={flyer_url}
                        alt={`Flyer - ${titulo}`}
                        className="w-full h-auto max-h-[500px] object-contain bg-black"
                      />
                    </div>
                  </div>
                )}

                {descripcion && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <MdDescription className="text-blue-400" />
                      Descripción
                    </h3>
                    <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800 whitespace-pre-wrap">
                      {descripcion}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-sky-900/50 p-4 rounded-xl">
                        <FaCalendarAlt className="text-sky-300 text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Fechas</h4>
                        <p className="text-white text-lg font-medium">{formatDate(inicio)}</p>
                        {fin && formatDate(fin) !== formatDate(inicio) && (
                          <p className="text-white text-lg font-medium">— {formatDate(fin)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-sky-900/50 p-4 rounded-xl">
                        <FaClock className="text-sky-300 text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Horario</h4>
                        <p className="text-white text-lg font-medium">
                          {formatTime(inicio)} {fin ? `— ${formatTime(fin)}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-900/50 p-4 rounded-xl">
                        <FaMapMarkerAlt className="text-red-300 text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Lugar</h4>
                        <p className="text-white text-lg font-medium">
                          {nombre_lugar || 'Sin lugar definido'}
                        </p>
                        {direccion_lugar && (
                          <p className="text-gray-300 mt-1">{direccion_lugar}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="bg-green-900/50 p-4 rounded-xl">
                        <FaUser className="text-green-300 text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-400 mb-1">Creador</h4>
                        <p className="text-white text-lg font-medium">{nombre_creador}</p>
                        <p className="text-gray-300 capitalize">{tipo_perfil_creador}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {tickets_evento && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <FaLink className="text-green-400" />
                      Entradas / Reservas
                    </h3>
                    <a
                      href={tickets_evento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-green-900/30 border border-green-800/50 p-5 rounded-xl text-green-300 hover:text-green-200 hover:bg-green-900/50 transition-colors"
                    >
                      {tickets_evento}
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'participantes' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-neutral-900/50 p-5 rounded-xl text-center border border-neutral-800">
                    <p className="text-sm text-gray-400 mb-1">Total</p>
                    <p className="text-3xl font-bold text-white">{participantes.length}</p>
                  </div>
                  {/* Puedes agregar más estadísticas cuando tengas los estados en la data */}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <FaUsers className="text-green-400" />
                    Participantes del Evento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {participantes.map((p, index) => (
                      <div 
                        key={p.id_participante || index}
                        className="bg-neutral-900/50 p-5 rounded-xl border border-neutral-800 hover:border-green-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-xl ${
                            p.tipo_perfil_participante === 'banda' ? 'bg-purple-900/50' : 'bg-sky-900/50'
                          }`}>
                            {p.tipo_perfil_participante === 'banda' ? (
                              <FaUsers className="text-purple-300 text-2xl" />
                            ) : (
                              <FaMicrophone className="text-sky-300 text-2xl" />
                            )}
                          </div>
                          <div>
                            <p className="text-lg font-medium text-white">{p.nombre_participante}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="px-3 py-1 text-xs rounded-full bg-green-900/50 text-green-300 border border-green-800/50">
                                Confirmado
                              </span>
                              <span className="text-sm text-gray-400 capitalize">
                                {p.tipo_perfil_participante}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {participantes.length === 0 && (
                      <p className="text-gray-400 text-center py-12 col-span-full">
                        No hay participantes adicionales registrados
                      </p>
                    )}
                  </div>
                </div>

                {/* Integrantes de bandas (solo lectura) */}
                {participantes.some(p => p.integrantes_banda && p.integrantes_banda.length > 0) && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <FaGuitar className="text-purple-400" />
                      Integrantes de Bandas Participantes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {participantes.map((p) => 
                        p.integrantes_banda?.map((int, i) => (
                          <div 
                            key={i}
                            className="bg-neutral-900/40 p-5 rounded-xl border border-neutral-800"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-900/50 p-3 rounded-xl">
                                <FaGuitar className="text-purple-300 text-xl" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{int.nombre_integrante}</p>
                                <p className="text-sm text-gray-400">Integrante de {p.nombre_participante}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'detalles' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <FaUser className="text-sky-400" />
                      Creador
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Nombre</p>
                        <p className="text-lg text-white font-medium">{nombre_creador}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Tipo de perfil</p>
                        <p className="text-lg text-white font-medium capitalize">{tipo_perfil_creador}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                      <FaCalendarDay className="text-purple-400" />
                      Metadatos
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Creado el</p>
                        <p className="text-white">{formatDate(created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Última actualización</p>
                        <p className="text-white">{formatDate(updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                      <FaHourglassStart className="text-yellow-400 text-xl" />
                      <h4 className="text-lg font-semibold text-white">Inicio</h4>
                    </div>
                    <p className="text-white text-xl font-medium">{formatDate(inicio)}</p>
                    <p className="text-gray-300">{formatTime(inicio)}</p>
                  </div>

                  <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                      <FaHourglassEnd className="text-red-400 text-xl" />
                      <h4 className="text-lg font-semibold text-white">Fin</h4>
                    </div>
                    <p className="text-white text-xl font-medium">
                      {fin ? formatDate(fin) : 'Sin fin definido'}
                    </p>
                    {fin && <p className="text-gray-300">{formatTime(fin)}</p>}
                  </div>

                  <div className="bg-neutral-900/50 p-6 rounded-xl border border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                      <FaTag className="text-purple-400 text-xl" />
                      <h4 className="text-lg font-semibold text-white">Categoría</h4>
                    </div>
                    <p className="text-white text-xl font-medium">
                      {nombre_categoria || 'No especificada'}
                    </p>
                  </div>
                </div>

                {es_bloqueo && motivo_bloqueo && (
                  <div className="bg-red-950/40 border border-red-800/50 p-6 rounded-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <FaLock className="text-red-400 text-2xl" />
                      <h3 className="text-xl font-semibold text-white">Día Bloqueado</h3>
                    </div>
                    <p className="text-red-300 text-lg">{motivo_bloqueo}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-5 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-sm flex justify-between items-center">


            <div className="flex flex-row justify-between min-w-[85vw] max-w-[85vw] gap-2">
              {esCreador? (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-sky-900/30"
                  >
                    <FaEdit />
                    Editar Evento
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-red-900/30"
                  >
                    <FaTrashAlt />
                    Eliminar Evento
                  </button>
                </>
                     ):(
                  <>
                    {esPendiente?
              
                   (
                   <>
                   <button
                   onClick ={()=>{  
                    setShowConfirmarRechazarEvento(true)
                    setEleccion(true)  

                   }}
                className="px-3 py-3 bg-green-700/80 hover:bg-green-600/80 text-white rounded-xl transition-colors flex items-center gap-2">
                  <MdOutlineThumbUp/>  Confirmar
                   </button>
                   <button
                   onClick ={()=>{  
                    setShowConfirmarRechazarEvento(true)
                    setEleccion(false)  

                   }}
                className="px-3 py-3 bg-red-700/80 hover:bg-red-600/80 text-white rounded-xl transition-colors flex items-center gap-2">
                     <MdOutlineThumbDownOffAlt/>   Rechazar
                     </button>
                   </>


                     ):( 

                     <>
                      <button
                              onClick ={()=>{  
                                setShowEliminarEvento(true)
                              
                                 }}
                            className="px-3 py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center gap-2">
                                    Eliminar Invitacion
                                 </button>
                    </>
                  )}
                     </> 

                     ) 
               }
                         

            

              <button
                onClick={onRequestClose}
                className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl transition-colors flex items-center gap-2"
              >
                <HiX />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición - ahora pasamos directamente eventData */}
      {showEditModal && eventData && (
        <EditarEventoModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            fetchEventData();
          }}
          profile={profile}
          evento={eventData}           // ← Cambio clave: pasamos el EventoCalendario completo
          onSuccess={() => {
            setShowEditModal(false);
            fetchEventData();
            if (onEventUpdated) onEventUpdated();
          }}
        />
      )}

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <EliminarEventoModal
          eventId={eventData.id}
          eventTitle={eventData.titulo}
          perfilId={profile.id}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={() => {
            onRequestClose();
            if (onEventUpdated) onEventUpdated();
          }}
        />
      )}

      {showConfirmarRechazarEvento && (
            <ConfirmarRechazarEventoModal
            eventoId={eventData.id}
            idParticipante={profile.id}
            eleccion={eleccion}
               isOpen={showConfirmarRechazarEvento}
           onClose={() => setShowConfirmarRechazarEvento(false)}
           onAceptar={handleConfirmarRechazarParticipacion}

          />

      )}
      {showEliminarEvento&& (

       <EliminarParticipacionEventoModal
        eventId={eventData.id}
        perfilId={profile.id}
        isOpen={showEliminarEvento}
        onClose={() =>{ 
                        setShowEliminarEvento(false)
                      
        }}
        onAceptar={handleEliminarParticipacion}
      />
          )}
    </>
  );
}