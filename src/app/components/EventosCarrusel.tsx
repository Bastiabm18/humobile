// app/perfil/components/PerfilEventos.tsx
'use client';

import { useState, useEffect } from 'react';
import CarruselEventosBase from './CarruselEventosBase';
import { CalendarEvent, EventoCalendario } from '@/types/profile';
import { getEventosConfirmados, getEventsByProfile, getEventsPorEstado } from '@/app/actions/actions';
import NeonSign from '@/app/components/NeonSign';
import { Router } from 'next/router';
import { useRouter } from 'next/navigation';

interface PerfilEventosProps {
  perfilId: string;
  perfilType:string;
}

export default function EventosCarrusel() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const [selectedEvent, setSelectedEvent] = useState<EventoCalendario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      setError(null);
      try {
        const eventosData = await getEventosConfirmados();
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
  }, []);


  const handleEventClick = (evento: EventoCalendario) => {
      console.log('Evento seleccionado:', evento.id);
      // Codificar el ID del evento
      const encodedId = encodeEventId(evento.id);
      
      // Redirigir con el ID codificado
      router.push(`/evento?id=${encodedId}`);

    setSelectedEvent(evento);
    setModalOpen(true);
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

    <div className='w-full h-full p-5'>
    <CarruselEventosBase
      eventos={eventos}
      title="Próximos "
      onEventClick={handleEventClick}
      />

     
      </div>
  );
}