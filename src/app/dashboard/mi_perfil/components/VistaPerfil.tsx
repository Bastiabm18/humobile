// app/dashboard/mi_perfil/VistaPerfil.tsx
'use client';

import { Perfil } from '@/types/profile';
import { 
  FaGuitar, 
  FaBuilding, 
  FaMusic, 
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaVideo,
  FaLink,
  FaGlobeAmericas,
  FaCalendarAlt,
  FaUserCheck,
  FaMapPin,
  FaInfoCircle,
  FaIdCard,
  FaLocationArrow,
  FaGlobe,
  FaHome,
  FaUserTag,
  FaUsers,
  FaUserFriends
} from 'react-icons/fa';
import { FaUser, FaLocationDot, FaClock, FaIdCardClip } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import MapaLugar from './MapaLugar';

interface VistaPerfilProps {
  perfil: Perfil;
}

export default function VistaPerfil({ perfil }: VistaPerfilProps) {
  const [showFullMap, setShowFullMap] = useState(false);

  const getTipoIcono = () => {
    switch (perfil.tipo_perfil) {
      case 'artista': return <FaUser className="w-6 h-6" />;
      case 'banda': return <FaGuitar className="w-6 h-6" />;
      case 'local': return <FaBuilding className="w-6 h-6" />;
      case 'productor': return <FaMusic className="w-6 h-6" />;
      case 'representante': return <FaBriefcase className="w-6 h-6" />;
      default: return <FaUser className="w-6 h-6" />;
    }
  };

  const getTipoColor = () => {
    switch (perfil.tipo_perfil) {
      case 'artista': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'banda': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'local': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'productor': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'representante': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      return format(new Date(fecha), "dd 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  // Verificar si tiene coordenadas para mostrar mapa
  const tieneCoordenadas = perfil.lat && perfil.lon;
  const ubicacion = (perfil as any).ubicacion || {};

  // Verificar si hay integrantes o representados
  const tieneIntegrantes = perfil.tipo_perfil === 'banda' && 
    perfil.nombre_integrantes && 
    perfil.nombre_integrantes.length > 0;

  const tieneRepresentados = perfil.tipo_perfil === 'representante' && 
    perfil.nombre_representados && 
    perfil.nombre_representados.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Header con imagen */}
      <div className="relative h-64 overflow-hidden">
        {perfil.imagen_url ? (
          <img
            src={perfil.imagen_url}
            alt={perfil.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center">
            <div className="text-7xl text-neutral-700">
              {getTipoIcono()}
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className={`
                inline-flex items-center gap-2
                px-4 py-2
                ${getTipoColor()}
                rounded-full
                text-sm font-semibold
                mb-4
                backdrop-blur-sm
              `}>
                {getTipoIcono()}
                <span className="capitalize">{perfil.tipo_perfil}</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {perfil.nombre}
              </h1>
              {perfil.email && (
                <p className="text-neutral-300 flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4" />
                  {perfil.email}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`
                px-4 py-2
                ${perfil.perfil_visible 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }
                rounded-full
                text-sm font-medium
                flex items-center gap-2
                backdrop-blur-sm
              `}>
                {perfil.perfil_visible ? <FaEye /> : <FaEyeSlash />}
                <span>{perfil.perfil_visible ? 'Visible' : 'Oculto'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa en row aparte - SOLO si hay coordenadas */}
      {tieneCoordenadas && (
        <div className="px-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-neutral-900/50 border border-neutral-700 rounded-xl overflow-hidden">
              <div className="p-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <FaMapMarkerAlt className="w-5 h-5 text-red-400" />
                    </div>
                    <span>Ubicación</span>
                  </h2>
                  <button
                    onClick={() => setShowFullMap(!showFullMap)}
                    className="px-3 py-1.5 bg-sky-600/70 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                  >
                    {showFullMap ? 'Ver pequeño' : 'Ver completo'}
                  </button>
                </div>
                
                <MapaLugar
                  latitud={perfil.lat}
                  longitud={perfil.lon}
                  nombreLugar={perfil.nombre}
                  direccion={perfil.direccion || undefined}
                  compacto={!showFullMap}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Información principal - 3 columnas siempre */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información de contacto y ubicación */}
          <div className="space-y-6">
            {/* Contacto */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FaPhone className="w-5 h-5 text-blue-400" />
                </div>
                <span>Contacto</span>
              </h2>
              
              <div className="space-y-4">
                {perfil.telefono_contacto && (
                  <div className="flex items-start gap-4 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <FaPhone className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Teléfono</p>
                      <p className="text-lg text-white font-medium">{perfil.telefono_contacto}</p>
                    </div>
                  </div>
                )}
                
                {perfil.email && (
                  <div className="flex items-start gap-4 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FaEnvelope className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Email</p>
                      <p className="text-lg text-white font-medium">{perfil.email}</p>
                    </div>
                  </div>
                )}
                
                {perfil.direccion && (
                  <div className="flex items-start gap-4 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <FaHome className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Dirección</p>
                      <p className="text-lg text-white font-medium">{perfil.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Integrantes (solo para bandas) */}
            {tieneIntegrantes && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <FaUsers className="w-5 h-5 text-purple-400" />
                  </div>
                  <span>Integrantes</span>
                </h2>
                
                <div className="space-y-3">
                  {perfil.nombre_integrantes && perfil.nombre_integrantes.map((integrante, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{integrante}</p>
                  
                      </div>
                      <div className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
                        Integrante
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <p className="text-sm text-neutral-400">
                      {perfil.nombre_integrantes?.length} integrante{perfil.nombre_integrantes?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Representados (solo para representantes) */}
            {tieneRepresentados && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <FaUserFriends className="w-5 h-5 text-red-400" />
                  </div>
                  <span>Representados</span>
                </h2>
                
                <div className="space-y-3">
                  {perfil.nombre_representados &&perfil.nombre_representados.map((representado, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{representado}</p>
                        
                      </div>
                      <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                        Representado
                      </div>
                    </div>
                  ))}
                  <div className="text-center pt-2">
                    <p className="text-sm text-neutral-400">
                      {perfil.nombre_representados?.length} representado{perfil.nombre_representados?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Ubicación geográfica (país, región, comuna) */}
            {(ubicacion.comuna || ubicacion.region || ubicacion.pais) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: tieneIntegrantes || tieneRepresentados ? 0.4 : 0.3 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FaGlobe className="w-5 h-5 text-green-400" />
                  </div>
                  <span>Ubicación Geográfica</span>
                </h2>
                
                <div className="space-y-3">
                  {ubicacion.pais && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <FaGlobeAmericas className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-400">País</p>
                        <p className="text-white font-medium">{ubicacion.pais}</p>
                      </div>
                    </div>
                  )}
                  
                  {ubicacion.region && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <FaLocationDot className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-400">Región</p>
                        <p className="text-white font-medium">{ubicacion.region}</p>
                      </div>
                    </div>
                  )}
                  
                  {ubicacion.comuna && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        <FaMapPin className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-400">Comuna</p>
                        <p className="text-white font-medium">{ubicacion.comuna}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Columna central - Información del perfil */}
          <div className="space-y-6">
            {/* Video */}
            {perfil.video_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <FaVideo className="w-5 h-5 text-red-400" />
                  </div>
                  <span>Video</span>
                </h2>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaLink className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-sm text-neutral-400">Enlace de video</p>
                        <a 
                          href={perfil.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-medium truncate block max-w-xs"
                        >
                          {perfil.video_url.substring(0, 40)}...
                        </a>
                      </div>
                    </div>
                    <a 
                      href={perfil.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Ver
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Información del perfil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <FaCalendarAlt className="w-5 h-5 text-yellow-400" />
                </div>
                <span>Historial del Perfil</span>
              </h2>
              
              <div className="space-y-4">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FaClock className="w-4 h-4 text-green-400" />
                    <span className="text-neutral-300">Creado el</span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {formatFecha(perfil.creado_en)}
                  </p>
                </div>

                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FaClock className="w-4 h-4 text-blue-400" />
                    <span className="text-neutral-300">Última actualización</span>
                  </div>
                  <p className="text-white font-semibold text-lg">
                    {formatFecha(perfil.actualizado_en)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Estado del perfil */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-sky-500/10 rounded-lg">
                  <FaIdCardClip className="w-5 h-5 text-sky-400" />
                </div>
                <span>Estado del Perfil</span>
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaEye className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">Visibilidad</span>
                  </div>
                  <span className={`font-semibold ${perfil.perfil_visible ? 'text-green-400' : 'text-red-400'}`}>
                    {perfil.perfil_visible ? 'Público' : 'Privado'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaUserCheck className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">Tipo</span>
                  </div>
                  <span className={`font-semibold ${getTipoColor().split(' ')[0]}`}>
                    {perfil.tipo_perfil}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaInfoCircle className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">ID del perfil</span>
                  </div>
                  <span className="text-white font-mono text-xs">
                    {perfil.id_perfil.substring(0, 10)}...
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Columna derecha - IDs y coordenadas si no están en el mapa */}
          <div className="space-y-6">
            {/* IDs */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FaIdCard className="w-5 h-5 text-orange-400" />
                </div>
                <span>Identificación</span>
              </h2>
              
              <div className="space-y-3">
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-2">ID del Perfil</p>
                  <p className="text-white font-mono text-sm break-all">
                    {perfil.id_perfil}
                  </p>
                </div>
                
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <p className="text-sm text-neutral-400 mb-2">ID del Usuario</p>
                  <p className="text-white font-mono text-sm break-all">
                    {perfil.usuario_id}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Coordenadas (solo si no están en el mapa) */}
            {!tieneCoordenadas && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-lg">
                    <FaMapMarkerAlt className="w-5 h-5 text-sky-400" />
                  </div>
                  <span>Coordenadas</span>
                </h2>
                
                <div className="space-y-3">
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-2">Latitud</p>
                    <p className="text-white font-bold text-lg font-mono">
                      {perfil.lat ? perfil.lat.toFixed(6) : 'No definida'}
                    </p>
                  </div>
                  
                  <div className="bg-neutral-800/50 rounded-lg p-4">
                    <p className="text-sm text-neutral-400 mb-2">Longitud</p>
                    <p className="text-white font-bold text-lg font-mono">
                      {perfil.lon ? perfil.lon.toFixed(6) : 'No definida'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Información del tipo de perfil */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FaUserTag className="w-5 h-5 text-purple-400" />
                </div>
                <span>Tipo de Perfil</span>
              </h2>
              
              <div className={`p-4 ${getTipoColor()} rounded-lg text-center`}>
                <div className="text-4xl mb-3">
                  {getTipoIcono()}
                </div>
                <p className="text-xl font-bold text-white capitalize">
                  {perfil.tipo_perfil}
                </p>
                <p className="text-sm text-neutral-300 mt-2">
                  Perfil {perfil.perfil_visible ? 'público' : 'privado'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}