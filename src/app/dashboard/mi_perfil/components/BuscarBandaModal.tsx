'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaMusic, FaPaperPlane, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaSignOutAlt, FaCalendarAlt } from 'react-icons/fa';
import { 
  enviarSolicitudUnionBanda, 
  getBandasPaginadasInvitacion, 
  getMisBandasActivas, // Debes crear esta acción
  abandonarBandaAction  // Debes crear esta acción
} from '../actions/actions';
import { InvitacionData } from '@/types/profile';
import { format, setDate } from 'date-fns';

interface Props {
  id_perfil_artista: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BuscarBandaModal({ id_perfil_artista, isOpen, onClose }: Props) {
  // Estados de Navegación
  const [view, setView] = useState<'explorar' | 'mis_bandas'>('explorar');

  // Estados de Datos (Explorar)
  const [bandas, setBandas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Estados de Datos (Mis Bandas)
  const [misBandas, setMisBandas] = useState<any[]>([]);
  
  // Estados de Gestión
  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const formatDateToInput = (date: Date | string): string => {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };

  const [formData, setFormData] = useState<InvitacionData>({
    id_perfil: id_perfil_artista,
    id_banda: '',
    fecha_invitacion: formatDateToInput(new Date()),
    fecha_vencimiento: formatDateToInput(setDate(new Date(), 14)),
    nombre_banda: '',
    invitacion: '',
    descripcion: 'Quiero ser parte de su banda',
    tabla_origen: 'solicitud'
  });

  const observer = useRef<IntersectionObserver | null>(null);
  
  // Infinite Scroll Ref
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore || view !== 'explorar') return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, view]);

  // Carga Inicial y Búsqueda
  useEffect(() => {
    if (!isOpen || view !== 'explorar') return;
    
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
  }, [busqueda, isOpen, id_perfil_artista, view]);

  // Carga Mis Bandas
  useEffect(() => {
    if (isOpen && view === 'mis_bandas') {
      const loadMisBandas = async () => {
        setLoading(true);
        try {
          const { data } = await getMisBandasActivas(id_perfil_artista);
          setMisBandas(data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
      };
      loadMisBandas();
    }
  }, [isOpen, view, id_perfil_artista]);

  // Paginación Explorar
  useEffect(() => {
    if (page === 0 || !isOpen || view !== 'explorar') return;
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
  }, [page, isOpen, id_perfil_artista, view]);

  const ejecutarEnvio = async (idBanda: string) => {
    setEnviandoId(idBanda);
    setConfirmarId(null);
    try {
      await enviarSolicitudUnionBanda(formData);
      setStatus({ type: 'success', msg: '¡Solicitud enviada correctamente!' });
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

  const handleAbandonar = async (idIntegrante: string) => {
    setEnviandoId(idIntegrante);
    try {
      await abandonarBandaAction(idIntegrante);
      setStatus({ type: 'success', msg: 'Has dejado la banda con éxito' });
      setMisBandas(prev => prev.filter(b => b.id_integrante !== idIntegrante));
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
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Status Overlay */}
        <AnimatePresence>
          {status && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900/95 backdrop-blur-sm p-6 text-center"
            >
              {status.type === 'success' ? 
                <FaCheckCircle className="text-green-500 text-6xl mb-4" /> : 
                <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
              }
              <h3 className="text-xl font-bold text-white">{status.msg}</h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FaMusic className="text-blue-500" /> Mis Bandas
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500 transition-colors"><FaTimes size={20} /></button>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
            <button 
              onClick={() => setView('explorar')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${view === 'explorar' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-neutral-500 hover:text-white'}`}
            >
              Buscar Nuevas
            </button>
            <button 
              onClick={() => setView('mis_bandas')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${view === 'mis_bandas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-neutral-500 hover:text-white'}`}
            >
              Mis Bandas
            </button>
          </div>
        </div>

        {/* Search Bar (Solo en explorar) */}
        {view === 'explorar' && (
          <div className="p-4 bg-neutral-800/20 border-b border-neutral-800/50">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input 
                type="text"
                placeholder="Nombre de la banda..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/40 outline-none transition-all placeholder:text-neutral-700"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Main List */}
        <div className="max-h-[450px] min-h-[350px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <FaSpinner className="animate-spin text-blue-500" size={30} />
              <span className="text-sm text-neutral-500 animate-pulse">Cargando datos...</span>
            </div>
          ) : view === 'explorar' ? (
            <>
              {bandas.map((banda, index) => {
                const isConfirming = confirmarId === banda.id_perfil;
                return (
                  <motion.div layout key={banda.id_perfil} ref={index === bandas.length - 1 ? lastElementRef : null}
                    className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl hover:border-neutral-700 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                        {banda.imagen_url ? <img src={banda.imagen_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600"><FaMusic size={20}/></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{banda.nombre}</h3>
                          {banda.categoria && <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold">{banda.categoria}</span>}
                        </div>
                        <p className="text-xs text-neutral-500">{banda.nombre_comuna || 'Ubicación oculta'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {!isConfirming ? (
                          <motion.button key="btn-inv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => {
                              setConfirmarId(banda.id_perfil);
                              setFormData(prev => ({ ...prev, id_banda: banda.id_perfil, nombre_banda: banda.nombre }));
                            }}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            Unirse
                          </motion.button>
                        ) : (
                          <motion.div key="conf" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex gap-1">
                            <button onClick={() => setConfirmarId(null)} className="p-2 text-neutral-500 hover:text-white"><FaTimes /></button>
                            <button onClick={() => ejecutarEnvio(banda.id_perfil)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                              {enviandoId === banda.id_perfil ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />} Confirmar
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
              {bandas.length === 0 && <div className="py-20 text-center text-neutral-600 italic">No se encontraron más bandas.</div>}
            </>
          ) : (
            <>
              {misBandas.map((item) => {
                const isConfirming = confirmarId === item.id_integrante;
                return (
                  <motion.div layout key={item.id_integrante}
                    className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden">
                        {item.imagen_url_banda ? <img src={item.imagen_url_banda} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600"><FaMusic size={20}/></div>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{item.nombre_banda}</h3>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1"><FaCalendarAlt /> {format(new Date(item.fecha_union), 'dd MMM yyyy')}</span>
                          <span className="text-[10px] text-blue-400 font-bold uppercase">{item.categoria || 'Integrante'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {!isConfirming ? (
                          <motion.button key="btn-out" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setConfirmarId(item.id_integrante)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                          >
                            <FaSignOutAlt /> Salir
                          </motion.button>
                        ) : (
                          <motion.div key="conf-out" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex gap-1">
                            <button onClick={() => setConfirmarId(null)} className="p-2 text-neutral-500 hover:text-white"><FaTimes /></button>
                            <button 
                              onClick={() => handleAbandonar(item.id_integrante)}
                              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-xl text-xs font-bold"
                            >
                              {enviandoId === item.id_integrante ? <FaSpinner className="animate-spin" /> : 'Confirmar'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
              {misBandas.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-600"><FaMusic size={24} /></div>
                  <p className="text-neutral-500 italic max-w-[200px]">Aún no eres parte de ninguna banda activa.</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}