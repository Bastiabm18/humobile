// app/evento/components/EventoTarjeta.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaTicketAlt, 
  FaInstagram,
  FaGlobe,
  FaMusic,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaRegCalendarCheck,
  FaShareAlt,
  FaChevronDown
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { useEffect, useState } from 'react';
import ModalMapaLugar from './ModalMapaLugar';
import EventosCarrusel from '@/app/components/EventosCarrusel';
import { EventoCalendario, IntegranteBandaEvento } from '@/types/profile';
import { FaComputerMouse, FaRoute } from 'react-icons/fa6';
import { PiMouseLeftClickDuotone } from 'react-icons/pi';



interface EventoTarjetaProps {
  evento: EventoCalendario;
}

export default function EventoTarjeta({ evento }: EventoTarjetaProps) {
  const [showFullFlyer, setShowFullFlyer] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Función para mapear estados - usando es_bloqueo y es_publico
  const getStatusInfo = () => {
    if (evento.es_bloqueo) {
      return {
        status: 'blocked',
        display: 'Bloqueado',
        color: 'bg-red-600 text-white'
      };
    }
    
    if (!evento.es_publico) {
      return {
        status: 'private',
        display: 'Privado',
        color: 'bg-purple-600 text-white'
      };
    }
    
    return {
      status: 'approved',
      display: 'Público',
      color: 'bg-green-600 text-white'
    };
  };

  const getCategoryColor = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'show':
        return 'bg-purple-600 text-white';
      case 'concert':
        return 'bg-pink-600 text-white';
      case 'festival':
        return 'bg-orange-600 text-white';
      case 'private':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-neutral-600 text-white';
    }
  };

  const formatFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaSimple = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getParticipantType = (participante: IntegranteBandaEvento) => {
    switch (participante.tipo_perfil_participante) {
      case 'artista':
        return 'artista';
      case 'banda':
        return 'banda';
      case 'local':
      case 'lugar':
        return 'local';
      default:
        return 'desconocido';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const statusInfo = getStatusInfo();

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[95vw] md:max-w-[90vw] xl:max-w-[80vw] mx-auto"
      >
        {/* Sección del flyer vertical */}
        {evento.flyer_url && (
          <motion.div 
            variants={itemVariants}
            className="mb-8"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-700">
              {/* Flyer vertical */}
              <div className="flex justify-center bg-black">
                <img 
                  src={evento.flyer_url}
                  alt={`Flyer de ${evento.titulo}`}
                  className={`w-auto ${showFullFlyer ? 'max-h-[800px]' : 'max-h-[500px]'} object-contain transition-all duration-500`}
                />
              </div>
              
              {/* Overlay de información encima del flyer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              
              {/* Información sobre el flyer */}
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                {/* Badges en la parte superior */}
                <div className="flex flex-wrap gap-3 pointer-events-auto">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.color} backdrop-blur-sm`}>
                    {statusInfo.display}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(evento.nombre_categoria)} backdrop-blur-sm`}>
                    {evento.nombre_categoria || 'General'}
                  </span>
                </div>
                
                {/* Título y detalles en la parte inferior */}
                <div className="pointer-events-auto">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                    {evento.titulo}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                    {/* Mostrar el primer artista si existe */}
                    {evento.participantes.find(p => p.tipo_perfil_participante === 'artista') && (
                      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                        <FaMusic className="w-5 h-5 text-red-400" />
                        <span className="font-semibold text-lg">
                          {evento.participantes.find(p => p.tipo_perfil_participante === 'artista')?.nombre_participante}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <FaUser className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-lg">{evento.nombre_creador}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-white/80">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{formatFechaSimple(evento.inicio)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MdLocationOn className="w-4 h-4" />
                      <span>{evento.nombre_lugar}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botón para expandir/contraer flyer */}
              <button
                onClick={() => setShowFullFlyer(!showFullFlyer)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center gap-2 backdrop-blur-sm transition-colors pointer-events-auto"
              >
                <FaChevronDown className={`w-4 h-4 transition-transform ${showFullFlyer ? '' : 'rotate-180'}`} />
                <span className="text-sm">{showFullFlyer ? 'Ver más' : 'Ver menos'}</span>
              </button>
            </div>
            
            {/* Indicador de que hay más contenido abajo */}
            {!showFullFlyer && (
              <div className="flex justify-center mt-4">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-neutral-400"
                >
                  <FaChevronDown className="w-6 h-6" />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {/* Sección inferior con toda la información (solo visible si flyer no está expandido) */}
        {!showFullFlyer && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Columna izquierda - Información principal */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <FaCalendarAlt className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Fechas y Horarios</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-700/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <FaRegCalendarCheck className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-neutral-400">Inicio</p>
                    </div>
                    <p className="text-white font-medium text-lg">
                      {formatFecha(evento.inicio)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-neutral-700/30 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <FaRegCalendarCheck className="w-5 h-5 text-red-400" />
                      <p className="text-sm text-neutral-400">Fin</p>
                    </div>
                    <p className="text-white font-medium text-lg">
                      {formatFecha(evento.fin)}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gradient-to-r from-neutral-700/50 to-neutral-800/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaClock className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-neutral-400">Duración Total</p>
                  </div>
                  <p className="text-white font-medium">
                    {Math.round((new Date(evento.fin).getTime() - new Date(evento.inicio).getTime()) / (1000 * 60 * 60))} horas
                  </p>
                </div>
              </motion.div>

              {/* Artistas y participantes */}
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <FaMusic className="w-5 h-5 text-red-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">humobile Perfiles</h2>
                </div>
                <div className="space-y-3">
                  {evento.participantes.map((participante, index) => (
                    <div key={index} className="p-3 bg-neutral-700/30 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <FaUser className="w-4 h-4 text-blue-400" />
                        <p className="text-white font-medium">{participante.nombre_participante}</p>
                        <span className="px-2 py-1 text-xs bg-neutral-600 rounded-full capitalize">
                          {participante.tipo_perfil_participante}
                        </span>
                      </div>
                      {participante.integrantes_banda && participante.integrantes_banda.length > 0 && (
                        <div className="ml-7 mt-2">
                          <p className="text-sm text-neutral-400 mb-1">Integrantes:</p>
                          <ul className="space-y-1">
                            {participante.integrantes_banda.map((integrante, idx) => (
                              <li key={idx} className="text-sm text-neutral-300">
                                • {integrante.nombre_integrante}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Descripción */}
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <FaGlobe className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Descripción</h2>
                </div>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                  {evento.descripcion || 'Sin descripción disponible.'}
                </p>
              </motion.div>

              {/* Ubicación */}
              <motion.div 
                variants={itemVariants}
              
                className=" bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <FaMapMarkerAlt className="w-5 h-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Ubicación</h2>
                </div>
                
                <div className="space-y-4">
                  <div
                  onClick={() => setShowMapModal(true)}
                   className="p-4 cursor-pointer  bg-neutral-700/30 rounded-xl">
                    <div
                      className="flex items-center gap-3 mb-2">
                      <MdLocationOn className="w-5 h-5 text-green-400" />
                      <p className="text-sm text-neutral-400">Lugar</p>
                    </div>
                    <p className="text-white font-medium text-lg">
                      {evento.nombre_lugar || 'Lugar no especificado'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-neutral-700/30 rounded-xl">
                    <p className="text-sm text-neutral-400 mb-2">Dirección</p>
                    <p className="text-white font-medium">{evento.direccion_lugar}</p>
                  </div>
                  <div
                  onClick={()=> setShowMapModal(true)}
                  className="cursor-pointer p-4 bg-green-700/30 border-green-500/60 border-2 flex gap-5 flex-row items-center justify-start rounded-xl">
                   <p className="text-sm text-green-200">No sabes como llegar ? Click Aca!</p> <FaRoute size={22}  className=' animate-pulse'/>  
                   
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Columna derecha - Información adicional */}
            <div className="space-y-6">
              {/* Información de contacto */}
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <FaUser className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Contacto</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-700/30 rounded-lg">
                    <p className="text-sm text-neutral-400">Creador</p>
                    <p className="text-white font-medium">{evento.nombre_creador}</p>
                  </div>
                  
                  <div className="p-3 bg-neutral-700/30 rounded-lg">
                    <p className="text-sm text-neutral-400">Tipo de Perfil</p>
                    <p className="text-white font-medium capitalize">{evento.tipo_perfil_creador}</p>
                  </div>
                </div>
              </motion.div>

              {/* Enlaces importantes */}
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-600/20 rounded-lg">
                    <FaShareAlt className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Tickets</h2>
                </div>
                
                <div className="space-y-3">
                  {evento.tickets_evento ? (
                    <a 
                      href={evento.tickets_evento}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors group"
                    >
                      <FaTicketAlt className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                      <div>
                        <p className="text-sm text-neutral-300">Comprar Entradas</p>
                        <p className="text-xs text-neutral-400 truncate">{evento.tickets_evento}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 bg-neutral-700/30 rounded-lg">
                      <p className="text-sm text-neutral-300">Información de tickets no disponible</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Información técnica */}
              <motion.div 
                variants={itemVariants}
                className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-neutral-600/20 rounded-lg">
                    <FaBuilding className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Detalles Técnicos</h2>
                </div>
                
                <div className="space-y-3">

                  
                  <div className="flex justify-between items-center py-2 border-b border-neutral-700/50">
                    <span className="text-neutral-400">Visibilidad</span>
                    <span className={`text-sm ${evento.es_publico ? 'text-green-400' : 'text-purple-400'}`}>
                      {evento.es_publico ? 'Público' : 'Privado'}
                    </span>
                  </div>

                  
                  <div className="flex justify-between items-center py-2 border-b border-neutral-700/50">
                    <span className="text-neutral-400">Creado el</span>
                    <span className="text-white text-sm">{formatFechaSimple(evento.created_at)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-neutral-400">Actualizado</span>
                    <span className="text-white text-sm">{formatFechaSimple(evento.updated_at)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Botón de acción */}
              <motion.div variants={itemVariants}>
                <button className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
                  <div className="flex items-center justify-center gap-3">
                    <FaTicketAlt className="w-5 h-5" />
                    <span>Obtener Entradas</span>
                  </div>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Participantes */}
        {!showFullFlyer && evento.participantes && evento.participantes.length > 0 && (
          <motion.div 
            variants={itemVariants}
            className="mt-8 bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-600/20 rounded-lg">
                <FaCheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Participantes</h2>
              <span className="px-3 py-1 bg-neutral-700 rounded-full text-sm text-neutral-300">
                {evento.participantes.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evento.participantes.map((participante, index) => {
                const participantType = getParticipantType(participante);
                
                return (
                  <div key={index} className="p-4 bg-neutral-700/30 rounded-xl hover:bg-neutral-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center">
                        {participantType === 'artista' && <FaMusic className="w-5 h-5 text-purple-400" />}
                        {participantType === 'banda' && <FaUser className="w-5 h-5 text-blue-400" />}
                        {participantType === 'local' && <FaMapMarkerAlt className="w-5 h-5 text-red-400" />}
                        {participantType === 'desconocido' && <FaUser className="w-5 h-5 text-neutral-300" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{participante.nombre_participante}</p>
                        <p className="text-sm text-neutral-400 capitalize">{participante.tipo_perfil_participante}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
        <div className='w-[90vw] h-full flex items-center justify-center  overflow-x-hidden'>
        <EventosCarrusel/>

        </div>
      
      <ModalMapaLugar
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        latitud={evento.lat_lugar ? parseFloat(evento.lat_lugar) : -36.827}
        longitud={evento.lon_lugar ? parseFloat(evento.lon_lugar) : -73.050}
        nombreLugar={evento.nombre_lugar || 'Lugar del evento'}
        direccion={evento.direccion_lugar}
      />
    </>
  );
}