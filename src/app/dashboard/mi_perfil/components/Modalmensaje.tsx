// app/components/ModalMensaje.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ModalMensajeProps {
  isOpen: boolean;
  onClose: () => void;
  mensaje: string;
  tipo?: 'exito' | 'error' | 'info';
}

export default function ModalMensaje({ 
  isOpen, 
  onClose, 
  mensaje, 
  tipo = 'info' 
}: ModalMensajeProps) {
  // Configuración según el tipo de mensaje
  const config = {
    exito: {
      color: 'text-green-400',
      bgIcon: 'bg-green-500/10',
      border: 'border-green-500/30',
      icon: '✓'
    },
    error: {
      color: 'text-red-400',
      bgIcon: 'bg-red-500/10',
      border: 'border-red-500/30',
      icon: '✗'
    },
    info: {
      color: 'text-blue-400',
      bgIcon: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      icon: 'ℹ'
    }
  };

  const currentConfig = config[tipo];

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
              <div className={`
                bg-neutral-900
                border ${currentConfig.border}
                rounded-2xl
                overflow-hidden
                shadow-2xl
              `}>
                {/* Contenido */}
                <div className="p-8 text-center">
                  {/* Icono */}
                  <div className={`
                    w-16 h-16 mx-auto
                    ${currentConfig.bgIcon}
                    border ${currentConfig.border}
                    rounded-full
                    flex items-center justify-center
                    mb-6
                  `}>
                    <span className={`
                      text-2xl font-bold
                      ${currentConfig.color}
                    `}>
                      {currentConfig.icon}
                    </span>
                  </div>

                  {/* Mensaje */}
                  <p className={`
                    text-lg font-medium
                    ${currentConfig.color}
                    mb-8
                  `}>
                    {mensaje}
                  </p>

                  {/* Botón Aceptar */}
                  <button
                    onClick={onClose}
                    className={`
                      px-8 py-3
                      ${tipo === 'exito' ? 'bg-green-600 hover:bg-green-700' : 
                        tipo === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                        'bg-blue-600 hover:bg-blue-700'}
                      text-white font-semibold
                      rounded-lg
                      transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
                      ${tipo === 'exito' ? 'focus:ring-green-500' : 
                        tipo === 'error' ? 'focus:ring-red-500' : 
                        'focus:ring-blue-500'}
                    `}
                  >
                    Aceptar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}