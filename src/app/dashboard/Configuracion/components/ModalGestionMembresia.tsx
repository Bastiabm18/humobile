'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, 
  FaCrown, 
  FaCalendarCheck, 
  FaCalendarTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPlus,
  FaHistory,
  FaClock
} from 'react-icons/fa';
import { User } from '@/types/profile';
import { 
  getMembresiasDisponibles, 
  getHistorialMembresiaUsuario,
  asignarMembresiaAUsuario, 
  cancelarMembresiaUsuario,
  extenderMembresiaUsuario
} from '../actions/actions';

interface PropsModalGestionMembresia {
  estaAbierto: boolean;
  alCerrar: () => void;
  usuario: User | null;
  alActualizar: () => void;
}

interface Membresia {
  id_membership: string;
  nombre: string;
  precio_mensual: number;
  duracion_dias: number | null;
}

interface HistorialMembresia {
  id_state: string;
  user_id: string;
  membership_id: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado: string;
  Membership: {
    id_membership: string;
    nombre: string;
    precio_mensual: number;
    duracion_dias: number | null;
  } | null;
}

type TabActiva = 'asignar' | 'historial';

export default function ModalGestionMembresia({
  estaAbierto,
  alCerrar,
  usuario,
  alActualizar
}: PropsModalGestionMembresia) {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [historial, setHistorial] = useState<HistorialMembresia[]>([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState<string | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<'asignar' | 'cancelar' | 'extender' | null>(null);
  const [diasExtension, setDiasExtension] = useState(30);
  const [tabActiva, setTabActiva] = useState<TabActiva>('asignar');

  const tieneMembresiaActiva = usuario?.membership_estado === 'ACTIVO';

  useEffect(() => {
    if (estaAbierto && usuario) {
      resetearEstado();
      cargarDatos();
    }
  }, [estaAbierto, usuario]);

  const resetearEstado = () => {
    setError(null);
    setExito(null);
    setMembresiaSeleccionada(null);
    setMostrarConfirmacion(null);
    setTabActiva('asignar');
    setDiasExtension(30);
  };

  const cargarDatos = async () => {
    if (!usuario) return;
    
    try {
      setCargando(true);
      const [membresiasData, historialData] = await Promise.all([
        getMembresiasDisponibles(),
        getHistorialMembresiaUsuario(usuario.supabase_id)
      ]);
      setMembresias(membresiasData);
      setHistorial(historialData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setCargando(false);
    }
  };

  const cargarHistorial = async () => {
    if (!usuario) return;
    
    try {
      setCargandoHistorial(true);
      const historialData = await getHistorialMembresiaUsuario(usuario.supabase_id);
      setHistorial(historialData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
    } finally {
      setCargandoHistorial(false);
    }
  };

  const handleAsignarMembresia = async () => {
    if (!usuario || !membresiaSeleccionada) return;
    
    try {
      setProcesando(true);
      setError(null);
      
      const membresia = membresias.find(m => m.id_membership === membresiaSeleccionada);
      if (!membresia) throw new Error('Membresía no encontrada');
      
      await asignarMembresiaAUsuario(
        usuario.supabase_id,
        membresiaSeleccionada,
        membresia.duracion_dias
      );
      
      setExito(`Membresía "${membresia.nombre}" asignada exitosamente`);
      setMostrarConfirmacion(null);
      setMembresiaSeleccionada(null);
      alActualizar();
      cargarHistorial();
      
    } catch (err: any) {
      setError(err.message || 'Error al asignar membresía');
    } finally {
      setProcesando(false);
    }
  };

  const handleCancelarMembresia = async () => {
    if (!usuario) return;
    
    try {
      setProcesando(true);
      setError(null);
      
      await cancelarMembresiaUsuario(usuario.supabase_id);
      
      setExito('Membresía cancelada exitosamente');
      setMostrarConfirmacion(null);
      alActualizar();
      cargarHistorial();
      
    } catch (err: any) {
      setError(err.message || 'Error al cancelar membresía');
    } finally {
      setProcesando(false);
    }
  };

  const handleExtenderMembresia = async () => {
    if (!usuario || !diasExtension || diasExtension <= 0) return;
    
    try {
      setProcesando(true);
      setError(null);
      
      await extenderMembresiaUsuario(usuario.supabase_id, diasExtension);
      
      setExito(`Membresía extendida ${diasExtension} días exitosamente`);
      setMostrarConfirmacion(null);
      alActualizar();
      cargarHistorial();
      
    } catch (err: any) {
      setError(err.message || 'Error al extender membresía');
    } finally {
      setProcesando(false);
    }
  };

  const membresiaActual = membresias.find(m => 
    m.nombre.toLowerCase() === usuario?.membresia?.toLowerCase()?.replace(' (activo)', '').replace(' (cancelado)', '')
  );

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
                      w-full max-w-lg 
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-[70] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-700 bg-neutral-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center border border-purple-600/30">
                    <FaCrown className="text-purple-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Gestionar Membresía</h3>
                    <p className="text-neutral-400 text-sm">{usuario.name}</p>
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

            {/* Tabs */}
            <div className="flex border-b border-neutral-700">
              <button
                onClick={() => setTabActiva('asignar')}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
                  ${tabActiva === 'asignar' 
                    ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-900/10' 
                    : 'text-neutral-400 hover:text-neutral-300'
                  }`}
              >
                <FaPlus className="text-xs" />
                Asignar / Gestionar
              </button>
              <button
                onClick={() => { setTabActiva('historial'); cargarHistorial(); }}
                className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
                  ${tabActiva === 'historial' 
                    ? 'text-sky-400 border-b-2 border-sky-400 bg-sky-900/10' 
                    : 'text-neutral-400 hover:text-neutral-300'
                  }`}
              >
                <FaHistory className="text-xs" />
                Historial
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Éxito */}
              {exito && (
                <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-300 text-sm">{exito}</p>
                  </div>
                </div>
              )}

              {/* TAB: Asignar/Gestionar */}
              {tabActiva === 'asignar' && (
                <>
                  {/* Estado actual */}
                  <div className="mb-6 p-4 bg-neutral-700/50 rounded-lg border border-neutral-600">
                    <p className="text-neutral-500 text-xs uppercase tracking-wide mb-3">Membresía Actual</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {tieneMembresiaActiva ? (
                          <FaCheckCircle className="text-emerald-400" />
                        ) : (
                          <FaCalendarTimes className="text-neutral-500" />
                        )}
                        <span className={`font-medium ${
                          tieneMembresiaActiva ? 'text-emerald-400' : 'text-neutral-400'
                        }`}>
                          {usuario.membresia || 'Sin membresía'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        usuario.membership_estado === 'ACTIVO'
                          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700'
                          : 'bg-neutral-700 text-neutral-400 border border-neutral-600'
                      }`}>
                        {usuario.membership_estado || 'SIN MEMBRESÍA'}
                      </span>
                    </div>
                    
                    {usuario.membership_inicio && (
                      <div className="mt-3 pt-3 border-t border-neutral-600 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-neutral-500 text-xs">Inicio</span>
                          <p className="text-neutral-200">{new Date(usuario.membership_inicio).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 text-xs">Fin</span>
                          <p className="text-neutral-200">{usuario.membership_fin ? new Date(usuario.membership_fin).toLocaleDateString('es-ES') : 'Sin límite'}</p>
                        </div>
                        {usuario.membership_precio > 0 && (
                          <div>
                            <span className="text-neutral-500 text-xs">Precio</span>
                            <p className="text-emerald-400">${usuario.membership_precio.toFixed(2)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Acciones rápidas si tiene membresía activa */}
                  {tieneMembresiaActiva && !mostrarConfirmacion && (
                    <div className="mb-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setMostrarConfirmacion('extender')}
                        className="p-3 bg-sky-900/20 border border-sky-700 rounded-lg text-left hover:bg-sky-900/30 transition-colors"
                      >
                        <FaClock className="text-sky-400 mb-2" />
                        <p className="text-white text-sm font-medium">Extender Membresía</p>
                        <p className="text-neutral-400 text-xs mt-1">Agregar días adicionales</p>
                      </button>
                      <button
                        onClick={() => setMostrarConfirmacion('cancelar')}
                        className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-left hover:bg-red-900/30 transition-colors"
                      >
                        <FaCalendarTimes className="text-red-400 mb-2" />
                        <p className="text-white text-sm font-medium">Cancelar Membresía</p>
                        <p className="text-neutral-400 text-xs mt-1">Revocar acceso inmediatamente</p>
                      </button>
                    </div>
                  )}

                  {/* Lista de membresías disponibles para asignar */}
                  {!mostrarConfirmacion && (
                    <div>
                      <p className="text-neutral-400 text-sm mb-3">Membresías disponibles para asignar:</p>
                      
                      {cargando ? (
                        <div className="text-center py-8">
                          <FaSpinner className="animate-spin text-sky-400 text-2xl mx-auto" />
                          <p className="text-neutral-400 mt-2">Cargando membresías...</p>
                        </div>
                      ) : membresias.length === 0 ? (
                        <p className="text-neutral-400 text-center py-4 bg-neutral-700/30 rounded-lg">
                          No hay membresías disponibles
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {membresias.map((membresia) => {
                            const esMembresiaActual = membresiaActual?.id_membership === membresia.id_membership;
                            
                            return (
                              <button
                                key={membresia.id_membership}
                                onClick={() => setMembresiaSeleccionada(membresia.id_membership)}
                                disabled={procesando || esMembresiaActual}
                                className={`w-full p-4 rounded-lg border transition-all text-left
                                  ${membresiaSeleccionada === membresia.id_membership
                                    ? 'border-sky-500 bg-sky-900/20'
                                    : 'border-neutral-600 bg-neutral-700/30 hover:border-neutral-500'
                                  }
                                  ${esMembresiaActual ? 'opacity-60 cursor-not-allowed border-emerald-700/50' : ''}
                                  ${procesando ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      membresiaSeleccionada === membresia.id_membership 
                                        ? 'bg-sky-900/40' : 'bg-neutral-700'
                                    }`}>
                                      <FaCrown className={`text-sm ${
                                        membresiaSeleccionada === membresia.id_membership 
                                          ? 'text-sky-400' : 'text-neutral-400'
                                      }`} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-white font-medium">{membresia.nombre}</p>
                                        {esMembresiaActual && (
                                          <span className="px-1.5 py-0.5 bg-emerald-900/30 text-emerald-300 text-xs rounded">
                                            Actual
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-neutral-400 text-sm mt-0.5">
                                        {membresia.duracion_dias 
                                          ? `${membresia.duracion_dias} días de duración`
                                          : 'Duración ilimitada'
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className={`font-bold text-lg ${
                                      membresia.precio_mensual > 0 ? 'text-emerald-400' : 'text-sky-400'
                                    }`}>
                                      ${membresia.precio_mensual.toFixed(0)}
                                    </p>
                                    <p className="text-neutral-500 text-xs">/mes</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Panel de confirmación: Asignar */}
                  {mostrarConfirmacion === 'asignar' && membresiaSeleccionada && (
                    <div className="p-4 bg-sky-900/20 border border-sky-700 rounded-lg">
                      <p className="text-sky-300 font-medium mb-2">Confirmar Asignación</p>
                      <p className="text-neutral-300 text-sm mb-4">
                        ¿Asignar la membresía seleccionada al usuario <strong>{usuario.name}</strong>?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMostrarConfirmacion(null)}
                          className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
                          disabled={procesando}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAsignarMembresia}
                          className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                          disabled={procesando}
                        >
                          {procesando && <FaSpinner className="animate-spin" />}
                          Confirmar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Panel de confirmación: Cancelar */}
                  {mostrarConfirmacion === 'cancelar' && (
                    <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                      <p className="text-red-300 font-medium mb-2">⚠️ Cancelar Membresía</p>
                      <p className="text-neutral-300 text-sm mb-4">
                        ¿Estás seguro de cancelar la membresía de <strong>{usuario.name}</strong>? 
                        Esta acción revocará el acceso inmediatamente.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMostrarConfirmacion(null)}
                          className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
                          disabled={procesando}
                        >
                          No, mantener
                        </button>
                        <button
                          onClick={handleCancelarMembresia}
                          className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                          disabled={procesando}
                        >
                          {procesando && <FaSpinner className="animate-spin" />}
                          Sí, cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Panel de confirmación: Extender */}
                  {mostrarConfirmacion === 'extender' && (
                    <div className="p-4 bg-sky-900/20 border border-sky-700 rounded-lg">
                      <p className="text-sky-300 font-medium mb-2">Extender Membresía</p>
                      <p className="text-neutral-300 text-sm mb-4">
                        Selecciona cuántos días agregar a la membresía de <strong>{usuario.name}</strong>:
                      </p>
                      <div className="flex gap-2 mb-4">
                        {[7, 15, 30, 60, 90].map(dias => (
                          <button
                            key={dias}
                            onClick={() => setDiasExtension(dias)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                              ${diasExtension === dias
                                ? 'bg-sky-600 text-white border border-sky-500'
                                : 'bg-neutral-700 text-neutral-300 border border-neutral-600 hover:border-neutral-500'
                              }`}
                          >
                            {dias}d
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMostrarConfirmacion(null)}
                          className="flex-1 py-2 bg-neutral-700 hover:bg-neutral-600 text-white text-sm rounded-lg transition-colors"
                          disabled={procesando}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleExtenderMembresia}
                          className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                          disabled={procesando || !diasExtension}
                        >
                          {procesando && <FaSpinner className="animate-spin" />}
                          Extender {diasExtension} días
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB: Historial */}
              {tabActiva === 'historial' && (
                <>
                  {cargandoHistorial ? (
                    <div className="text-center py-8">
                      <FaSpinner className="animate-spin text-sky-400 text-2xl mx-auto" />
                      <p className="text-neutral-400 mt-2">Cargando historial...</p>
                    </div>
                  ) : historial.length === 0 ? (
                    <div className="text-center py-8 bg-neutral-700/30 rounded-lg">
                      <FaHistory className="text-neutral-500 text-3xl mx-auto mb-3" />
                      <p className="text-neutral-400">No hay historial de membresías</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {historial.map((item) => (
                        <div 
                          key={item.id_state} 
                          className={`p-3 rounded-lg border ${
                            item.estado === 'ACTIVO' 
                              ? 'border-emerald-700/50 bg-emerald-900/10' 
                              : 'border-neutral-600 bg-neutral-700/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FaCrown className={`text-sm ${
                                item.estado === 'ACTIVO' ? 'text-emerald-400' : 'text-neutral-500'
                              }`} />
                              <span className="text-white font-medium text-sm">
                                {item.Membership?.nombre || 'Membresía eliminada'}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              item.estado === 'ACTIVO'
                                ? 'bg-emerald-900/30 text-emerald-300'
                                : item.estado === 'CANCELADO'
                                ? 'bg-red-900/30 text-red-300'
                                : 'bg-neutral-700 text-neutral-400'
                            }`}>
                              {item.estado}
                            </span>
                          </div>
                          <div className="mt-2 flex gap-4 text-xs text-neutral-400">
                            <span>Inicio: {new Date(item.fecha_inicio).toLocaleDateString('es-ES')}</span>
                            {item.fecha_fin && (
                              <span>Fin: {new Date(item.fecha_fin).toLocaleDateString('es-ES')}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-700 bg-neutral-900">
              {tabActiva === 'asignar' && !mostrarConfirmacion && membresiaSeleccionada && (
                <button
                  onClick={() => setMostrarConfirmacion('asignar')}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 
                           text-white font-medium rounded-lg transition-colors
                           flex items-center justify-center gap-2"
                  disabled={procesando}
                >
                  {procesando ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCalendarCheck />
                  )}
                  Asignar Membresía Seleccionada
                </button>
              )}
              
              {tabActiva === 'asignar' && !mostrarConfirmacion && !membresiaSeleccionada && (
                <button
                  onClick={alCerrar}
                  className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 
                           text-white font-medium rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              )}
              
              {tabActiva === 'historial' && (
                <button
                  onClick={alCerrar}
                  className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 
                           text-white font-medium rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}