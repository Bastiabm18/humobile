// app/dashboard/mi_perfil/GridPerfiles.tsx
'use client';

import { Perfil } from '@/types/profile';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaGuitar, 
  FaBuilding, 
  FaMusic, 
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { HiPencil, HiTrash } from 'react-icons/hi';
import { BsCalendar3 } from 'react-icons/bs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface GridPerfilesProps {
  perfiles: Perfil[];
  onRefresh: () => void;
  onEdit: (perfil: Perfil) => void;
  onDelete: (id_perfil: string) => void;
  onVer: (perfil: Perfil) => void;
}

export default function GridPerfiles({
  perfiles,
  onRefresh,
  onEdit,
  onDelete,
  onVer
}: GridPerfilesProps) {
  if (perfiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <FaUser className="w-16 h-16 text-neutral-600 mx-auto" />
        </div>
        <p className="text-xl font-medium text-neutral-400 mb-2">
          No tienes perfiles creados
        </p>
        <p className="text-neutral-500">
          Crea tu primer perfil para comenzar
        </p>
      </div>
    );
  }

  const getTipoIcono = (tipo: string) => {
    switch (tipo) {
      case 'artista': return <FaUser className="w-5 h-5" />;
      case 'banda': return <FaGuitar className="w-5 h-5" />;
      case 'local': return <FaBuilding className="w-5 h-5" />;
      case 'productor': return <FaMusic className="w-5 h-5" />;
      case 'representante': return <FaBriefcase className="w-5 h-5" />;
      default: return <FaUser className="w-5 h-5" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'artista': return 'Artista';
      case 'banda': return 'Banda';
      case 'local': return 'Local';
      case 'productor': return 'Productor';
      case 'representante': return 'Representante';
      default: return 'Perfil';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {perfiles.map((perfil, index) => (
        <motion.div
          key={perfil.id_perfil}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group relative"
        >
          {/* Tarjeta principal */}
          <div className="
            bg-neutral-800/50
            border border-neutral-700/50
            rounded-2xl overflow-hidden
            transition-all duration-300
            hover:shadow-2xl hover:shadow-black/30
            hover:border-neutral-600
            hover:scale-[1.02]
            flex flex-col
            h-full
          ">
            {/* Encabezado con imagen */}
            <div className="relative h-48 overflow-hidden">
              {perfil.imagen_url ? (
                <img
                  src={perfil.imagen_url}
                  alt={perfil.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                  <div className="text-5xl text-neutral-600">
                    {getTipoIcono(perfil.tipo_perfil)}
                  </div>
                </div>
              )}
              
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Badge de tipo */}
              <div className={`
                absolute top-4 left-4
                ${getTipoColor(perfil.tipo_perfil)}
                px-3 py-1.5 rounded-full
                flex items-center gap-2
                text-sm font-semibold
                backdrop-blur-sm
                border
              `}>
                {getTipoIcono(perfil.tipo_perfil)}
                <span>{getTipoLabel(perfil.tipo_perfil)}</span>
              </div>
              
              {/* Visibilidad */}
              <div className="absolute top-4 right-4">
                <div className={`
                  px-3 py-1.5 rounded-full
                  ${perfil.perfil_visible 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }
                  text-sm font-medium
                  backdrop-blur-sm
                  flex items-center gap-2
                `}>
                  {perfil.perfil_visible ? <FaEye /> : <FaEyeSlash />}
                  <span>{perfil.perfil_visible ? 'Visible' : 'Oculto'}</span>
                </div>
              </div>
              
              {/* Nombre */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-1">
                  {perfil.nombre}
                </h3>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-5 flex-grow">
              {/* Información de contacto */}
              <div className="space-y-3 mb-4">
                {perfil.email && (
                  <div className="flex items-start gap-3">
                    <FaEnvelope className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Email</p>
                      <p className="text-sm text-neutral-300 truncate">{perfil.email}</p>
                    </div>
                  </div>
                )}
                
                {perfil.telefono_contacto && (
                  <div className="flex items-start gap-3">
                    <FaPhone className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Teléfono</p>
                      <p className="text-sm text-neutral-300">{perfil.telefono_contacto}</p>
                    </div>
                  </div>
                )}
                
                {perfil.direccion && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-400">Dirección</p>
                      <p className="text-sm text-neutral-300 line-clamp-2">{perfil.direccion}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ubicación */}
              {(perfil as any).ubicacion && (
                <div className="mb-4 p-3 bg-neutral-900/30 rounded-lg">
                  <p className="text-xs font-medium text-neutral-400 mb-1">Ubicación</p>
                  <div className="flex flex-wrap gap-2">
                    {(perfil as any).ubicacion.comuna && (
                      <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded">
                        {(perfil as any).ubicacion.comuna}
                      </span>
                    )}
                    {(perfil as any).ubicacion.region && (
                      <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded">
                        {(perfil as any).ubicacion.region}
                      </span>
                    )}
                    {(perfil as any).ubicacion.pais && (
                      <span className="px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded">
                        {(perfil as any).ubicacion.pais}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Fecha de creación */}
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <BsCalendar3 className="w-3 h-3" />
                <span>Creado: {formatFecha(perfil.creado_en)}</span>
              </div>
            </div>

            {/* Pie de tarjeta con acciones */}
            <div className="p-4 border-t border-neutral-700/50 bg-neutral-900/30">
              <div className="flex items-center gap-2">
                {/* Botón Ver */}
                <button
                  onClick={() => onVer(perfil)}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-2.5
                    bg-blue-500/10 hover:bg-blue-500/20
                    border border-blue-500/20 hover:border-blue-500/40
                    text-blue-400 hover:text-blue-300
                    rounded-lg
                    transition-all duration-200
                    group/btn
                  "
                  title="Ver perfil"
                >
                  <FaEye className="w-4 h-4" />
                  <span className="text-sm font-medium">Ver</span>
                </button>

                {/* Botón Editar */}
                <button
                  onClick={() => onEdit(perfil)}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-2.5
                    bg-yellow-500/10 hover:bg-yellow-500/20
                    border border-yellow-500/20 hover:border-yellow-500/40
                    text-yellow-400 hover:text-yellow-300
                    rounded-lg
                    transition-all duration-200
                    group/btn
                  "
                  title="Editar perfil"
                >
                  <HiPencil className="w-4 h-4" />
                  <span className="text-sm font-medium">Editar</span>
                </button>

                {/* Botón Eliminar */}
                <button
                  onClick={async () => {
                   
                      await onDelete(perfil.id_perfil);
                      onRefresh();
                    
                  }}
                  className="
                    flex-1 flex items-center justify-center gap-2
                    px-3 py-2.5
                    bg-red-500/10 hover:bg-red-500/20
                    border border-red-500/20 hover:border-red-500/40
                    text-red-400 hover:text-red-300
                    rounded-lg
                    transition-all duration-200
                    group/btn
                  "
                  title="Eliminar perfil"
                >
                  <HiTrash className="w-4 h-4" />
                  <span className="text-sm font-medium">Eliminar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Efecto de brillo en hover */}
          <div className="
            absolute inset-0 rounded-2xl
            bg-gradient-to-r from-transparent via-transparent to-transparent
            group-hover:via-white/5
            transition-all duration-500
            pointer-events-none
            -z-10
          " />
        </motion.div>
      ))}
    </div>
  );
}