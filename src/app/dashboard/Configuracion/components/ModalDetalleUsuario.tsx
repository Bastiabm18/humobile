'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaIdCard, 
  FaCrown, 
  FaCheckCircle, 
  FaBan, 
  FaMusic,
  FaUsers,
  FaMapMarkerAlt,
  FaUserTie,
  FaFilm
} from 'react-icons/fa';
import { User } from '@/types/profile';

interface PropsModalDetalleUsuario {
  estaAbierto: boolean;
  alCerrar: () => void;
  usuario: User | null;
}

export default function ModalDetalleUsuario({
  estaAbierto,
  alCerrar,
  usuario
}: PropsModalDetalleUsuario) {
  if (!usuario) return null;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const totalPerfiles = usuario.perfil_artista + usuario.perfil_banda + usuario.perfil_lugar + 
                      usuario.perfil_representante + usuario.perfil_productor;

  return (
    <AnimatePresence>
      {estaAbierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar}
            className="fixed inset-0 bg-black/70 z-[60]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-full max-w-lg 
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-700 bg-neutral-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-600/20 flex items-center justify-center border border-sky-600/30">
                    <FaUser className="text-sky-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{usuario.name}</h3>
                    <p className="text-neutral-400 text-sm">Detalles del usuario</p>
                  </div>
                </div>
                <button
                  onClick={alCerrar}
                  className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                
                {/* ID */}
                <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                  <div className="p-2 bg-sky-900/30 rounded-lg">
                    <FaIdCard className="text-sky-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">ID Usuario</p>
                    <p className="text-neutral-300 font-mono text-sm mt-0.5">{usuario.id.substring(0, 16)}...</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <FaEnvelope className="text-blue-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">Email</p>
                    <p className="text-white font-medium mt-0.5">{usuario.email}</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                  <div className="p-2 bg-emerald-900/30 rounded-lg">
                    <FaPhone className="text-emerald-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">Teléfono</p>
                    <p className="text-white font-medium mt-0.5">{usuario.telefono || 'No registrado'}</p>
                  </div>
                </div>

                {/* Rol */}
                <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                  <div className="p-2 bg-amber-900/30 rounded-lg">
                    <FaCrown className="text-amber-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">Rol</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium mt-1 inline-block ${
                      usuario.role === 'admin' 
                        ? 'bg-purple-900/30 text-purple-300 border border-purple-700'
                        : usuario.role === 'superadmin'
                        ? 'bg-red-900/30 text-red-300 border border-red-700'
                        : 'bg-blue-900/30 text-blue-300 border border-blue-700'
                    }`}>
                      {usuario.role}
                    </span>
                  </div>
                </div>

                {/* Estado */}
                <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    usuario.estado === 'activo' ? 'bg-emerald-900/30' : 
                    usuario.estado === 'bloqueado' ? 'bg-red-900/30' : 'bg-amber-900/30'
                  }`}>
                    {usuario.estado === 'activo' 
                      ? <FaCheckCircle className="text-emerald-400 text-sm" />
                      : <FaBan className="text-red-400 text-sm" />
                    }
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">Estado</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium mt-1 inline-block ${
                      usuario.estado === 'activo'
                        ? 'bg-emerald-900/30 text-emerald-300'
                        : usuario.estado === 'bloqueado'
                        ? 'bg-red-900/30 text-red-300'
                        : 'bg-amber-900/30 text-amber-300'
                    }`}>
                      {usuario.estado || 'Desconocido'}
                    </span>
                  </div>
                </div>

                {/* Membresía */}
                <div className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <FaCrown className="text-purple-400 text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-neutral-500 text-xs uppercase tracking-wide">Membresía</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        usuario.membresia?.toLowerCase().includes('premium')
                          ? 'bg-amber-900/30 text-amber-300 border border-amber-700'
                          : 'bg-neutral-700 text-neutral-300 border border-neutral-600'
                      }`}>
                        {usuario.membresia || 'Sin membresía'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.membership_estado === 'ACTIVO'
                          ? 'bg-emerald-900/30 text-emerald-300'
                          : 'bg-neutral-700 text-neutral-400'
                      }`}>
                        {usuario.membership_estado || 'SIN MEMBRESÍA'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detalle de membresía si tiene */}
                {usuario.membership_inicio && (
                  <div className="p-3 bg-neutral-700/20 rounded-lg border border-neutral-600/50">
                    <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">Detalle de Membresía</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-neutral-400">Inicio:</span>
                        <p className="text-neutral-200">{new Date(usuario.membership_inicio).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div>
                        <span className="text-neutral-400">Fin:</span>
                        <p className="text-neutral-200">{usuario.membership_fin ? new Date(usuario.membership_fin).toLocaleDateString('es-ES') : 'Sin límite'}</p>
                      </div>
                      {usuario.membership_precio > 0 && (
                        <div>
                          <span className="text-neutral-400">Precio:</span>
                          <p className="text-emerald-400">${usuario.membership_precio.toFixed(2)}/mes</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                    {/* Perfiles */}
                    <div className="p-3 bg-neutral-700/30 rounded-lg">
                      <p className="text-neutral-500 text-xs uppercase tracking-wide mb-3">Perfiles del Usuario</p>
                      <div className="grid grid-cols-6 gap-2">
                        <div className="text-center p-2 bg-neutral-700/50 rounded-lg">
                          <FaMusic className={`text-blue-400 mx-auto mb-1 text-sm ${usuario.perfil_artista > 0 ? '' : 'opacity-30'}`} />
                          <span className={`text-base font-bold ${usuario.perfil_artista > 0 ? 'text-blue-400' : 'text-neutral-500'}`}>
                            {usuario.perfil_artista}
                          </span>
                          <p className="text-xs text-neutral-500">Art</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-700/50 rounded-lg">
                          <FaUsers className={`text-purple-400 mx-auto mb-1 text-sm ${usuario.perfil_banda > 0 ? '' : 'opacity-30'}`} />
                          <span className={`text-base font-bold ${usuario.perfil_banda > 0 ? 'text-purple-400' : 'text-neutral-500'}`}>
                            {usuario.perfil_banda}
                          </span>
                          <p className="text-xs text-neutral-500">Ban</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-700/50 rounded-lg">
                          <FaMapMarkerAlt className={`text-amber-400 mx-auto mb-1 text-sm ${usuario.perfil_lugar > 0 ? '' : 'opacity-30'}`} />
                          <span className={`text-base font-bold ${usuario.perfil_lugar > 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                            {usuario.perfil_lugar}
                          </span>
                          <p className="text-xs text-neutral-500">Lug</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-700/50 rounded-lg">
                          <FaUserTie className={`text-pink-400 mx-auto mb-1 text-sm ${usuario.perfil_representante > 0 ? '' : 'opacity-30'}`} />
                          <span className={`text-base font-bold ${usuario.perfil_representante > 0 ? 'text-pink-400' : 'text-neutral-500'}`}>
                            {usuario.perfil_representante}
                          </span>
                          <p className="text-xs text-neutral-500">Rep</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-700/50 rounded-lg">
                          <FaFilm className={`text-cyan-400 mx-auto mb-1 text-sm ${usuario.perfil_productor > 0 ? '' : 'opacity-30'}`} />
                          <span className={`text-base font-bold ${usuario.perfil_productor > 0 ? 'text-cyan-400' : 'text-neutral-500'}`}>
                            {usuario.perfil_productor}
                          </span>
                          <p className="text-xs text-neutral-500">Prod</p>
                        </div>
                        <div className="text-center p-2 bg-neutral-700/50 rounded-lg border border-emerald-700/30">
                          <span className={`text-base font-bold ${totalPerfiles > 0 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {totalPerfiles}
                          </span>
                          <p className="text-xs text-neutral-500">Total</p>
                        </div>
                      </div>
                    </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-neutral-700/30 rounded-lg">
                    <FaCalendar className="text-blue-400 text-xs" />
                    <div>
                      <p className="text-neutral-500 text-xs">Registro</p>
                      <p className="text-neutral-200 text-xs">{formatearFecha(usuario.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-neutral-700/30 rounded-lg">
                    <FaCalendar className="text-indigo-400 text-xs" />
                    <div>
                      <p className="text-neutral-500 text-xs">Actualización</p>
                      <p className="text-neutral-200 text-xs">{formatearFecha(usuario.updatedAt)}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-700 bg-neutral-900">
              <button
                onClick={alCerrar}
                className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 
                         text-white font-medium rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}