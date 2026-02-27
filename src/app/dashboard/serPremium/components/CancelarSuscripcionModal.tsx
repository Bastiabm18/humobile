'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaTimes, FaTrashAlt } from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function CancelarSuscripcionModal({ isOpen, onClose, onConfirm, loading }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay semitransparente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Botón cerrar */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
            >
              <FaTimes size={18} />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Icono de Alerta */}
              <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center rounded-full mb-6 border border-red-500/20">
                <FaExclamationTriangle className="text-red-500 text-3xl" />
              </div>

              <h3 className="text-2xl font-black text-white mb-4">
                ¿Confirmas la cancelación?
              </h3>

              <div className="space-y-4 mb-8">
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Estás a punto de cancelar tu suscripción premium. Tu cuenta volverá al plan gratuito al finalizar el ciclo actual.
                </p>
                
                <div className="bg-neutral-800 border-l-4 border-red-500 p-4 text-left">
                  <p className="text-red-500 font-bold text-xs uppercase tracking-widest mb-1">Aviso importante</p>
                  <p className="text-neutral-300 text-[11px] leading-tight font-medium">
                    Esta acción no se puede deshacer. No existe reembolso parcial ni total del dinero pagado por la membresía.
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col w-full gap-3">
                <button
                  disabled={loading}
                  onClick={onConfirm}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaTrashAlt /> Confirmar Cancelación
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-2xl transition-all"
                >
                  Mantener mi Plan
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}