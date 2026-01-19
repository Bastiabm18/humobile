// components/calendar/DesbloquearModal.tsx
'use client';

import { EventoCalendario } from '@/types/profile';
import { FaLock, FaCalendarAlt, FaClock, FaTrash, FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { eliminarBloqueo } from '../actions/actions';

interface DesbloquearModalProps {
  event: EventoCalendario | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockDeleted?: () => void;
}

export default function DesbloquearModal({ event, isOpen, onClose, onBlockDeleted }: DesbloquearModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  
  if (!isOpen || !event || !event.es_bloqueo) return null;

  // Formatear fechas (sin cambios)
  const formatDateTime = (date: Date) => {
    return format(date, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  const formatDateOnly = (date: Date) => {
    return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTimeOnly = (date: Date) => {
    return format(date, 'HH:mm', { locale: es });
  };

  const calculateDuration = () => {
    const start = new Date(event.inicio);
    const end = new Date(event.fin);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutos`;
    } else if (hours === 1) {
      return '1 hora';
    } else if (hours < 24) {
      return `${hours.toFixed(1)} horas`;
    } else {
      const days = hours / 24;
      return `${days.toFixed(1)} días`;
    }
  };

  const handleDeleteBlock = async () => {
    console.log("id del evento:"+ event.id );

    if (!event.id) {
      alert('Error: El bloqueo no tiene ID');
      return;
    }

    setIsDeleting(true);
    try {
      const result = await eliminarBloqueo(event.id);
      if (result.success) {
        if (onBlockDeleted) {
          onBlockDeleted();
        }
        onClose();
      } else {
        alert(`Error al eliminar bloqueo: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error al eliminar bloqueo: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation(false);
    }
  };

  // Helper para verificar si es el mismo día (sin cambios)
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-neutral-900 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
        {/* Encabezado */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-700 bg-neutral-900 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-900/50">
              <FaLock className="text-2xl text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Día Bloqueado</h2>
              <p className="text-gray-400 text-sm mt-1">Bloqueo de agenda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <HiX className="text-2xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Información del bloqueo */}
          <div className="space-y-6">
            {/* Título y motivo */}
            <div>
              <h3 className="text-xl font-bold text-red-300 mb-2">{event.titulo}</h3>
              {event.motivo_bloqueo && (
                <div className="bg-red-900/30 border border-red-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FaExclamationTriangle className="text-red-400" />
                    <span className="text-red-300 font-medium">Motivo del bloqueo:</span>
                  </div>
                  <p className="text-red-200">{event.motivo_bloqueo}</p>
                </div>
              )}
            </div>

            {/* Fechas y duración */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FaCalendarAlt className="text-blue-400" />
                  <span className="text-sm text-gray-400">Fecha</span>
                </div>
                <p className="text-white font-medium">
                  {formatDateOnly(new Date(event.inicio))}
                </p>
                {!isSameDay(new Date(event.inicio), new Date(event.fin)) && (
                  <p className="text-white font-medium mt-1">
                    al {formatDateOnly(new Date(event.fin))}
                  </p>
                )}
              </div>

              <div className="bg-neutral-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <FaClock className="text-green-400" />
                  <span className="text-sm text-gray-400">Horario</span>
                </div>
                <p className="text-white font-medium">
                  {formatTimeOnly(new Date(event.inicio))} - {formatTimeOnly(new Date(event.fin))}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Duración: {calculateDuration()}
                </p>
              </div>
            </div>

            {/* Detalles adicionales */}
            {event.descripcion && (
              <div className="bg-neutral-800/30 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Notas adicionales</h4>
                <p className="text-gray-300">{event.descripcion}</p>
              </div>
            )}

            {/* Información de creación */}
            <div className="text-xs text-gray-500">
              <p>ID: <span className="text-gray-400 font-mono">{event.id}</span></p>
              <p className="mt-1">
                Creado el: {format(new Date(event.created_at || event.inicio), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>

          {/* Confirmación de eliminación */}
          {deleteConfirmation && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FaExclamationTriangle className="text-red-400 text-xl" />
                <h4 className="text-lg font-bold text-red-300">¿Confirmar eliminación?</h4>
              </div>
              <p className="text-red-200 mb-4">
                Esta acción eliminará permanentemente este bloqueo. 
                El período quedará disponible para agendar eventos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmation(false)}
                  className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteBlock}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Sí, eliminar bloqueo'}
                  {!isDeleting && <FaTrash size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal - Botones de acción */}
        {!deleteConfirmation && (
          <div className="sticky bottom-0 p-6 border-t border-gray-700 bg-neutral-900 rounded-b-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Volver
              </button>
              <button
                onClick={() => setDeleteConfirmation(true)}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                <FaUnlock size={18} />
                Desbloquear día
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}