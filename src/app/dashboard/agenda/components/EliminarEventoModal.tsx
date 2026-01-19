// components/calendar/EliminarEventoModal.tsx
'use client';

import { useState } from 'react';
import { FaTrashAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaUserLock } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { deleteEvent } from '../actions/actions';

interface EliminarEventoModalProps {
  eventId: string;
  eventTitle: string;
  perfilId: string; // ← NUEVO: ID del perfil que intenta eliminar
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EliminarEventoModal({ 
  eventId, 
  eventTitle, 
  perfilId, // ← NUEVO
  isOpen, 
  onClose,
  onSuccess 
}: EliminarEventoModalProps) {
  console.log(eventId)
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    isPermissionError?: boolean;
  } | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Pasar tanto el eventId como el perfilId
      const deleteResult = await deleteEvent(eventId, perfilId);
      
      if (deleteResult.success) {
        setResult({
          success: true,
          message: 'Evento eliminado exitosamente'
        });
        
        // Esperar un momento antes de cerrar
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        // Verificar si es error de permisos
        const isPermissionError = deleteResult.error?.includes('permisos') || 
                                 deleteResult.error?.includes('creador');
        
        setResult({
          success: false,
          message: deleteResult.error || 'Error al eliminar el evento',
          isPermissionError
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || 'Error inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setTimeout(() => setResult(null), 300); // Reset después de cerrar
    }
  };

  return (
    <div className="fixed inset-0 flex z-50 items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md border border-neutral-700">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${result?.isPermissionError ? 'bg-yellow-900/80' : 'bg-red-900/80'}`}>
              {result?.isPermissionError ? (
                <FaUserLock className="text-yellow-300 text-xl" />
              ) : (
                <FaTrashAlt className="text-red-300 text-xl" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {result?.isPermissionError ? 'Permisos Insuficientes' : 'Eliminar Evento'}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {result?.isPermissionError ? 'Verificación de permisos' : 'Confirmar eliminación'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {!result ? (
            <>
              {/* Advertencia */}
              <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-800/50 rounded-lg mb-6">
                <FaExclamationTriangle className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">¡Atención!</h3>
                  <p className="text-red-300 text-sm">
                    Esta acción eliminará permanentemente el evento y no se podrá deshacer.
                    Solo el creador del evento puede eliminarlo.
                  </p>
                </div>
              </div>

              {/* Información del evento */}
              <div className="mb-6">
                <p className="text-gray-300 mb-2">
                  ¿Estás seguro de que deseas eliminar el siguiente evento?
                </p>
                <div className="bg-neutral-800/50 p-4 rounded-lg border border-neutral-700">
                  <p className="text-white font-medium truncate">{eventTitle}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <FaUserLock className="text-xs" />
                      <span>ID Perfil: </span>
                      <span className="font-mono text-gray-300">{perfilId.substring(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>• ID Evento: </span>
                      <span className="font-mono text-gray-300">{eventId.substring(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consecuencias */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Esto eliminará:</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    El evento de la base de datos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Todas las participaciones asociadas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    Las referencias en el calendario
                  </li>
                </ul>
              </div>

              {/* Nota sobre permisos */}
              <div className="text-sm text-gray-400 italic border-l-4 border-yellow-600 pl-3 py-2 bg-yellow-900/10">
                <p>
                  <span className="font-medium text-yellow-300">Nota:</span> Solo el creador original del evento puede eliminarlo. Esta verificación se realizará al confirmar.
                </p>
              </div>
            </>
          ) : (
            /* Resultado */
            <div className="text-center py-8">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                result.success ? 'bg-green-900/30' : 
                result.isPermissionError ? 'bg-yellow-900/30' : 'bg-red-900/30'
              }`}>
                {result.success ? (
                  <FaCheckCircle className="text-green-400 text-3xl" />
                ) : result.isPermissionError ? (
                  <FaUserLock className="text-yellow-400 text-3xl" />
                ) : (
                  <FaTimesCircle className="text-red-400 text-3xl" />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${
                result.success ? 'text-green-400' : 
                result.isPermissionError ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {result.success ? '¡Eliminado!' : 
                 result.isPermissionError ? 'Permisos Insuficientes' : 'Error'}
              </h3>
              <p className="text-gray-300">{result.message}</p>
              {result.success && (
                <div className="mt-4 text-sm text-gray-400">
                  El modal se cerrará automáticamente...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-neutral-700 bg-neutral-900 rounded-b-xl">
          {!result ? (
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Verificando y Eliminando...
                  </>
                ) : (
                  <>
                    <FaTrashAlt />
                    Eliminar 
                  </>
                )}
              </button>
            </div>
          ) : (!result.success || result.isPermissionError) && (
            <div className="flex justify-center">
              <button
                onClick={handleClose}
                className={`px-6 py-3 ${
                  result.isPermissionError ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-neutral-800 hover:bg-neutral-700'
                } text-white font-medium rounded-lg transition-colors`}
              >
                {result.isPermissionError ? 'Entendido' : 'Cerrar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}