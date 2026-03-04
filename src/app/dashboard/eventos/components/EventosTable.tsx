'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FaCheck, FaEye, FaPlus, FaLock, FaSort, 
  FaSortUp, FaSortDown, FaMapMarkerAlt,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';
import { MdOutlineBlock } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { EventoCalendario, Profile } from '@/types/profile';
import { getEventosByPerfilParticipacion, aceptarSolicitud, rechazarSolicitud, eliminarEvento } from '../actions/actions';
import EventModal from '../../agenda/components/EventModal';
import RespuestaModal from './RespuestaModal';

export default function EventosTable({ profile, onCreateEvent, onBlockDate }: { profile: Profile, onCreateEvent: () => void, onBlockDate: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<'inicio' | 'titulo'>('inicio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedEvent, setSelectedEvent] = useState<{id:string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<{type: 'accept'|'delete'|'reject'|null, event: any | null}>({ type: null, event: null });
  const [resModal, setResModal] = useState({ open: false, type: 'success' as 'success'|'error', title: '', msg: '' });

  useEffect(() => { 
    loadEvents(); 
    setCurrentPage(1); 
  }, [profile.id, filter]);

  const loadEvents = async () => {
    setLoading(true);
    const estadoQuery = filter === 'todos' ? undefined : filter;
    const data = await getEventosByPerfilParticipacion(profile.id, estadoQuery as any, new Date());
    setEvents(data || []);
    setLoading(false);
  };

  console.log(events)
  const handleAction = async () => {
    const { type, event } = confirmState;
    if (!type || !event) return;
    const params = { id_evento: event.id, motivo: 'Acción de usuario', id_perfil: profile.id };
    const actions: any = { accept: aceptarSolicitud, reject: rechazarSolicitud, delete: eliminarEvento };
    const res = await actions[type](params);

    setConfirmState({ type: null, event: null });
    setResModal({ open: true, type: res?.success ? 'success' : 'error', title: res?.success ? 'Éxito' : 'Error', msg: res?.message || 'Proceso terminado' });
    if (res?.success) loadEvents();
  };

  const processed = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const aV = sortField === 'inicio' ? new Date(a.inicio).getTime() : a.titulo.toLowerCase();
      const bV = sortField === 'inicio' ? new Date(b.inicio).getTime() : b.titulo.toLowerCase();
      return sortDirection === 'asc' ? (aV > bV ? 1 : -1) : (aV < bV ? 1 : -1);
    });
    const start = (currentPage - 1) * itemsPerPage;
    return {
      data: sorted.slice(start, start + itemsPerPage),
      total: sorted.length,
      totalPages: Math.ceil(sorted.length / itemsPerPage)
    };
  }, [events, sortField, sortDirection, currentPage]);

  // Función para determinar el color del badge basado en el ESTADO REAL del evento
  const getStatusStyle = (ev: any) => {
    if (ev.es_bloqueo) return 'border-red-500/50 text-red-500 bg-red-500/5';
    switch (ev.estado?.toLowerCase()) {
      case 'confirmado': return 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5';
      case 'pendiente': return 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5';
      case 'rechazado': return 'border-neutral-700 text-neutral-500';
      default: return 'border-neutral-700 text-neutral-400';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter italic">Mis eventos</h1>
            <p className="text-[10px] text-neutral-500 font-bold tracking-[0.3em] uppercase">{processed.total} Eventos Totales</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <button onClick={onBlockDate} className="flex-1 sm:flex-none px-4 py-2 bg-neutral-900 border border-neutral-800 text-[10px] font-black rounded uppercase hover:border-red-500">Bloquear</button>
            <button onClick={onCreateEvent} className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 text-white text-[10px] font-black rounded uppercase">Nuevo Evento</button>
          </div>
        </header>

        {/* FILTROS */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-2 no-scrollbar">
          {['todos', 'pendiente', 'confirmado', 'rechazado'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`whitespace-nowrap px-4 py-2 rounded text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-neutral-100 text-black' : 'bg-neutral-900 text-neutral-500 hover:text-white'}`}>{f}</button>
          ))}
        </div>

        {/* VISTA MÓVIL (CARDS) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {processed.data.map((ev) => (
            <div key={ev.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-neutral-500">{format(new Date(ev.inicio), "dd/MM/yyyy HH:mm")}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase ${getStatusStyle(ev)}`}>
                  {ev.es_bloqueo ? 'BLOQUEO' : (ev.estado || 'EVENTO')}
                </span>
              </div>
              <h3 className="text-white font-bold uppercase text-sm mb-1">{ev.titulo}</h3>
              <p className="text-neutral-500 text-[10px] mb-4 flex items-center gap-1"><FaMapMarkerAlt/> {ev.nombre_lugar || 'sin Ubicación'}</p>
              
              <div className="flex gap-2 border-t border-neutral-800/50 pt-3">
                <button onClick={() => { setSelectedEvent({id:ev.id}); setIsModalOpen(true); }} className="flex-1 py-2 bg-neutral-800 rounded text-[9px] font-black uppercase">Detalles</button>
                {ev.estado === 'pendiente' && !ev.es_bloqueo && (
                  <>
                    <button onClick={() => setConfirmState({type:'accept', event:ev})} className="flex-1 py-2 bg-emerald-600/20 text-emerald-500 rounded text-[9px] font-black">OK</button>
                    <button onClick={() => setConfirmState({type:'reject', event:ev})} className="flex-1 py-2 bg-yellow-600/20 text-yellow-500 rounded text-[9px] font-black">NO</button>
                  </>
                )}
                <button onClick={() => setConfirmState({type:'delete', event:ev})} className="p-2 text-red-500 bg-red-500/10 rounded"><FaTrashCan size={14}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* VISTA DESKTOP (TABLA) */}
        <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-neutral-800/40 border-b border-neutral-800 text-[10px] font-black uppercase text-neutral-500">
              <tr>
                <th className="px-6 py-4 cursor-pointer" onClick={() => { setSortField('inicio'); setSortDirection(d => d === 'asc' ? 'desc' : 'asc'); }}>FECHA</th>
                <th className="px-6 py-4">EVENTO</th>
                <th className="px-6 py-4">ESTADO</th>
                <th className="px-6 py-4 text-right">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {processed.data.map((ev) => (
                <tr key={ev.id} className="group hover:bg-white/[0.01]">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-white uppercase">{format(new Date(ev.inicio), "dd MMM, yyyy", { locale: es })}</div>
                    <div className="text-[10px] text-neutral-200 font-mono">{format(new Date(ev.inicio), "HH:mm")}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-2">
                      {ev.titulo} {ev.es_bloqueo && <FaLock className="text-red-500" size={8}/>}
                    </div>
                    <div className="text-[9px] text-neutral-300 uppercase tracking-tighter truncate max-w-[200px]">{ev.nombre_lugar || 'LUGAR NO DEFINIDO'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${getStatusStyle(ev)}`}>
                      {ev.es_bloqueo ? 'BLOQUEO' : (ev.estado_participacion || 'EVENTO')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1  transition-all">
                      <button onClick={() => { setSelectedEvent({id:ev.id}); setIsModalOpen(true); }} className="p-2 bg-neutral-800 hover:text-white rounded"><FaEye size={12}/></button>
                      {ev.estado_participacion === 'pendiente' && (
                         <button onClick={() => setConfirmState({type:'accept', event:ev})} className="p-2 bg-emerald-500/20 text-emerald-500 rounded"><FaCheck size={12}/></button>
                      )}
                      <button onClick={() => setConfirmState({type:'delete', event:ev})} className="p-2 bg-red-500/20 text-red-500 rounded"><FaTrashCan size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        <div className="mt-4 flex items-center justify-between bg-neutral-900/50 p-4 rounded-xl border border-neutral-800">
          <span className="text-[10px] font-black text-neutral-600 uppercase">Pág {currentPage} / {processed.totalPages || 1}</span>
          <div className="flex gap-1">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-neutral-800 rounded disabled:opacity-20"><FaChevronLeft size={10}/></button>
            <button disabled={currentPage >= processed.totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-neutral-800 rounded disabled:opacity-20"><FaChevronRight size={10}/></button>
          </div>
        </div>
      </div>

      {/* MODAL CONFIRM */}
      <AnimatePresence>
        {confirmState.type && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl">
              <p className="text-white font-black uppercase text-sm mb-6">¿Confirmar Acción?</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setConfirmState({type:null, event:null})} className="py-3 text-[10px] font-black uppercase text-neutral-500">Volver</button>
                <button onClick={handleAction} className={`py-3 text-[10px] font-black uppercase text-white rounded-lg ${confirmState.type === 'accept' ? 'bg-emerald-600' : 'bg-red-600'}`}>Aceptar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <EventModal event={selectedEvent} isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} profile={profile} />
      <RespuestaModal isOpen={resModal.open} type={resModal.type} title={resModal.title} message={resModal.msg} onClose={() => setResModal({...resModal, open: false})} />
    </div>
  );
}