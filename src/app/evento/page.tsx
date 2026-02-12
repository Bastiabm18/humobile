import { Metadata } from 'next';
import { getEventoById } from './actions/actions';
import EventoContent from './components/EventoContent';

// Mantenemos tu lógica de decodificación
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

// 1. Corregimos generateMetadata para que use await en searchParams
export async function generateMetadata(props: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
  const searchParams = await props.searchParams; // <--- EL FIX
  const encodedId = searchParams.id as string;
  
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
      images: [{ url: evento.flyer_url || '/fallback-image.jpg' }],
      type: 'article',
    },
  };
}

// 2. Corregimos el componente Page para que sea async y use await
export default async function Page(props: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const searchParams = await props.searchParams; // await 
  
  // Pasamos los searchParams ya resueltos o dejamos que EventoDetalle los use
  // Si EventoDetalle usa useSearchParams() internamente, no hace falta pasarle nada.
  return <EventoContent />;
}