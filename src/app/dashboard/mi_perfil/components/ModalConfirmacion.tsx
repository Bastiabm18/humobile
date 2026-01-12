// app/components/ModalConfirmacion.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiExclamation } from 'react-icons/hi';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  titulo = 'Confirmar acción',
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar'
}: ModalConfirmacionProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="
                bg-neutral-900
                border border-yellow-500/30
                rounded-2xl
                overflow-hidden
                shadow-2xl
              ">
                {/* Contenido */}
                <div className="p-8">
                  {/* Icono y título */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-4">
                      <HiExclamation className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {titulo}
                    </h3>
                    <p className="text-neutral-300">
                      {mensaje}
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-4">
                    <button
                      onClick={onClose}
                      className="
                        flex-1
                        px-6 py-3
                        bg-neutral-800
                        hover:bg-neutral-700
                        border border-neutral-700
                        hover:border-neutral-600
                        text-neutral-300 font-medium
                        rounded-lg
                        transition-all duration-200
                      "
                    >
                      {textoCancelar}
                    </button>
                    <button
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      className="
                        flex-1
                        px-6 py-3
                        bg-red-600
                        hover:bg-red-700
                        text-white font-medium
                        rounded-lg
                        transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-900
                      "
                    >
                      {textoConfirmar}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}