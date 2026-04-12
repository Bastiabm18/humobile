// app/perfil/components/PerfilEventos.tsx
'use client';

import { useState, useEffect } from 'react';
import CarruselEventosBase from './CarruselEventosBase';
import { CalendarEvent, EventoCalendario, ProfileType } from '@/types/profile';
import { getEventosMostrarPerfil, getEventsByProfile } from '@/app/actions/actions';
import EventoModal from './EventoModal';
import NeonSign from '@/app/components/NeonSign';
import { useRouter } from 'next/navigation';


interface PerfilEventosProps {
  perfilId: string;
  perfilType: ProfileType
}

export default function PerfilEventos({ perfilId, perfilType }: PerfilEventosProps) {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(null); // <-- Nuevo estado
  const [modalOpen, setModalOpen] = useState(false); // <-- Nuevo estado

 useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventosData = await getEventosMostrarPerfil(perfilId, perfilType);
        setEventos(eventosData);
        setLoading(false);
        
      } catch (error: any) {
        console.error('Error obteniendo eventos:', error);
        setError(error.message || 'Error al cargar los eventos');
        setEventos([]);
        setLoading(false);
      }
    };

    fetchEventos();
  }, [perfilId, perfilType]);


  const handleEventClick = (evento: EventoCalendario) => {
      console.log('Evento seleccionado:', evento.id);
    //  console.log(evento);
   // setSelectedEvent(evento); // <-- Guardar el evento seleccionado  OBSOLOTE AHORA REDIRIGE
   // setModalOpen(true); // <-- Abrir el modal
    const encodedId = encodeEventId(evento.id);
      
      // Redirigir con el ID codificado
      router.push(`/evento?id=${encodedId}`);

  };

    // Función para codificar el ID del evento
const encodeEventId = (eventId: string): string => {
  // Crear objeto con el ID
  const data = { id: eventId };
  
  // Convertir a JSON y luego a base64
  const jsonString = JSON.stringify(data);
  const base64 = btoa(jsonString);
  
  // Convertir a base64url (seguro para URLs)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

  
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="w-full max-w-[80%] mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-6">
        <NeonSign/>
        </div>
      </div>
    );
  }

  return (

    <>
    <CarruselEventosBase
      eventos={eventos}
      title="Próximos Confirmados"
      onEventClick={handleEventClick}
      />

         {/* Modal para mostrar detalles del evento */}
      {selectedEvent && (
        <EventoModal
          evento={selectedEvent}
          isOpen={modalOpen}
          onClose={handleCloseModal}
        />
      )}
      </>
  );
}