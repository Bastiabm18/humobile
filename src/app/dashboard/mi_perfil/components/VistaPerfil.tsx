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
  FaInfoCircle
} from 'react-icons/fa';
import { FaUser, FaLocationDot, FaClock, FaIdCard } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface VistaPerfilProps {
  perfil: Perfil;
}

export default function VistaPerfil({ perfil }: VistaPerfilProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
        bg-neutral-800
        border border-neutral-700
        rounded-2xl
        overflow-hidden
        shadow-xl
      "
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
          <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
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
                <span>{perfil.tipo_perfil}</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {perfil.nombre}
              </h1>
              {perfil.email && (
                <p className="text-neutral-300">{perfil.email}</p>
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

      {/* Información principal */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda - Información de contacto */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FaIdCard className="w-5 h-5 text-blue-400" />
                </div>
                <span>Información de Contacto</span>
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
                      <FaMapMarkerAlt className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Dirección</p>
                      <p className="text-lg text-white font-medium">{perfil.direccion}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ubicación */}
            {(perfil as any).ubicacion && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <FaLocationDot className="w-5 h-5 text-green-400" />
                  </div>
                  <span>Ubicación</span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {(perfil as any).ubicacion.comuna && (
                    <span className="px-4 py-2 bg-neutral-800 text-neutral-300 text-sm rounded-lg flex items-center gap-2">
                      <FaMapPin className="w-3 h-3" />
                      {(perfil as any).ubicacion.comuna}
                    </span>
                  )}
                  {(perfil as any).ubicacion.region && (
                    <span className="px-4 py-2 bg-neutral-800 text-neutral-300 text-sm rounded-lg flex items-center gap-2">
                      <FaGlobeAmericas className="w-3 h-3" />
                      {(perfil as any).ubicacion.region}
                    </span>
                  )}
                  {(perfil as any).ubicacion.pais && (
                    <span className="px-4 py-2 bg-neutral-800 text-neutral-300 text-sm rounded-lg flex items-center gap-2">
                      <FaGlobeAmericas className="w-3 h-3" />
                      {(perfil as any).ubicacion.pais}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Columna derecha - Información adicional */}
          <div className="space-y-6">
            {/* Video */}
            {perfil.video_url && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <FaVideo className="w-5 h-5 text-red-400" />
                  </div>
                  <span>Video</span>
                </h2>
                <div className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <FaLink className="w-4 h-4 text-blue-400" />
                    <a 
                      href={perfil.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Ver video externo
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Fechas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
            >
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <FaCalendarAlt className="w-5 h-5 text-yellow-400" />
                </div>
                <span>Información del Perfil</span>
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaClock className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-400">Creado</span>
                  </div>
                  <span className="text-white font-medium">{formatFecha(perfil.creado_en)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaClock className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-400">Actualizado</span>
                  </div>
                  <span className="text-white font-medium">{formatFecha(perfil.actualizado_en)}</span>
                </div>
              </div>
            </motion.div>

            {/* Coordenadas */}
            {(perfil.lat && perfil.lon) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-900/50 border border-neutral-700 rounded-xl p-5"
              >
                <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
                  <div className="p-2 bg-sky-500/10 rounded-lg">
                    <FaMapPin className="w-5 h-5 text-sky-400" />
                  </div>
                  <span>Coordenadas</span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-1">Latitud</p>
                    <p className="text-white font-bold text-lg">{perfil.lat}</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-1">Longitud</p>
                    <p className="text-white font-bold text-lg">{perfil.lon}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Tipo de perfil específico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 pt-8 border-t border-neutral-700/50"
        >
          <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FaInfoCircle className="w-5 h-5 text-purple-400" />
            </div>
            <span>Tipo de Perfil: {perfil.tipo_perfil}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-neutral-900/30 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FaUserCheck className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-medium text-white">Tipo</span>
              </div>
              <p className="text-neutral-300">{perfil.tipo_perfil}</p>
            </div>

            <div className="bg-neutral-900/30 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FaEye className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-medium text-white">Visibilidad</span>
              </div>
              <p className={`font-medium ${perfil.perfil_visible ? 'text-green-400' : 'text-red-400'}`}>
                {perfil.perfil_visible ? 'Visible al público' : 'Oculto'}
              </p>
            </div>

            <div className="bg-neutral-900/30 border border-neutral-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <FaCalendarAlt className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="font-medium text-white">Última Actualización</span>
              </div>
              <p className="text-neutral-300">{formatFecha(perfil.actualizado_en)}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}