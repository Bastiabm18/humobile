// app/perfil/components/SeleccionPerfilInvitar.tsx
'use client';

import { useState } from 'react';
import { HiX } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { usePermisos } from '@/app/hooks/usePermisos';
import { Profile } from '@/types/profile';

interface SeleccionPerfilInvitarProps {
  open: boolean;
  onClose: () => void;
  perfiles: Profile[];
  onSeleccionar: (perfil: Profile) => void;
}

export default function SeleccionPerfilInvitar({ 
  open, 
  onClose, 
  perfiles, 
  onSeleccionar 
}: SeleccionPerfilInvitarProps) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const { activo } = usePermisos({});
  const tienePermiso = activo('AGREGAR_PARTICIPANTES');

  const handleGuardar = () => {
    if (!seleccionado) return;
    
    const perfil = perfiles.find(p => p.id === seleccionado);
    if (perfil) {
      onSeleccionar(perfil);
    }
  };

  const handleCancelar = () => {
    setSeleccionado(null);
    onClose();
  };

  const handleCerrar = () => {
    setSeleccionado(null);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-lg max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-700">
          <h2 className="text-lg font-bold text-white">Seleccionar perfil</h2>
          <button 
            onClick={handleCerrar} 
            className="text-gray-400 hover:text-white transition"
          >
            <HiX size={24} />
          </button>
        </div>

        {/* Sin permisos */}
        {!tienePermiso ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-yellow-400 font-medium mb-2">Sin permisos</p>
              <p className="text-sm text-gray-400">
                Tu plan no permite invitar a eventos
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Lista de perfiles */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {perfiles.map((perfil) => (
                <button
                  key={perfil.id}
                  onClick={() => setSeleccionado(perfil.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all ${
                    seleccionado === perfil.id
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-neutral-700/30 border-neutral-600 hover:border-neutral-500'
                  }`}
                >
                  {/* Imagen */}
                  <div className="w-12 h-12 rounded-full bg-neutral-600 overflow-hidden flex-shrink-0">
                    {perfil.imagen_url ? (
                      <img 
                        src={perfil.imagen_url} 
                        alt={perfil.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                        {perfil.nombre?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium text-sm">{perfil.nombre}</p>
                    <p className="text-gray-400 text-xs capitalize">{perfil.tipo}</p>
                  </div>

                  {/* Indicador seleccionado */}
                  {seleccionado === perfil.id && (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-neutral-700 p-4 flex gap-3">
              <button 
                onClick={handleCancelar}
                className="flex-1 py-2.5 bg-neutral-600 hover:bg-neutral-500 text-white font-medium rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleGuardar}
                disabled={!seleccionado}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/30 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                >
                Guardar
                </button>
            </div>
            </>
            )}
        </motion.div>
        </div>
    );
}