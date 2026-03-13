'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUserPlus, FaUsers, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaUserMinus, FaMapMarkerAlt } from 'react-icons/fa';
import { 
  enviarSolicitudUnionBanda, //
  getArtistasPaginados,      // 
  getIntegrantesBanda,       // 
  eliminarIntegranteAction // 
} from '../actions/actions';
import { InvitacionData } from '@/types/profile';
import { format, setDate } from 'date-fns';
import { FaXmark } from 'react-icons/fa6';

interface Props {
  id_perfil_banda: string;
  nombre_banda: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BuscarIntegrantesBandaModal({ id_perfil_banda, nombre_banda, isOpen, onClose }: Props) {
  const [view, setView] = useState<'buscar' | 'actuales'>('buscar');
  const [artistas, setArtistas] = useState<any[]>([]);
  const [integrantes, setIntegrantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [enviandoId, setEnviandoId] = useState<string | null>(null);
  const [confirmarId, setConfirmarId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);

  // --- Lógica de Invitación ---

  const handleEliminar = async (idIntegrante: string) => {
  setEnviandoId(idIntegrante); // Feedback visual de carga
  try {
    await eliminarIntegranteAction(idIntegrante); // Llama al server action
    setIntegrantes(prev => prev.filter(i => i.id_integrante !== idIntegrante)); // Borra del estado local
    setStatus({ type: 'success', msg: 'Integrante eliminado.' });
    setConfirmarId(null);
  } catch (e) {
    setStatus({ type: 'error', msg: 'Error al eliminar.' });
  } finally {
    setEnviandoId(null);
  }
};
  const handleInvitar = async (artista: any) => {
    setEnviandoId(artista.id_perfil);
    try {
      const invitacion: InvitacionData = {
        id_perfil: artista.id_perfil, // La banda es la que invita
        id_banda: id_perfil_banda,
        fecha_invitacion: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        fecha_vencimiento: format(setDate(new Date(), 14), "yyyy-MM-dd'T'HH:mm"),
        nombre_banda: nombre_banda,
        invitacion: '',
        descripcion: `La banda ${nombre_banda} quiere que seas parte de sus integrantes.`,
        tabla_origen: 'invitacion' // Cambiamos el origen
      };

      await enviarSolicitudUnionBanda(invitacion);
      setStatus({ type: 'success', msg: `¡Invitación enviada a ${artista.nombre}!` });
      setArtistas(prev => prev.filter(a => a.id_perfil !== artista.id_perfil));
      setTimeout(() => setStatus(null), 2000);
    } catch (e) {
      setStatus({ type: 'error', msg: 'No se pudo enviar la invitación.' });
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setEnviandoId(null);
      setConfirmarId(null);
    }
  };

  // --- Carga de Datos ---
  const loadArtistas = useCallback(async (reset = false) => {
    if (reset) { setLoading(true); setPage(0); }
    else setLoadingMore(true);

    try {
      const p = reset ? 0 : page;
      const { data, hasMore: more } = await getArtistasPaginados(id_perfil_banda, p, 10, busqueda);
      setArtistas(prev => reset ? (data || []) : [...prev, ...(data || [])]);
      setHasMore(more);
    } catch (e) { console.error(e); }
    setLoading(false);
    setLoadingMore(false);
  }, [id_perfil_banda, busqueda, page]);

  useEffect(() => {
    if (isOpen && view === 'buscar') {
      const timer = setTimeout(() => loadArtistas(true), 300);
      return () => clearTimeout(timer);
    }
  }, [busqueda, isOpen, view]);

  useEffect(() => {
    if (isOpen && view === 'actuales') {
      const fetchIntegrantes = async () => {
        setLoading(true);
        try {
          const { data } = await getIntegrantesBanda(id_perfil_banda);
          setIntegrantes(data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
      };
      fetchIntegrantes();
    }
  }, [isOpen, view, id_perfil_banda]);

  // Infinite Scroll
  const lastElementRef = useCallback((node: any) => {
    if (loading || loadingMore || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setPage(p => p + 1);
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Status Overlay */}
        <AnimatePresence>
          {status && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900/95 backdrop-blur-sm p-6 text-center"
            >
              {status.type === 'success' ? <FaCheckCircle className="text-green-500 text-6xl mb-4" /> : <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />}
              <h3 className="text-xl font-bold text-white">{status.msg}</h3>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 border-b border-neutral-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUserPlus className="text-blue-500" /> Reclutar Integrantes
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-500"><FaTimes size={20} /></button>
          </div>

          <div className="flex p-1 bg-neutral-950 rounded-2xl border border-neutral-800">
            <button onClick={() => setView('buscar')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${view === 'buscar' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500'}`}>Buscar Artistas</button>
            <button onClick={() => setView('actuales')} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${view === 'actuales' ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-500'}`}>Integrantes</button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[450px] min-h-[400px] overflow-y-auto p-4 custom-scrollbar">
          {view === 'buscar' && (
            <div className="mb-4 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input type="text" placeholder="Ej: Guitarrista, Juan Perez..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-blue-500/40 outline-none"
              />
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center"><FaSpinner className="animate-spin text-blue-500 mx-auto" size={30} /></div>
          ) : view === 'buscar' ? (
            <div className="space-y-3">
              {artistas.map((artista, index) => {
                const isConfirming = confirmarId === artista.id_perfil;
                return (
                  <motion.div layout key={artista.id_perfil} ref={index === artistas.length - 1 ? lastElementRef : null}
                    className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800/60 rounded-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <img src={artista.imagen_url || '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png'} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-white">{artista.nombre}</h4>
                        <p className="text-[10px] text-blue-400 font-bold uppercase">{artista.categoria}</p>
                        <p className="text-[10px] text-neutral-500 flex items-center gap-1"><FaMapMarkerAlt /></p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <AnimatePresence mode="wait">
                        {!isConfirming ? (
                          <button onClick={() => setConfirmarId(artista.id_perfil)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold">Invitar</button>
                        ) : (
                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex gap-1">
                            <button onClick={() => setConfirmarId(null)} className="p-2 text-neutral-500"><FaTimes /></button>
                            <button onClick={() => handleInvitar(artista)} className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold">
                              {enviandoId === artista.id_perfil ? <FaSpinner className="animate-spin" /> : 'Confirmar'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {integrantes.map((miembro) => (
                <div key={miembro.id_integrante} className="flex items-center justify-between p-4 bg-neutral-800/40 border border-neutral-800 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <img src={miembro.imagen_url_artista || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{miembro.nombre_artista}</h4>
                      <p className="text-[10px] text-neutral-500">{miembro.rol}</p>
                    </div>
                  </div>
                  <button className="text-red-300/70 bg-red-600/70 hover:text-red-400 py-2 px-3 rounded-2xl flex flex-row gap-2 transition-colors"><FaXmark size={16} /> Eliminar Integrante</button>
                </div>
              ))}
              {integrantes.length === 0 && <p className="text-center py-10 text-neutral-600 italic">La banda no tiene integrantes registrados.</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}