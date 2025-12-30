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

interface EventoTarjetaProps {
  evento: any;
}

export default function EventoTarjeta({ evento }: EventoTarjetaProps) {
  const [showFullFlyer, setShowFullFlyer] = useState(false);
  // state para mostrar el modal del mapa evento
const [showMapModal, setShowMapModal] = useState(false);


useEffect(() => {
  //useeffect evita que react haga un scroll automatico 
  window.scrollTo(0, 0);
}, []);
  // Formatear fechas
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaSimple = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'rejected':
        return 'bg-red-600 text-white';
      case 'cancelled':
        return 'bg-neutral-600 text-white';
      default:
        return 'bg-neutral-600 text-white';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  return (
    <>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto"
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
                alt={`Flyer de ${evento.title}`}
                className={`w-auto ${showFullFlyer ? 'max-h-[800px]' : 'max-h-[500px]'} object-contain transition-all duration-500`}
              />
            </div>
            
            {/* Overlay de información encima del flyer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            
            {/* Información sobre el flyer */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
              {/* Badges en la parte superior */}
              <div className="flex flex-wrap gap-3 pointer-events-auto">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(evento.status)} backdrop-blur-sm`}>
                  {evento.status === 'approved' ? 'Confirmado' : 
                   evento.status === 'pending' ? 'Pendiente' : 
                   evento.status === 'rejected' ? 'Rechazado' : 
                   'Cancelado'}
                </span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(evento.category)} backdrop-blur-sm`}>
                  {evento.category === 'show' ? 'Show' : 
                   evento.category === 'concert' ? 'Concierto' : 
                   evento.category === 'festival' ? 'Festival' : 
                   evento.category === 'private' ? 'Privado' : 
                   'Evento'}
                </span>
              </div>
              
              {/* Título y detalles en la parte inferior */}
              <div className="pointer-events-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                  {evento.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <FaMusic className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-lg">{evento.nombre_artista || 'Artista'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <FaUser className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-lg">{evento.organizer_name}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>{formatFechaSimple(evento.fecha_hora_ini)}</span>
                  </div>
                  
                  {evento.custom_place_name && (
                    <div className="flex items-center gap-2">
                      <MdLocationOn className="w-4 h-4" />
                      <span>{evento.custom_place_name}</span>
                    </div>
                  )}
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
                    {formatFecha(evento.fecha_hora_ini)}
                  </p>
                </div>
                
                <div className="p-4 bg-neutral-700/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaRegCalendarCheck className="w-5 h-5 text-red-400" />
                    <p className="text-sm text-neutral-400">Fin</p>
                  </div>
                  <p className="text-white font-medium text-lg">
                    {formatFecha(evento.fecha_hora_fin)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gradient-to-r from-neutral-700/50 to-neutral-800/50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <FaClock className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-neutral-400">Duración Total</p>
                </div>
                <p className="text-white font-medium">
                  {Math.round((new Date(evento.fecha_hora_fin).getTime() - new Date(evento.fecha_hora_ini).getTime()) / (1000 * 60 * 60))} horas
                </p>
              </div>
            </motion.div>

            {/* Artistas */}
            <motion.div 
              variants={itemVariants}
              className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600/20 rounded-lg">
                  <FaMusic className="w-5 h-5 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Artistas</h2>
              </div>
              <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                {evento.nombre_artista || ''}
              </p>
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
                {evento.description || 'Sin descripción disponible.'}
              </p>
            </motion.div>

            {/* Ubicación */}
            <motion.div 
              variants={itemVariants}
               onClick={() => setShowMapModal(true)}
              className="cursor-pointer bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <FaMapMarkerAlt className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Ubicación</h2>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-700/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <MdLocationOn className="w-5 h-5 text-green-400" />
                    <p className="text-sm text-neutral-400">Lugar</p>
                  </div>
                  <p className="text-white font-medium text-lg">
                    {evento.custom_place_name || 'Lugar no especificado'}
                  </p>
                </div>
                
                {evento.address && (
                  <div className="p-4 bg-neutral-700/30 rounded-xl">
                    <p className="text-sm text-neutral-400 mb-2">Dirección</p>
                    <p className="text-white font-medium">{evento.address}</p>
                  </div>
                )}
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
                  <p className="text-sm text-neutral-400">Organizador</p>
                  <p className="text-white font-medium">{evento.organizer_name}</p>
                </div>
                
                {evento.organizer_contact && (
                  <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                    <FaPhone className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Teléfono</p>
                      <p className="text-white font-medium">{evento.organizer_contact}</p>
                    </div>
                  </div>
                )}
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
                <h2 className="text-xl font-semibold text-white">Enlaces</h2>
              </div>
              
              <div className="space-y-3">
                {evento.ticket_link && (
                  <a 
                    href={evento.ticket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors group"
                  >
                    <FaTicketAlt className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                    <div>
                      <p className="text-sm text-neutral-300">Comprar Entradas</p>
                      <p className="text-xs text-neutral-400 truncate">{evento.ticket_link}</p>
                    </div>
                  </a>
                )}
                
                {evento.instagram_link && (
                  <a 
                    href={evento.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-pink-600/20 hover:bg-pink-600/30 rounded-lg transition-colors group"
                  >
                    <FaInstagram className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />
                    <div>
                      <p className="text-sm text-neutral-300">Instagram</p>
                      <p className="text-xs text-neutral-400 truncate">{evento.instagram_link}</p>
                    </div>
                  </a>
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
                  <span className="text-neutral-400">ID del Evento</span>
                  <span className="text-white font-mono text-sm">{evento.id.substring(0, 8)}...</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-neutral-700/50">
                  <span className="text-neutral-400">Creador</span>
                  <span className="text-white text-sm capitalize">{evento.creator_type}</span>
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

      {/* Participantes (si hay y flyer no está expandido) */}
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
            {evento.participantes.map((participante: any, index: number) => (
              <div key={index} className="p-4 bg-neutral-700/30 rounded-xl hover:bg-neutral-700/50 transition-colors">
                <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      {participante.nombre_artistico ? (
                        // Artista - Icono musical
                        <FaMusic className="w-5 h-5 text-purple-400" />
                      ) : participante.nombre_banda ? (
                        // Banda - Icono grupo
                        <FaUser className="w-5 h-5 text-blue-400" />
                      ) : participante.nombre_local ? (
                        // Local - Icono lugar
                        <FaMapMarkerAlt className="w-5 h-5 text-red-400" />
                      ) : (
                        // Desconocido - Icono usuario
                        <FaUser className="w-5 h-5 text-neutral-300" />
                      )}
                    </div>
                  <div>
                    <p className="text-white font-medium">  {participante.nombre_artistico || participante.nombre_banda || participante.nombre_local || `ID: ${participante.perfil_id?.substring(0, 8)}`}</p>
                    <p className="text-sm text-neutral-400 capitalize">{participante.estado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <EventosCarrusel/>
    </motion.div>
          <ModalMapaLugar
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        latitud={evento.lugares?.[0]?.latitud ?? -36.827}
        longitud={evento.lugares?.[0]?.longitud ?? -73.050}
        nombreLugar={evento.lugares?.[0]?.nombre_local ?? evento.custom_place_name ?? 'Lugar del evento'}
        direccion={evento.lugares?.[0]?.direccion ?? evento.address}
      />
    </>
  );
}