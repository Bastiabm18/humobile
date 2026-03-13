'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaUserTie, FaPaperPlane, FaTimes,
  FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaSignOutAlt, FaCalendarAlt
} from 'react-icons/fa';
import {
  getPerfilesParaRepresentarPaginados,
  enviarSolicitudRepresentado,
  getMisRepresentadosActivos,
  abandonarRepresentadoAction
} from '../actions/actions';
import { format } from 'date-fns';

interface Props {
  id_representante: string;   // ID del perfil del representante
  isOpen: boolean;
  onClose: () => void;
}

export default function BuscarRepresentadosModal({ id_representante, isOpen, onClose }: Props) {
  const [view, setView] = useState<'explorar' | 'mis_representados'>('explorar');

  // Explorar
  const [perfiles, setPerfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Mis representados
  const [misRepresentados, setMisRepresentados] = useState<any[]>([]);

  // Gestión
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore || view !== 'explorar') return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, view]);

  // ========== EFFECTS ==========
  // Carga inicial explorar (con debounce)
  useEffect(() => {
    if (!isOpen || view !== 'explorar' || !id_representante) return;

    const fetchInitial = async () => {
      setLoading(true);
      setPage(0);
      try {
        const { data, hasMore: more } = await getPerfilesParaRepresentarPaginados(
          id_representante,
          0,
          10,
          busqueda
        );
        setPerfiles(data || []);
        setHasMore(more);
      } catch (e) {
        console.error(e);
        setStatus({ type: 'error', msg: 'Error al cargar perfiles' });
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchInitial, busqueda ? 300 : 0);
    return () => clearTimeout(timer);
  }, [busqueda, isOpen, id_representante, view]);

  // Carga mis representados
  useEffect(() => {
    if (!isOpen || view !== 'mis_representados' || !id_representante) return;

    const loadMisRepresentados = async () => {
      setLoading(true);
      try {
        const { data } = await getMisRepresentadosActivos(id_representante);
        setMisRepresentados(data || []);
      } catch (e) {
        console.error(e);
        setStatus({ type: 'error', msg: 'Error al cargar tus representados' });
      } finally {
        setLoading(false);
      }
    };
    loadMisRepresentados();
  }, [isOpen, view, id_representante]);

  // Paginación explorar
  useEffect(() => {
    if (page === 0 || !isOpen || view !== 'explorar' || !id_representante) return;

    const fetchMore = async () => {
      setLoadingMore(true);
      try {
        const { data, hasMore: more } = await getPerfilesParaRepresentarPaginados(
          id_representante,
          page,
          10,
          busqueda
        );
        setPerfiles(prev => [...prev, ...(data || [])]);
        setHasMore(more);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMore(false);
      }
    };
    fetchMore();
  }, [page, isOpen, id_representante, busqueda, view]);

  // ========== ACCIONES ==========
  const ejecutarEnvio = async (idPerfil: string) => {
    setEnviandoId(idPerfil);
    setConfirmarId(null);
    try {
      await enviarSolicitudRepresentado({
        id_representante,
        id_perfil: idPerfil
      });
      setStatus({ type: 'success', msg: '¡Solicitud enviada correctamente!' });
      setTimeout(() => {
        setPerfiles(prev => prev.filter(p => p.id_perfil !== idPerfil));
        setStatus(null);
      }, 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'No se pudo enviar la solicitud.' });
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setEnviandoId(null);
    }
  };

  const handleAbandonar = async (idRepresentado: string) => {
    setEnviandoId(idRepresentado);
    try {
      await abandonarRepresentadoAction(idRepresentado);
      setStatus({ type: 'success', msg: 'Has dejado de representar a este perfil' });
      setMisRepresentados(prev => prev.filter(r => r.id_representado !== idRepresentado));
      setConfirmarId(null);
      setTimeout(() => setStatus(null), 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'Error al procesar la solicitud' });
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
        {/* Status Overlay */}
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

        {/* Header */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaUserTie className="text-blue-500" /> Buscar Representados
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
            <button
              onClick={() => setView('explorar')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                view === 'explorar'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Buscar Nuevos
            </button>
            <button
              onClick={() => setView('mis_representados')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                view === 'mis_representados'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              Mis Representados
            </button>
          </div>
        </div>

        {/* Search Bar (solo explorar) */}
        {view === 'explorar' && (
          <div className="p-4 bg-neutral-800/20 border-b border-neutral-800/50">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                placeholder="Nombre del artista, banda o local..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all placeholder:text-neutral-700"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Lista principal */}
        <div className="max-h-[450px] min-h-[350px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <FaSpinner className="animate-spin text-blue-500" size={30} />
              <span className="text-sm text-neutral-500 animate-pulse">Cargando datos...</span>
            </div>
          ) : view === 'explorar' ? (
            <>
              {perfiles.map((perfil, index) => {
                const isConfirming = confirmarId === perfil.id_perfil;
                return (
                  <motion.div
                    layout
                    key={perfil.id_perfil}
                    ref={index === perfiles.length - 1 ? lastElementRef : null}
                    className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl hover:border-neutral-700 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                        {perfil.imagen_url ? (
                          <img src={perfil.imagen_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <FaUserTie size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{perfil.nombre}</h3>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold">
                            {perfil.tipo_perfil}
                          </span>
                          {perfil.categoria && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-bold">
                              {perfil.categoria}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {!isConfirming ? (
                          <motion.button
                            key="btn-inv"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmarId(perfil.id_perfil)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Representar
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
                              onClick={() => ejecutarEnvio(perfil.id_perfil)}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                            >
                              {enviandoId === perfil.id_perfil ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaPaperPlane />
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
              {perfiles.length === 0 && !loading && (
                <div className="py-20 text-center text-neutral-600 italic">
                  No se encontraron perfiles disponibles.
                </div>
              )}
            </>
          ) : (
            // Vista Mis Representados
            <>
              {misRepresentados.map((item) => {
                const isConfirming = confirmarId === item.id_representado;
                return (
                  <motion.div
                    layout
                    key={item.id_representado}
                    className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                        {item.imagen_url_representado ? (
                          <img src={item.imagen_url_representado} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600">
                            <FaUserTie size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{item.nombre_representado}</h3>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold">
                            {item.tipo_perfil}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                            <FaCalendarAlt />{' '}
                            {item.fecha_union ? format(new Date(item.fecha_union), 'dd MMM yyyy') : ''}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              item.estado === 'activo'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : item.estado === 'pendiente'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : 'bg-neutral-500/10 text-neutral-400'
                            }`}
                          >
                            {item.estado || 'activo'}
                          </span>
                          {item.categoria && (
                            <span className="text-[10px] text-blue-400 font-bold uppercase">
                              {item.categoria}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {!isConfirming ? (
                          <motion.button
                            key="btn-out"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setConfirmarId(item.id_representado)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                          >
                            <FaSignOutAlt /> Dejar
                          </motion.button>
                        ) : (
                          <motion.div
                            key="conf-out"
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
                              onClick={() => handleAbandonar(item.id_representado)}
                              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                            >
                              {enviandoId === item.id_representado ? (
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
              {misRepresentados.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600">
                    <FaUserTie size={24} />
                  </div>
                  <p className="text-neutral-500 italic max-w-[200px]">
                    Aún no representas a ningún perfil.
                  </p>
                </div>
              )}
            </>
          )}

          {loadingMore && view === 'explorar' && (
            <div className="py-4 text-center">
              <FaSpinner className="animate-spin text-blue-500 inline" size={20} />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}