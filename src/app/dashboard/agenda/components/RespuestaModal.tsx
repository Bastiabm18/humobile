// components/RespuestaModal.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoThumbsUp } from 'react-icons/io5';

interface RespuestaModalProps {
  isOpen: boolean;
  mensaje: string;
  esExito?: boolean;
  onClose: () => void;
  onAceptar?: () => void;
}

export default function RespuestaModal({
  isOpen,
  mensaje,
  esExito = true,
  onClose,
  onAceptar
}: RespuestaModalProps) {
  
  const handleAceptar = () => {
    if (onAceptar) {
      onAceptar();
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-neutral-800 rounded-xl shadow-2xl"
          >
            {/* Botón cerrar (X) */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <IoClose className="w-6 h-6 text-neutral-500" />
            </button>

            {/* Contenido */}
            <div className="p-6 pt-10">
              {/* Icono indicador (opcional) */}
              {esExito ? (
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                 <IoThumbsUp size={28} className='text-sky-700'/>
                </div>
              ) : (
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <IoClose size={28} className='text-red-700'/>
                </div>
              )}

              {/* Mensaje */}
              <p className="text-center text-neutral-200 text-lg mb-6">
                {mensaje}
              </p>

              {/* Botón aceptar */}
              <div className="flex justify-center">
                <button
                  onClick={handleAceptar}
                  className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                    esExito 
                      ? 'bg-sky-600 hover:bg-sky-700' 
                      : 'bg-red-700 hover:bg-red-800'
                  }`}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}