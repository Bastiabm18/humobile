'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloudDownloadOutline, IoShareOutline, IoCloseOutline, IoAddSquareOutline } from 'react-icons/io5';

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Detectar si ya es PWA instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!isStandalone) {
      const handler = (e: Event) => {
        e.preventDefault();
        setPrompt(e);
        setShowPrompt(true);
      };
      
      window.addEventListener('beforeinstallprompt', handler);
      
      if (isIosDevice) {
        // En iOS mostramos el aviso tras 3 segundos
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }

      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setShowPrompt(false);
    }
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100]"
        >
          {/* Fondo neutral con transparencia y desenfoque (Glassmorphism) */}
          <div className="relative overflow-hidden bg-neutral-800/70 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl text-white">
            
            {/* Gradientes de fondo sutiles */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600/20 blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-600/20 blur-[60px] pointer-events-none" />

            <button 
              onClick={() => setShowPrompt(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <IoCloseOutline size={24} />
            </button>

            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <IoCloudDownloadOutline size={28} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">Instalar App</h3>
                <p className="text-neutral-300 text-sm">Mejor experiencia y acceso rápido.</p>
              </div>
            </div>

            <div className="mt-6">
              {isIOS ? (
                <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                  <p className="text-sm text-neutral-200 flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      1. Toca el botón compartir <IoShareOutline className="text-blue-400" size={20} />
                    </span>
                    <span className="flex items-center gap-2">
                      2. Selecciona <span className="font-bold text-white uppercase text-xs">Añadir al inicio</span> <IoAddSquareOutline size={20}/>
                    </span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
                >
                  Instalar ahora
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}