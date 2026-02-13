'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaCheckCircle, FaClock, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { getEventoByIdV2, getParticipacionEventoById } from '../actions/actions'; // Ajusta la ruta a tu action
import { PerfilParticipanteEvento } from '@/types/profile';
import { FaPhone } from 'react-icons/fa6';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  eventoId: string;
  perfilId: string; 
  eventoTitulo?: string;
}

export default function ParticipacionArtistasBandaModal({ isOpen, onClose, eventoId, perfilId, eventoTitulo }: Props) {
  const [loading, setLoading] = useState(true);
  const [participantes, setParticipantes] = useState<PerfilParticipanteEvento[]>([]);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    if (isOpen && eventoId) {
      const loadData = async () => {
        setLoading(true);
        try {
          const data = await getParticipacionEventoById(eventoId, perfilId);
          console.log(data);
          if (data) {
            setParticipantes(data as any);
            setTitulo(eventoTitulo || '');
          }
        } catch (err) {
          console.error("Error al cargar estados:", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [isOpen, eventoId, perfilId]);

  console.log(participantes);
  if (!isOpen) return null;

  const calcularPorcentajeAprobacion = (participantes: PerfilParticipanteEvento[]) => {
  if (participantes.length === 0) return 0;
  const confirmados = participantes.filter(p => p.estado_participacion === 'confirmado').length;
  return Math.round((confirmados / participantes.length) * 100);
};
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex z-[60] items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FaUsers className="text-sky-400" />
              <h2 className="text-white font-bold">Estados de Participación</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <HiX className="text-2xl" />
            </button>
          </div>

          <div className="p-4">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold">Evento: {titulo}</p>

            <div className="mb-4">
  <div className="flex flex-col space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">Confirmación del evento</span>
      <span className="text-sm font-semibold text-white">
        {calcularPorcentajeAprobacion(participantes)}%
      </span>
    </div>
    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-green-500 to-green-900 transition-all duration-500 rounded-full"
        style={{ width: `${calcularPorcentajeAprobacion(participantes)}%` }}
      />
    </div>
    <div className="flex justify-between text-xs text-gray-500">
      <span>
        {participantes.filter(p => p.estado_participacion === 'confirmado').length} de {participantes.length} confirmados
      </span>
      <span className="text-yellow-400 font-medium">
        {participantes.filter(p => p.estado_participacion === 'pendiente').length} pendientes
      </span>
    </div>
  </div>
</div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-10">
                  <FaSpinner className="animate-spin text-sky-400 text-2xl" />
                </div>
              ) : participantes.length > 0 ? (
                participantes.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-1 bg-neutral-800/40 rounded-xl border border-neutral-700/50">
                    <div className="flex flex-row items w-full justify-between p-3">
                         <span className="text-gray-200 text-sm font-medium">{p.perfil_nombre}</span>
                         <BadgeEstado estado={ p.estado_participacion} />
                    </div>
                       <div className="flex flex-row items-center gap-3 w-full p-3">
                        <FaPhone size={24} className='bg-green-600/50 text-green-300/50 border-green-800/50 p-1 rounded-full '/>
                    <a>
                         {p.perfil_telefono}</a>
                        </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4 text-sm">No hay participantes registrados.</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-neutral-950/50 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm hover:bg-neutral-700 transition-colors">
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function BadgeEstado({ estado }: { estado: string }) {
  const config: any = {
    confirmado: { icon: <FaCheckCircle />, color: 'text-green-400 bg-green-900/20 border-green-800/50' },
    rechazado: { icon: <FaTimesCircle />, color: 'text-red-400 bg-red-900/20 border-red-800/50' },
    pendiente: { icon: <FaClock />, color: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/50' }
  };
  const c = config[estado] || config.pendiente;
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${c.color}`}>
      {c.icon} {estado}
    </span>
  );
}

