// app/evento/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getEventoById} from './actions/actions'
import EventoTarjeta from './components/EventoTarjeta';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NeonSign from '../components/NeonSign';

// Función para decodificar el ID del evento
const decodeEventId = (encoded: string): string | null => {
  try {
    // Convertir base64url a base64 normal
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decodificar base64
    const jsonString = atob(base64);
    
    // Parsear JSON - asumimos que viene {id: 'event-id'}
    const data = JSON.parse(jsonString);
    
    // Validar que tenga el campo id
    if (!data.id) {
      return null;
    }
    
    return data.id as string;
  } catch (error) {
    console.error('Error decodificando ID del evento:', error);
    return null;
  }
};

export default function EventoPage() {
  const searchParams = useSearchParams();
  const [eventoData, setEventoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvento = async () => {
      const encodedData = searchParams.get('id');
      
      if (!encodedData) {
        console.log('❌ No se encontró parámetro "id" en la URL');
        setError('No se encontró el identificador del evento');
        return;
      }
      
      const eventoId = decodeEventId(encodedData);
      
      if (!eventoId) {
        console.error('❌ Error: ID del evento inválido');
        setError('Identificador del evento inválido');
        return;
      }
      
      console.log('✅ ID del evento listo para usar:', eventoId);
      
      // Llamar a la función para obtener el evento
      setLoading(true);
      try {
        const evento = await getEventoById(eventoId);
        console.log('✅ Datos del evento obtenidos:', evento);
        
        if (evento) {
          setEventoData(evento);
        } else {
          throw new Error('No se encontró el evento');
        }
        
        setError(null);
      } catch (error: any) {
        console.error('❌ Error obteniendo evento:', error);
        setError(`Error al cargar el evento: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvento();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NeonSign />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  bg-gradient-to-b from-neutral-900 to-black text-white p-4 md:p-8">
        <div className="max-w-7xl  mx-auto">
          <div className="w-full items-start justify-center py-5 px-2">
            <motion.button
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span>Volver al Inicio</span>
            </motion.button>
          </div>
          
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="p-8 bg-red-900/20 border border-red-700/50 rounded-2xl text-center max-w-md">
              <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mt-16 mx-auto">
        {/* Botón de volver */}
        <div className="w-full items-start justify-center py-5 px-2">
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Volver al Inicio</span>
          </motion.button>
        </div>

        {/* Mostrar EventoTarjeta si hay datos */}
        {eventoData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EventoTarjeta evento={eventoData} />
          </motion.div>
        )}
        
        {/* Si no hay datos, error o loading ya fue manejado arriba */}
        {!eventoData && !loading && !error && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <p className="text-gray-400 text-lg">No hay evento para mostrar</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-lg transition-colors"
            >
              Explorar eventos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}