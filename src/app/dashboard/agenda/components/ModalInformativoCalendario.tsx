'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiX, 
  HiCheckCircle, 
  HiLockClosed, 
  HiInformationCircle,
  HiClock,
  HiUserGroup,
  HiCalendar
} from 'react-icons/hi';

interface ModalInformativoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalInformativoCalendario({ isOpen, onClose }: ModalInformativoProps) {
  
  const itemsLeyenda = [
    {
      titulo: 'Confirmado Personal',
      descripcion: 'Eventos donde participas y ya han sido confirmados.',
      colorClase: 'bg-sky-700/50 border-sky-500',
      icono: HiCheckCircle,
      textoIcono: 'text-sky-400'
    },
    {
      titulo: 'Confirmado Banda',
      description: 'Eventos grupales de la banda con asistencia confirmada.',
      colorClase: 'bg-green-700/50 border-green-500',
      icono: HiUserGroup,
      textoIcono: 'text-green-400'
    },
    {
      titulo: 'Pendiente / Por Confirmar',
      description: 'Eventos agendados que aún no tienen respuesta definitiva.',
      colorClase: 'bg-orange-600/50 border-orange-500',
      icono: HiClock,
      textoIcono: 'text-orange-400'
    },
    {
      titulo: 'Agenda de Integrante',
      description: 'Bloqueos informativos de otros miembros (Solo vista Banda).',
      colorClase: 'bg-gray-700/50 border-gray-400',
      icono: HiCalendar,
      textoIcono: 'text-gray-400'
    },
    {
      titulo: 'Horario Bloqueado',
      description: 'Franjas horarias marcadas como no disponibles.',
      colorClase: 'bg-red-800/50 border-red-500',
      icono: HiLockClosed,
      textoIcono: 'text-red-400'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Fondo oscuro con Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Contenedor del Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-2 text-white font-semibold">
                <HiInformationCircle className="text-sky-500 text-xl" />
                <span>Leyenda de Colores</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 transition-colors"
              >
                <HiX size={20} />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3">
              {itemsLeyenda.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/30 border border-neutral-800/50"
                >
                  {/* El "Badge" simulado */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-l-4 shrink-0 ${item.colorClase}`}>
                    <item.icono className={`text-xl ${item.textoIcono}`} />
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-neutral-200">
                      {item.titulo}
                    </span>
                    <span className="text-xs text-neutral-500 leading-tight">
                      {item.description || item.descripcion}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-neutral-900/80">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-neutral-100 hover:bg-white text-neutral-900 font-bold rounded-xl transition-all active:scale-[0.98]"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}