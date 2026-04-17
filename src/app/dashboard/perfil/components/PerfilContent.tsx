'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile } from '../../../actions/actions';
import PresentacionPerfil from './PresentacionPerfil';
import PerfilEventos from './PerfilEventos';
import NeonSign from '@/app/components/NeonSign';
import { MdArrowBack } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { PermisoUsuario, Profile } from '@/types/profile';
import PublicCalendarView from './PublicCalendarView';
import SeleccionPerfilInvitar from './SeleccionPerfilInvitar';
import CrearEventoModal from '../../agenda/components/CrearEventoModal';
import { addHours } from 'date-fns';
import { usePermisos } from '@/app/hooks/usePermisos';

interface PerfilContentProps {
  perfilesUsuarioLogueado: Profile[] | null;
 usuarioPermisos?: PermisoUsuario[] | null;
}

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

export default function PerfilPage({ perfilesUsuarioLogueado, usuarioPermisos }: PerfilContentProps) {
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState<Profile>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // ===== ESTADOS PARA LA INVITACIÓN =====
  const [modalSeleccionOpen, setModalSeleccionOpen] = useState(false);
  const [modalCrearEventoOpen, setModalCrearEventoOpen] = useState(false);
  const [perfilCreador, setPerfilCreador] = useState<Profile | null>(null);
  const [fechaInvitacion, setFechaInvitacion] = useState<Date>(new Date());
  const [fechaFinInvitacion, setFechaFinInvitacion] = useState<Date | undefined>(undefined);

const { activo } = usePermisos({});
const puedeInvitar = perfilesUsuarioLogueado !== null && activo('AGREGAR_PARTICIPANTES');
  console.log('PerfilPage - Perfiles del usuario logueado →', perfilesUsuarioLogueado);
  console.log('PerfilPage - Permisos del usuario logueado →', usuarioPermisos);
  useEffect(() => {
  window.scrollTo(0, 0);
}, []);
  useEffect(() => {
    const fetchProfile = async () => {
      const encodedData = searchParams.get('perfil');
      
      if (!encodedData) {
        console.log(' No se encontró parámetro "perfil" en la URL');
        setError('No se encontró el perfil');
        return;
      }
      
      const decodedData = decodeProfileData(encodedData);
      
      if (!decodedData) {
        console.error('Error: Datos decodificados inválidos');
        setError('Datos del perfil inválidos');
        return;
      }
      
      console.log(' ID listo para usar:', decodedData.id);
      console.log(' Tipo de perfil:', decodedData.type);
      
      // Aquí llamamos a getProfile
      setLoading(true);
      try {
        const resultado = await getProfile(decodedData.id, decodedData.type);
        console.log(' Datos del perfil obtenidos:', resultado);
        
        // El resultado es un array, tomamos el primer elemento
        if (Array.isArray(resultado) && resultado.length > 0) {
          setProfileData(
           resultado[0]
          );
        } else {
          throw new Error('No se encontraron datos del perfil');
        }
        
        setError(null);
      } catch (error: any) {
        console.error(' Error obteniendo perfil:', error);
        setError(`Error al cargar el perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [searchParams]);


    const handleInvitar = (fecha: Date, fechaFin?: Date) => {
    if (!puedeInvitar || !perfilesUsuarioLogueado) return;

    setFechaInvitacion(fecha);
    setFechaFinInvitacion(fechaFin);

    // Si tiene solo 1 perfil, usarlo directo
    if (perfilesUsuarioLogueado.length === 1) {
      setPerfilCreador(perfilesUsuarioLogueado[0]);
      setModalCrearEventoOpen(true);
      return;
    }
    // Si tiene más de 1, abrir modal de selección
    setModalSeleccionOpen(true);
  };
  const handlePerfilSeleccionado = (perfil: Profile) => {
    setPerfilCreador(perfil);
    setModalSeleccionOpen(false);
    setModalCrearEventoOpen(true);
  console.log('Perfil seleccionado para enviar invitacion:', perfil.nombre, perfil.id);
  // Aquí abres el CrearEventoModal con perfilCreadorSeleccionado
};

  const handleCloseCrearEvento = () => {
    setModalCrearEventoOpen(false);
  };


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
      <>
    <div className="min-h-screen bg-neutral-800/70 text-white p-4 md:p-8">
        <div className='w-[90vw] mt-16 items-start justify-center py-5 px-2'>
               <motion.button
            onClick={() => router.push('/dashboard/busqueda')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-700 text-neutral-300 hover:bg-neutral-600 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Atras</span>
          </motion.button>
        </div>
      {profileData && (
        <div className="space-y-8">
          {/* Componente de presentación */}
          <PresentacionPerfil perfil={profileData} />
           {/* Calendario público */}
          <div className="w-[95vw] md:w-[80vw] mx-auto p-6 bg-neutral-800/30 rounded-2xl border border-neutral-700">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Agenda de {profileData.nombre}
            </h2>
            <PublicCalendarView 
              profileId={profileData.id}
              perfilTipo={profileData.tipo}
              perfilNombre={profileData.nombre}
              onInvitar={() => {
                  // Si tiene solo 1 perfil, usarlo directo
                  if (perfilesUsuarioLogueado && perfilesUsuarioLogueado.length === 1) {
                      setPerfilCreador(perfilesUsuarioLogueado[0]);
                    
                    console.log('Perfil único seleccionado:', perfilesUsuarioLogueado[0].nombre);
                    return;
                }
                // Si tiene más de 1, abrir modal de selección
                setModalSeleccionOpen(true);
            }}
            perfilesUsuarioLogueado={perfilesUsuarioLogueado}
            />  
          </div>
          
          {/* Aquí irán más componentes futuros */}
          <div className="w-[95vw] md:w-[80vw] mx-auto p-6 bg-neutral-800/30 rounded-2xl border border-neutral-700">
           {/* Componente de eventos */}
            <PerfilEventos
              perfilId={profileData.id}
              perfilType={profileData.tipo}
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
        
        {modalSeleccionOpen && perfilesUsuarioLogueado && (
          <SeleccionPerfilInvitar
            open={modalSeleccionOpen}
            onClose={() => setModalSeleccionOpen(false)}
            perfiles={perfilesUsuarioLogueado}
            onSeleccionar={handlePerfilSeleccionado}
          />
        )}

         {/* ===== MODAL CREAR EVENTO ===== */}
      {modalCrearEventoOpen && perfilCreador && profileData && (
        <CrearEventoModal
          open={modalCrearEventoOpen}
          onClose={handleCloseCrearEvento}
          profile={perfilCreador}
          selectedDate={fechaInvitacion}
          selectedEndDate={fechaFinInvitacion}
          invitadoPreCargado={profileData}
        />
      )}
    </>
  );
}