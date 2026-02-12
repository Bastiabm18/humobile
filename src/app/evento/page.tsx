import { Metadata } from 'next';
import { getEventoById } from './actions/actions';
import EventoContent from './components/EventoContent';

// Reutilizamos tu lógica de decodificación en el servidor
const decodeEventId = (encoded: string): string | null => {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const data = JSON.parse(atob(base64));
    return data.id;
  } catch (error) {
    return null;
  }
};

// ESTO ES LO QUE LEEN FACEBOOK Y WHATSAPP
export async function generateMetadata({ searchParams }: { searchParams: { id?: string } }): Promise<Metadata> {
  const encodedId = searchParams?.id;
  if (!encodedId) return { title: 'Evento' };

  const eventoId = decodeEventId(encodedId);
  const evento = eventoId ? await getEventoById(eventoId) : null;

  if (!evento) return { title: 'Evento no encontrado' };

  return {
    title: evento.titulo,
    description: evento.descripcion || 'Mira este evento increíble',
    openGraph: {
      title: evento.titulo,
      description: evento.descripcion,
      // IMPORTANTE: La URL de la imagen debe ser absoluta (ej: de Supabase Storage)
      images: [{ url: evento.flyer_url || '/fallback-image.jpg' }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: evento.titulo,
      images: [evento.flyer_url || '/fallback-image.jpg'],
    },
  };
}

export default function Page() {
  // Simplemente renderizamos el componente que tiene toda tu lógica
  return <EventoContent />;
}