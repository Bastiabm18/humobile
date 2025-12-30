'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile } from '../actions/actions';
import PresentacionPerfil from './components/PresentacionPerfil';
import PerfilEventos from './components/PerfilEventos';
import NeonSign from '../components/NeonSign';
import { MdArrowBack } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
// Función para decodificar
const decodeProfileData = (encoded: string): { id: string; type: 'artist' | 'band' | 'place' } | null => {
    
  
    try {
    // Convertir base64url a base64 normal
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decodificar base64
    const jsonString = atob(base64);
    
    // Parsear JSON
    const data = JSON.parse(jsonString);
    
    // Validar que tenga los campos correctos
    if (!data.id || !['artista', 'banda', 'lugar'].includes(data.type)) {
      return null;
    }
    
    return data as { id: string; type: 'artist' | 'band' | 'place' };
  } catch (error) {
    console.error('Error decodificando:', error);
    return null;
  }
};

export default function PerfilPage() {
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  useEffect(() => {
    const fetchProfile = async () => {
      const encodedData = searchParams.get('perfil');
      
      if (!encodedData) {
        console.log('❌ No se encontró parámetro "perfil" en la URL');
        setError('No se encontró el perfil');
        return;
      }
      
      const decodedData = decodeProfileData(encodedData);
      
      if (!decodedData) {
        console.error('❌ Error: Datos decodificados inválidos');
        setError('Datos del perfil inválidos');
        return;
      }
      
      console.log('✅ ID listo para usar:', decodedData.id);
      console.log('✅ Tipo de perfil:', decodedData.type);
      
      // Aquí llamamos a getProfile
      setLoading(true);
      try {
        const resultado = await getProfile(decodedData.id, decodedData.type);
        console.log('✅ Datos del perfil obtenidos:', resultado);
        
        // El resultado es un array, tomamos el primer elemento
        if (Array.isArray(resultado) && resultado.length > 0) {
          setProfileData({
            type: decodedData.type,
            data: resultado[0].data,
            id: resultado[0].id
          });
        } else {
          throw new Error('No se encontraron datos del perfil');
        }
        
        setError(null);
      } catch (error: any) {
        console.error('❌ Error obteniendo perfil:', error);
        setError(`Error al cargar el perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NeonSign/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-black text-white p-4 md:p-8">
        <div className='w-full items-start justify-center py-5 px-2'>
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
      {profileData && (
        <div className="space-y-8">
          {/* Componente de presentación */}
          <PresentacionPerfil perfil={profileData} />
          
          {/* Aquí irán más componentes futuros */}
          <div className="w-[95vw] md:w-[95vw] mx-auto p-6 bg-neutral-800/30 rounded-2xl border border-neutral-700">
           {/* Componente de eventos */}
      <PerfilEventos
        perfilId={profileData.id}
        perfilType={profileData.type}
      />
          </div>
        </div>
      )}
      
      {!profileData && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay perfil para mostrar</p>
        </div>
      )}
    </div>
  );
}