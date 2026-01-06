'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaExclamationTriangle, 
  FaUserSlash, 
  FaUserLock, 
  FaUserCheck,
  FaUserEdit,
  FaTrash
} from 'react-icons/fa';
import { User } from '@/types/profile';

interface PropsModalConfirmacionUsuario {
  estaAbierto: boolean;
  alCerrar: () => void;
  usuario: User | null;
  accion: 'eliminar' | 'bloquear' | 'activar' | 'editar' | null;
  alConfirmar: () => void;
}

export default function ModalConfirmacionUsuario({
  estaAbierto,
  alCerrar,
  usuario,
  accion,
  alConfirmar
}: PropsModalConfirmacionUsuario) {
  if (!usuario || !accion) return null;

  const configuraciones = {
    eliminar: {
      titulo: 'Eliminar Usuario',
      mensaje: '¿Estás seguro de que deseas eliminar permanentemente este usuario?',
      descripcion: 'Esta acción eliminará todos los datos del usuario de forma permanente y no se puede deshacer.',
      color: 'red',
      icono: <FaTrash className="text-red-400 text-2xl" />,
      botonAccion: 'Eliminar Permanentemente',
      iconoAccion: <FaTrash />
    },
    bloquear: {
      titulo: 'Bloquear Usuario',
      mensaje: '¿Estás seguro de que deseas bloquear este usuario?',
      descripcion: 'El usuario no podrá acceder al sistema hasta que sea activado nuevamente.',
      color: 'amber',
      icono: <FaUserLock className="text-amber-400 text-2xl" />,
      botonAccion: 'Bloquear Usuario',
      iconoAccion: <FaUserLock />
    },
    activar: {
      titulo: 'Activar Usuario',
      mensaje: '¿Estás seguro de que deseas activar este usuario?',
      descripcion: 'El usuario podrá acceder al sistema nuevamente.',
      color: 'emerald',
      icono: <FaUserCheck className="text-emerald-400 text-2xl" />,
      botonAccion: 'Activar Usuario',
      iconoAccion: <FaUserCheck />
    },
    editar: {
      titulo: 'Editar Usuario',
      mensaje: '¿Deseas editar los datos de este usuario?',
      descripcion: 'Se abrirá el formulario de edición.',
      color: 'blue',
      icono: <FaUserEdit className="text-blue-400 text-2xl" />,
      botonAccion: 'Continuar',
      iconoAccion: <FaUserEdit />
    }
  }[accion];

  const colorClase = `border-${configuraciones.color}-700 bg-${configuraciones.color}-900/20`;

  return (
    <AnimatePresence>
      {estaAbierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar}
            className="fixed inset-0 bg-black/80 z-[60]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-full max-w-md 
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className={`p-6 border-b ${colorClase}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-${configuraciones.color}-900/40 rounded-lg`}>
                  {configuraciones.icono}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {configuraciones.titulo}
                  </h3>
                  <p className="text-neutral-400 text-sm mt-1">
                    Confirmación de acción
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-neutral-300 mb-4">
                  {configuraciones.mensaje}
                </p>
                
                {/* Información del usuario */}
                <div className="p-4 bg-neutral-700/50 rounded-lg border border-neutral-600 mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-neutral-600 flex items-center justify-center flex-shrink-0">
                      <FaUserSlash className="text-neutral-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{usuario.name}</p>
                      <p className="text-neutral-400 text-sm">{usuario.email}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 bg-neutral-600 text-neutral-300 text-xs rounded">
                          {usuario.role}
                        </span>
                        <span className="px-2 py-1 bg-neutral-600 text-neutral-300 text-xs rounded">
                          {usuario.membresia || 'Sin membresía'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          usuario.estado === 'activo'
                            ? 'bg-emerald-900/30 text-emerald-300'
                            : 'bg-red-900/30 text-red-300'
                        }`}>
                          {usuario.estado || 'Desconocido'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Descripción de la acción */}
                <div className="p-3 bg-neutral-700/30 border border-neutral-600 rounded-lg">
                  <p className="text-neutral-300 text-sm">
                    {configuraciones.descripcion}
                  </p>
                </div>
                
                {/* Advertencia para eliminación */}
                {accion === 'eliminar' && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-300 text-sm">
                        ⚠️ Esta acción es irreversible. Se eliminarán todos los datos del usuario incluyendo:
                        perfiles, historial, membresía y configuración.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={alCerrar}
                  className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 
                           text-white font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alConfirmar();
                    alCerrar();
                  }}
                  className={`flex items-center gap-2 px-5 py-2 
                           bg-${configuraciones.color}-600 hover:bg-${configuraciones.color}-700 
                           text-white font-medium rounded-lg transition-colors`}
                >
                  {configuraciones.iconoAccion}
                  {configuraciones.botonAccion}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}