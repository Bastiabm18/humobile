'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaUserShield, FaPaperPlane, FaTimes,
  FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaSignOutAlt, FaCalendarAlt, FaUserPlus
} from 'react-icons/fa';
import {
  getIntegrantesParaAdmin,
  getAdministradoresBanda,
  agregarAdminExterno,
  eliminarAdminExterno
} from '../actions/actions';
import { format } from 'date-fns';

interface Props {
  id_banda: string;          // ID del perfil de la banda
  isOpen: boolean;
  onClose: () => void;
}

export default function GestionarAdministradoresModal({ id_banda, isOpen, onClose }: Props) {
  const [view, setView] = useState<'integrantes' | 'administradores'>('integrantes');

  // Integrantes disponibles
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Administradores actuales
  const [administradores, setAdministradores] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Gestión
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore || view !== 'integrantes') return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, view]);

  // Carga inicial de integrantes (con debounce)
  useEffect(() => {
    if (!isOpen || view !== 'integrantes' || !id_banda) return;

    const fetchInitial = async () => {
      setLoading(true);
      setPage(0);
      try {
        const { data, hasMore: more } = await getIntegrantesParaAdmin(
          id_banda,
          0,
          10,
          busqueda
        );
        setIntegrantes(data || []);
        setHasMore(more);
      } catch (e) {
        console.error(e);
        setStatus({ type: 'error', msg: 'Error al cargar integrantes' });
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchInitial, busqueda ? 300 : 0);
    return () => clearTimeout(timer);
  }, [busqueda, isOpen, id_banda, view]);

  // Carga de administradores actuales
  useEffect(() => {
    if (!isOpen || view !== 'administradores' || !id_banda) return;

    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      try {
        const { data } = await getAdministradoresBanda(id_banda);
        setAdministradores(data || []);
      } catch (e) {
        console.error(e);
        setStatus({ type: 'error', msg: 'Error al cargar administradores' });
      } finally {
        setLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, [isOpen, id_banda, view]);

  // Paginación de integrantes
  useEffect(() => {
    if (page === 0 || !isOpen || view !== 'integrantes' || !id_banda) return;

    const fetchMore = async () => {
      setLoadingMore(true);
      try {
        const { data, hasMore: more } = await getIntegrantesParaAdmin(
          id_banda,
          page,
          10,
          busqueda
        );
        setIntegrantes(prev => [...prev, ...(data || [])]);
        setHasMore(more);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMore(false);
      }
    };
    fetchMore();
  }, [page, isOpen, id_banda, busqueda, view]);

  const agregarAdmin = async (usuario_id: string, idIntegrante: string) => {
    setEnviandoId(idIntegrante);
    setConfirmarId(null);
    try {
      await agregarAdminExterno({
        usuario_id,
        id_perfil_banda: id_banda
      });
      setStatus({ type: 'success', msg: 'Administrador agregado correctamente' });
      // Remover de la lista de integrantes
      setIntegrantes(prev => prev.filter(i => i.id_integrante !== idIntegrante));
      setTimeout(() => setStatus(null), 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'No se pudo agregar el administrador' });
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setEnviandoId(null);
    }
  };

  const eliminarAdmin = async (idAdmin: string) => {
    setEnviandoId(idAdmin);
    try {
      await eliminarAdminExterno(idAdmin);
      setStatus({ type: 'success', msg: 'Administrador eliminado' });
      setAdministradores(prev => prev.filter(a => a.id_admin !== idAdmin));
      setConfirmarId(null);
      setTimeout(() => setStatus(null), 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error al eliminar' });
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setEnviandoId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900/95 backdrop-blur-sm p-6 text-center"
            >
              {status.type === 'success' ? (
                <FaCheckCircle className="text-green-500 text-6xl mb-4" />
              ) : (
                <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
              )}
              <h3 className="text-xl font-bold text-white">{status.msg}</h3>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUserShield className="text-blue-500" /> Gestionar Administradores
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 transition-colors">
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
            <button
              onClick={() => setView('integrantes')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                view === 'integrantes'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Integrantes disponibles
            </button>
            <button
              onClick={() => setView('administradores')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                view === 'administradores'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Administradores actuales
            </button>
          </div>
        </div>

        {view === 'integrantes' && (
          <div className="p-4 bg-neutral-800/20 border-b border-neutral-800/50">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                placeholder="Buscar integrante..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all placeholder:text-neutral-700"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="max-h-[450px] min-h-[350px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {view === 'integrantes' ? (
            loading ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <FaSpinner className="animate-spin text-blue-500" size={30} />
                <span className="text-sm text-neutral-500 animate-pulse">Cargando integrantes...</span>
              </div>
            ) : (
              <>
                {integrantes.map((item, index) => {
                  const isConfirming = confirmarId === item.id_integrante;
                  return (
                    <motion.div
                      layout
                      key={item.id_integrante}
                      ref={index === integrantes.length - 1 ? lastElementRef : null}
                      className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl hover:border-neutral-700 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                          {item.imagen_url ? (
                            <img src={item.imagen_url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                              <FaUserShield size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{item.nombre_artista}</h3>
                          <p className="text-xs text-neutral-400">{item.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          {!isConfirming ? (
                            <motion.button
                              key="btn-add"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setConfirmarId(item.id_integrante)}
                              className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                            >
                              <FaUserPlus /> Agregar
                            </motion.button>
                          ) : (
                            <motion.div
                              key="conf"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex gap-1"
                            >
                              <button
                                onClick={() => setConfirmarId(null)}
                                className="p-2 text-neutral-500 hover:text-white"
                              >
                                <FaTimes />
                              </button>
                              <button
                                onClick={() => agregarAdmin(item.usuario_id, item.id_integrante)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                              >
                                {enviandoId === item.id_integrante ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                Confirmar
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
                {integrantes.length === 0 && !loading && (
                  <div className="py-20 text-center text-neutral-600 italic">
                    No hay integrantes disponibles para agregar como administradores.
                  </div>
                )}
              </>
            )
          ) : (
            // Vista de administradores actuales
            loadingAdmins ? (
              <div className="py-20 text-center flex flex-col items-center gap-3">
                <FaSpinner className="animate-spin text-blue-500" size={30} />
                <span className="text-sm text-neutral-500 animate-pulse">Cargando administradores...</span>
              </div>
            ) : (
              <>
                {administradores.map((admin) => {
                  const isConfirming = confirmarId === admin.id_admin;
                  return (
                    <motion.div
                      layout
                      key={admin.id_admin}
                      className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden flex items-center justify-center text-neutral-600">
                          <FaUserShield size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{admin.nombre_usuario}</h3>
                          <p className="text-xs text-neutral-400">{admin.email}</p>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-1">
                            <FaCalendarAlt /> {format(new Date(admin.creado_en), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          {!isConfirming ? (
                            <motion.button
                              key="btn-remove"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setConfirmarId(admin.id_admin)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                            >
                              <FaSignOutAlt /> Quitar
                            </motion.button>
                          ) : (
                            <motion.div
                              key="conf-remove"
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex gap-1"
                            >
                              <button
                                onClick={() => setConfirmarId(null)}
                                className="p-2 text-neutral-500 hover:text-white"
                              >
                                <FaTimes />
                              </button>
                              <button
                                onClick={() => eliminarAdmin(admin.id_admin)}
                                className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                              >
                                {enviandoId === admin.id_admin ? (
                                  <FaSpinner className="animate-spin" />
                                ) : (
                                  'Confirmar'
                                )}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
                {administradores.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                      <FaUserShield size={24} />
                    </div>
                    <p className="text-neutral-500 italic max-w-[200px]">
                      No hay administradores externos asignados.
                    </p>
                  </div>
                )}
              </>
            )
          )}

          {loadingMore && view === 'integrantes' && (
            <div className="py-4 text-center">
              <FaSpinner className="animate-spin text-blue-500 inline" size={20} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}