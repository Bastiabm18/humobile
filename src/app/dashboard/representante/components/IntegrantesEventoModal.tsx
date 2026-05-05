'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaPhone, 
  FaCheckCircle, FaClock, FaTimesCircle,
  FaUsers
} from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { getIntegrantesEventoData } from '../actions/actions';
import { IntegranteEventoData } from '@/types/profile';
import NeonSign from '@/app/components/NeonSign';

interface IntegrantesEventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  bandaId: string;
  eventoId: string;
}

export default function IntegrantesEventoModal({
  isOpen,
  onClose,
  bandaId,
  eventoId
}: IntegrantesEventoModalProps) {
  const [integrantes, setIntegrantes] = useState<IntegranteEventoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bandaId && eventoId) {
      fetchIntegrantes();
    }
  }, [isOpen, bandaId, eventoId]);

  const fetchIntegrantes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIntegrantesEventoData(bandaId, eventoId);
      setIntegrantes(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'confirmado':
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-900/50 text-green-300 border border-green-800/50 flex items-center gap-1.5">
            <FaCheckCircle className="text-xs" />
            Confirmado
          </span>
        );
      case 'pendiente':
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-yellow-900/50 text-yellow-300 border border-yellow-800/50 flex items-center gap-1.5">
            <FaClock className="text-xs" />
            Pendiente
          </span>
        );
      case 'rechazado':
        return (
          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 border border-red-800/50 flex items-center gap-1.5">
            <FaTimesCircle className="text-xs" />
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex z-[60] items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-neutral-800"
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-900/60">
                <FaUsers className="text-gray-300 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Integrantes en el evento</h2>
                {/* SIN TITULO */}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          {/* Content - IGUAL PERO SIN TITULO */}
          <div className="p-5 overflow-y-auto max-h-[calc(80vh-80px)]">
            {loading ? (
              <div className="flex justify-center py-12">
               <NeonSign/>
              </div>
            ) : error ? (
              <div className="bg-red-950/40 border border-red-800/50 p-6 rounded-xl text-center">
                <p className="text-red-300">{error}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {integrantes.length === 0 ? (
                  <div className="text-center py-12 bg-neutral-900/30 rounded-xl">
                    <FaUsers className="text-4xl text-neutral-600 mx-auto mb-3" />
                    <p className="text-gray-400">No hay integrantes en este evento</p>
                  </div>
                ) : (
                  integrantes.map((integrante) => (
                    <div
                      key={integrante.id_perfil}
                      className="bg-neutral-900/40 p-4 rounded-xl border border-neutral-800"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {integrante.imagen_url ? (
                            <img
                              src={integrante.imagen_url}
                              alt={integrante.nombre}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-neutral-700"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-900/60 to-neutral-800 flex items-center justify-center border-2 border-neutral-700">
                              <FaUser className="text-gray-300 text-2xl" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {integrante.nombre}
                              </h3>
                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                  <FaEnvelope className="text-xs" />
                                  <span>{integrante.email}</span>
                                </div>
                                {integrante.telefono_contacto && (
                                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                                    <FaPhone className="text-xs" />
                                    <span>{integrante.telefono_contacto}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 -ml-6 md:ml-4">
                              {getEstadoBadge(integrante.estado_participacion)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur-sm flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}