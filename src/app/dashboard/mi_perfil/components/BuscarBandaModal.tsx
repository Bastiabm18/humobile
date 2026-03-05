'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMusic, FaPaperPlane, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { enviarSolicitudUnionBanda, getBandasPaginadasInvitacion } from '../actions/actions';

interface Props {
  id_perfil_artista: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BuscarBandaModal({ id_perfil_artista, isOpen, onClose }: Props) {
  const [bandas, setBandas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Estados para la gestión de solicitudes sin alerts
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    if (!isOpen) {
        setStatus(null);
        setConfirmarId(null);
        return;
    }
    const fetchInitial = async () => {
      setLoading(true);
      setPage(0);
      try {
        const { data, hasMore: more } = await getBandasPaginadasInvitacion(id_perfil_artista, 0, 10, busqueda);
        setBandas(data || []);
        setHasMore(more);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    const timer = setTimeout(fetchInitial, busqueda ? 300 : 0);
    return () => clearTimeout(timer);
  }, [busqueda, isOpen, id_perfil_artista]);

  useEffect(() => {
    if (page === 0 || !isOpen) return;
    const fetchMore = async () => {
      setLoadingMore(true);
      try {
        const { data, hasMore: more } = await getBandasPaginadasInvitacion(id_perfil_artista, page, 10, busqueda);
        setBandas(prev => [...prev, ...(data || [])]);
        setHasMore(more);
      } catch (e) { console.error(e); }
      setLoadingMore(false);
    };
    fetchMore();
  }, [page, isOpen, id_perfil_artista]);

  const ejecutarEnvio = async (idBanda: string) => {
    setEnviandoId(idBanda);
    setConfirmarId(null);
    try {
      await enviarSolicitudUnionBanda(id_perfil_artista, idBanda);
      setStatus({ type: 'success', msg: '¡Solicitud enviada correctamente!' });
      // Opcional: remover la banda de la lista localmente
      setTimeout(() => {
          setBandas(prev => prev.filter(b => b.id_perfil !== idBanda));
          setStatus(null);
      }, 2000);
    } catch (error) {
      setStatus({ type: 'error', msg: 'No se pudo enviar la solicitud.' });
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
        {/* Overlay de Status (Reemplaza al Alert) */}
        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-neutral-900/90 backdrop-blur-sm p-6 text-center"
            >
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                {status.type === 'success' ? 
                  <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" /> : 
                  <FaExclamationTriangle className="text-red-500 text-6xl mx-auto mb-4" />
                }
                <h3 className="text-xl font-bold text-white mb-2">{status.msg}</h3>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaMusic className="text-blue-500" /> Explorar Bandas
            </h2>
            <p className="text-xs text-neutral-500 mt-1">Envía una invitación para unirte como integrante</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 transition-colors"><FaTimes size={20} /></button>
        </div>

        <div className="p-4 bg-neutral-800/20">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
            <input 
              type="text"
              placeholder="Buscar por nombre de banda..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="max-h-[450px] min-h-[300px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center text-neutral-500 flex flex-col items-center gap-3">
              <FaSpinner className="animate-spin text-blue-500" size={30} />
              <span className="text-sm animate-pulse">Sincronizando con la escena...</span>
            </div>
          ) : (
            <>
              {bandas.map((banda, index) => {
                const isLast = index === bandas.length - 1;
                const isConfirming = confirmarId === banda.id_perfil;

                return (
                  <motion.div 
                    layout
                    key={banda.id_perfil} 
                    ref={isLast ? lastElementRef : null}
                    className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden flex-shrink-0">
                        {banda.imagen_url ? (
                          <img src={banda.imagen_url} className="w-full h-full object-cover" alt={banda.nombre} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-600"><FaMusic size={20}/></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-lg leading-tight">{banda.nombre}</h3>
                            {banda.categoria && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium uppercase tracking-wider">
                                    {banda.categoria}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{banda.nombre_comuna || 'Ubicación pendiente'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {!isConfirming ? (
                          <motion.button
                            key="btn-init"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setConfirmarId(banda.id_perfil)}
                            disabled={enviandoId !== null}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                          >
                            Ser Parte
                          </motion.button>
                        ) : (
                          <motion.div 
                            key="confirm-group"
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1"
                          >
                            <button 
                                onClick={() => setConfirmarId(null)}
                                className="p-2 text-red-400 hover:text-red-600"
                            >
                                <FaTimes />
                            </button>
                            <button
                                onClick={() => ejecutarEnvio(banda.id_perfil)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                {enviandoId === banda.id_perfil ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                                Confirmar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
              
              {loadingMore && (
                <div className="py-6 text-center">
                    <FaSpinner className="animate-spin text-blue-500 mx-auto" />
                </div>
              )}

              {!hasMore && bandas.length > 0 && (
                <div className="text-center py-8">
                    <div className="h-px bg-neutral-800 w-full mb-4" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Fin de los resultados</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}