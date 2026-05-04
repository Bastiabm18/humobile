'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaMusic, 
  FaUsers, 
  FaMapMarkerAlt, 
  FaUserTie, 
  FaFilm, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaExclamationTriangle,
  FaSpinner,
  FaUsersCog
} from 'react-icons/fa';
import { User, Perfil } from '@/types/profile';
import { getPerfilesByUsuario_2, eliminarPerfil } from '../actions/actions';

interface PropsModalGestionPerfiles {
  estaAbierto: boolean;
  alCerrar: () => void;
  usuario: User | null;
  alActualizar: () => void;
}

export default function ModalGestionPerfiles({
  estaAbierto,
  alCerrar,
  usuario,
  alActualizar
}: PropsModalGestionPerfiles) {
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null); // Guarda el id_perfil que se está eliminando
  const [error, setError] = useState<string | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<Perfil | null>(null);

  useEffect(() => {
    if (estaAbierto && usuario) {
      resetearEstado();
      cargarPerfiles();
    }
  }, [estaAbierto, usuario]);

  const resetearEstado = () => {
    setError(null);
    setMostrarConfirmacion(null);
    setProcesando(null);
  };

  const cargarPerfiles = async () => {
    if (!usuario) return;
    try {
      setCargando(true);
      setError(null);
      const data = await getPerfilesByUsuario_2(usuario.supabase_id);
      setPerfiles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async () => {
    if (!mostrarConfirmacion) return;
    try {
      setProcesando(mostrarConfirmacion.id_perfil);
      setError(null);
      
      await eliminarPerfil(mostrarConfirmacion.id_perfil);
      
      setMostrarConfirmacion(null);
      alActualizar(); // Refresca la tabla principal para actualizar los contadores
      await cargarPerfiles(); // Refresca esta lista
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcesando(null);
    }
  };

  // Configuración visual por tipo de perfil
  const getConfiguracionTipo = (tipo: string) => {
    switch (tipo) {
      case 'artista': return { icono: <FaMusic className="text-sm" />, color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-700', texto: 'Artista' };
      case 'banda': return { icono: <FaUsers className="text-sm" />, color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700', texto: 'Banda' };
      case 'lugar':
      case 'local': return { icono: <FaMapMarkerAlt className="text-sm" />, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-700', texto: 'Lugar' };
      case 'representante': return { icono: <FaUserTie className="text-sm" />, color: 'text-pink-400', bg: 'bg-pink-900/30 border-pink-700', texto: 'Representante' };
      case 'productor': return { icono: <FaFilm className="text-sm" />, color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-700', texto: 'Productor' };
      default: return { icono: <FaUsersCog className="text-sm" />, color: 'text-neutral-400', bg: 'bg-neutral-700 border-neutral-600', texto: tipo };
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {estaAbierto && usuario && (
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
                      w-full max-w-lg max-h-[85vh] 
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-[70] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-700 bg-neutral-900 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 flex items-center justify-center border border-indigo-600/30">
                    <FaUsersCog className="text-indigo-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Perfiles Asociados</h3>
                    <p className="text-neutral-400 text-sm">{usuario.name} ({usuario.email})</p>
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
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {cargando ? (
                <div className="text-center py-12">
                  <FaSpinner className="animate-spin text-indigo-400 text-2xl mx-auto" />
                  <p className="text-neutral-400 mt-3">Cargando perfiles...</p>
                </div>
              ) : perfiles.length === 0 ? (
                <div className="text-center py-12 bg-neutral-700/30 rounded-lg">
                  <FaUsersCog className="text-neutral-600 text-4xl mx-auto mb-3" />
                  <p className="text-neutral-400 font-medium">Sin perfiles registrados</p>
                  <p className="text-neutral-500 text-sm mt-1">Este usuario no ha creado ningún perfil aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {perfiles.map((perfil) => {
                    const config = getConfiguracionTipo(perfil.tipo_perfil);
                    return (
                      <div 
                        key={perfil.id_perfil} 
                        className="p-4 bg-neutral-700/30 rounded-lg border border-neutral-600 hover:border-neutral-500 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2.5 rounded-lg border ${config.bg} flex-shrink-0`}>
                              <span className={config.color}>{config.icono}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-semibold truncate">{perfil.nombre}</p>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.color}`}>
                                  {config.texto}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-neutral-400">
                                <span className="flex items-center gap-1">
                                  {perfil.perfil_visible ? <FaEye className="text-emerald-400" /> : <FaEyeSlash className="text-red-400" />}
                                  {perfil.perfil_visible ? 'Visible' : 'Oculto'}
                                </span>
                                <span>Creado: {formatearFecha(perfil.creado_en)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => setMostrarConfirmacion(perfil)}
                            className="p-2 bg-red-900/30 border border-red-700/50 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-lg transition-colors flex-shrink-0"
                            title="Eliminar perfil"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-700 bg-neutral-900 flex-shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-400">
                  Total: {perfiles.length} perfil{perfiles.length !== 1 ? 'es' : ''}
                </span>
                <button
                  onClick={alCerrar}
                  className="px-5 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Modal de Confirmación de Eliminación */}
            <AnimatePresence>
              {mostrarConfirmacion && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 z-[80] rounded-xl"
                    onClick={() => !procesando && setMostrarConfirmacion(null)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              w-[90%] max-w-sm 
                              bg-neutral-800 rounded-xl border border-red-700 
                              z-[90] overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-900/30 rounded-lg border border-red-700">
                          <FaTrash className="text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">Eliminar Perfil</h4>
                          <p className="text-neutral-400 text-sm">Esta acción es permanente</p>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-700/50 rounded-lg border border-neutral-600 mb-4">
                        <p className="text-white font-medium">{mostrarConfirmacion.nombre}</p>
                        <p className="text-neutral-400 text-sm capitalize">{mostrarConfirmacion.tipo_perfil}</p>
                      </div>

                      <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg mb-4">
                        <p className="text-red-300 text-sm">
                          ⚠️ Se eliminará el perfil y toda su configuración. Si tiene eventos o solicitudes asociadas, la operación será rechazada por la base de datos.
                        </p>
                      </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setMostrarConfirmacion(null)}
                    disabled={!!procesando} // <-- FIX AQUÍ
                    className="flex-1 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminar}
                    disabled={procesando === mostrarConfirmacion.id_perfil} // Este ya estaba bien
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {procesando === mostrarConfirmacion.id_perfil ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaTrash />
                    )}
                    Eliminar
                  </button>
                </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}