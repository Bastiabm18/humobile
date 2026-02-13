'use client';

import { useState } from 'react';
import { HiX, HiTrash, HiExclamation } from 'react-icons/hi';

interface EliminarParticipacionEventoModalProps {
  eventId: string;
  perfilId: string;
  isOpen: boolean;
  onClose: () => void;
  onAceptar: (eventId: string, perfilId: string) => Promise<void> | void;
}

export default function EliminarParticipacionEventoModal({
  eventId,
  perfilId,
  isOpen,
  onClose,
  onAceptar,
}: EliminarParticipacionEventoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEliminar = async () => {
    try {
      setLoading(true);
      setError(null);
      await onAceptar(eventId, perfilId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la participación');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex z-[50] items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-900/60">
              <HiTrash className="text-red-300 text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Eliminar Participación</h2>
              <p className="text-sm text-gray-400 mt-1">
                Confirmar eliminación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-yellow-900/30">
              <HiExclamation className="text-yellow-400 text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">¿Estás seguro?</h3>
              <p className="text-gray-300">
                Esta acción eliminará tu participación de este evento. 
                Esta operación no se puede deshacer.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-700 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleEliminar}
            disabled={loading}
            className="flex-1 py-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Eliminando...</span>
            ) : (
              <>
                <HiTrash size={18} />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}