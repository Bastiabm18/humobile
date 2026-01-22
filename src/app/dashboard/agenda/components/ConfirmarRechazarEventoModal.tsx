'use client';

import { useState } from 'react';
import { HiX, HiCheck, HiXCircle } from 'react-icons/hi';

interface ConfirmarRechazarEventoModalProps {
  eventoId: string;
  idParticipante: string;
  eleccion: boolean; // true = confirmar, false = rechazar
  isOpen: boolean;
  onClose: () => void;
  onAceptar: (eventoId: string, idParticipante: string) => Promise<void> | void;
}

export default function ConfirmarRechazarEventoModal({
  eventoId,
  idParticipante,
  eleccion,
  isOpen,
  onClose,
  onAceptar,
}: ConfirmarRechazarEventoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmar = async () => {
    try {
      setLoading(true);
      setError(null);
      await onAceptar(eventoId, idParticipante);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const textoAccion = eleccion ? 'Confirmar participación' : 'Rechazar participación';
  const descripcion = eleccion 
    ? '¿Estás seguro que deseas confirmar tu participación en este evento?'
    : '¿Estás seguro que deseas rechazar tu participación en este evento?';

  return (
    <div className="fixed inset-0 flex z-[50] items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${eleccion ? 'bg-green-900/60' : 'bg-red-900/60'}`}>
              {eleccion ? (
                <HiCheck className="text-green-300 text-2xl" />
              ) : (
                <HiXCircle className="text-red-300 text-2xl" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{textoAccion}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {eleccion ? 'Participación confirmada' : 'Participación rechazada'}
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
          <p className="text-gray-300 text-center mb-6">
            {descripcion}
          </p>

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
            onClick={handleConfirmar}
            disabled={loading}
            className={`flex-1 py-3 ${
              eleccion 
                ? 'bg-green-600/80 hover:bg-green-600' 
                : 'bg-red-600/80 hover:bg-red-600'
            } text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {loading ? (
              <span>Procesando...</span>
            ) : (
              <>
                {eleccion ? (
                  <>
                    <HiCheck size={18} />
                    Confirmar
                  </>
                ) : (
                  <>
                    <HiXCircle size={18} />
                    Rechazar
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}