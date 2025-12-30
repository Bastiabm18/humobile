// components/calendar/EventModal.tsx
'use client';

import { useState } from 'react';
import { CalendarEvent } from '@/types/profile';
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaEnvelope, FaLink, FaImage, FaLock, FaLockOpen } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';

interface EventModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!isOpen || !event) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 flex z-[9999] items-center justify-center p-4 bg-black/50" >
      <div className="relative bg-neutral-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-700 bg-neutral-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${event.resource?.is_blocked ? 'bg-red-900/80' : 'bg-neutral-700/80'}`}>
              {event.resource?.is_blocked ? (
                <FaLock className="text-red-300 text-xl" />
              ) : (
                <FaCheckCircle className="text-sky-300 text-xl" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{event.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status??'unknown')} text-white`}>
                  {getStatusText(event.status??'unknown')}
                </span>
                <span className="text-sm text-gray-400">
                  {event.category === 'meeting' ? 'Reunión' : event.category}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Descripción */}
          {event.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Descripción</h3>
              <p className="text-gray-300 bg-neutral-800/50 p-4 rounded-lg">
                {event.description}
              </p>
            </div>
          )}

          {/* Información principal en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Fecha y hora */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-sky-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Fecha</p>
                  <p className="text-white font-medium">{formatDate(event.start)}</p>
                  {formatDate(event.end) !== formatDate(event.start) && (
                    <p className="text-white font-medium">al {formatDate(event.end)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FaClock className="text-sky-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Horario</p>
                  <p className="text-white font-medium">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </p>
                </div>
              </div>
            </div>

            {/* Lugar */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-sky-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Lugar</p>
                  <p className="text-white font-medium">
                    {event.resource?.custom_place_name || 'Sin lugar específico'}
                  </p>
                  {event.resource?.address && (
                    <p className="text-gray-300 text-sm mt-1">{event.resource.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Organizador */}
          {(event.resource?.organizer_name || event.resource?.organizer_contact) && (
            <div className="mb-6 p-4 bg-neutral-800/30 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">Organizador</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.resource?.organizer_name && (
                  <div className="flex items-center gap-3">
                    <FaUser className="text-sky-400" />
                    <div>
                      <p className="text-sm text-gray-400">Nombre</p>
                      <p className="text-white font-medium">{event.resource.organizer_name}</p>
                    </div>
                  </div>
                )}
                
                {event.resource?.organizer_contact && (
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-sky-400" />
                    <div>
                      <p className="text-sm text-gray-400">Contacto</p>
                      <p className="text-white font-medium">{event.resource.organizer_contact}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enlaces y flyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {event.resource?.instagram_link && (
              <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                <FaLink className="text-purple-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400">Instagram</p>
                  <a
                    href={event.resource.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 font-medium truncate block"
                  >
                    {event.resource.instagram_link}
                  </a>
                </div>
              </div>
            )}

            {event.resource?.ticket_link && (
              <div className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-lg">
                <FaLink className="text-green-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-400">Tickets</p>
                  <a
                    href={event.resource.ticket_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-green-200 font-medium truncate block"
                  >
                    {event.resource.ticket_link}
                  </a>
                </div>
              </div>
            )}

            {event.resource?.flyer_url && (
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <FaImage className="text-yellow-400" />
                  <p className="text-lg font-semibold text-white">Flyer del evento</p>
                </div>
                <div className="bg-neutral-800/30 rounded-lg overflow-hidden">
                  <img
                    src={event.resource.flyer_url}
                    alt={`Flyer para ${event.title}`}
                    className="w-full h-48 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bloqueo */}
          {event.resource?.is_blocked && event.resource?.blocked_reason && (
            <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaLock className="text-red-400" />
                <h3 className="text-lg font-semibold text-white">Día Bloqueado</h3>
              </div>
              <p className="text-red-300">{event.resource.blocked_reason}</p>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="sticky bottom-0 p-4 border-t border-gray-700 bg-neutral-900 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              ID: <span className="text-gray-300 font-mono">{event.id}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-300 hover:text-white bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
              >
                Cerrar
              </button>
           
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}