'use client';
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Detectar si ya está instalada (modo standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (!isStandalone) {
      const handler = (e: Event) => {
        e.preventDefault();
        setPrompt(e);
        setShowPrompt(true);
      };
      window.addEventListener('beforeinstallprompt', handler);
      
      // En iOS, simplemente mostramos el aviso después de unos segundos
      if (isIosDevice) {
        setTimeout(() => setShowPrompt(true), 3000);
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

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 z-[100] bg-white text-black p-4 rounded-2xl shadow-2xl border-2 border-blue-500 flex flex-col gap-3">
      <h3 className="font-bold">¡Instala nuestra App!</h3>
      
      {isIOS ? (
        <p className="text-sm">
          En iOS: Toca el botón <strong>"Compartir"</strong> <span className="text-blue-500">↑</span> y luego <strong>"Añadir a la pantalla de inicio"</strong>.
        </p>
      ) : (
        <p className="text-sm">Instala la aplicación para acceder más rápido y usarla sin conexión.</p>
      )}

      <div className="flex gap-2">
        {!isIOS && (
          <button onClick={handleInstall} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
            Instalar ahora
          </button>
        )}
        <button onClick={() => setShowPrompt(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">
          Cerrar
        </button>
      </div>
    </div>
  );
}