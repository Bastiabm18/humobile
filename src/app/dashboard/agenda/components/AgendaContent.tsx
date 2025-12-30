// app/dashboard/agenda/AgendaContent.tsx
'use client';

import { useState } from 'react';
import { getProfiles } from '../actions/actions';
import { Profile } from '@/types/profile';
import CalendarView from './CalendarView';
import { BsCalendar3 } from 'react-icons/bs';
import { FaArrowCircleLeft, FaArrowLeft } from 'react-icons/fa';
import { BiUserX } from 'react-icons/bi';
import NeonSign from '@/app/components/NeonSign';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface AgendaContentProps {
  initialProfiles: Profile[];
  userId: string;
  userName?: string;   
}

export default function AgendaContent({ 
  initialProfiles, 
  userId, 
  userName 
}: AgendaContentProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const router = useRouter();

  console.log(initialProfiles);
  const loadProfiles = async () => {
    const data = await getProfiles(userId);
    setProfiles(data);
    
  };

  console.log(selectedProfile);

  if (profiles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-400">No tienes perfiles creados aún</p>
        <p className="mt-4 text-gray-500">Ve a <strong>Mis Perfiles</strong> y crea uno</p>
      </div>
    );
  }

  return (
    <div className="w-[95vw] md:max-w-7xl flex flex-col mx-auto">
      <div className="text-4xl font-bold py-15 text-center text-white">
      <NeonSign/>
      </div>

      {!selectedProfile ? (
        <>
          <p className="text-center text-gray-400 mb-12">
            Selecciona un perfil para ver su agenda
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map((profile) => {
                  const data = profile.data as any;
                  const name = data.name || data.band_name || data.place_name || 'Sin nombre';
                  const imagenUrl = data.imagen_url || data.photo_url || data.image_url || '';
                
                  return (
                    <div
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      className="
                        relative rounded-2xl overflow-hidden
                        cursor-pointer group
                        h-48
                        transition-all duration-500
                        hover:scale-[1.02] hover:shadow-2xl
                      "
                    >
                      {/* Imagen de fondo */}
                      {imagenUrl ? (
                        <img 
                          src={imagenUrl} 
                          alt={name}
                          className="
                            w-full h-full object-cover 
                            group-hover:scale-110
                            transition-transform duration-700
                          "
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br flex items-center justify-center from-neutral-800 to-neutral-900"><BiUserX size={100}/></div>
                                         )}                
                      {/* Overlay gradiente */}
                      <div className="
                        absolute inset-0 
                        bg-gradient-to-t from-black/90 via-black/50 to-transparent
                        group-hover:from-black/80
                        transition-colors
                      "></div>

                      {/* Contenido */}
                      <div className="
                        absolute bottom-0 left-0 right-0 
                        p-6
                        transform group-hover:translate-y-[-5px]
                        transition-transform duration-300
                      ">
                        <div className="flex items-end justify-between">
                          <div>
                            <h3 className="
                              text-2xl font-bold text-white 
                              drop-shadow-lg
                              group-hover:text-green-300
                              transition-colors
                            ">
                              {name}
                            </h3>
                            <p className="
                              text-green-400/80 text-sm mt-1
                              group-hover:text-green-300
                              transition-colors
                            ">
                              {profile.type}
                            </p>
                          </div>

                          <div className="
                            bg-black/50 p-3 rounded-full
                            group-hover:bg-green-600
                            transition-colors
                            backdrop-blur-sm
                          ">
                            <BsCalendar3 size={24} className="text-white" />
                          </div>
                        </div>
                      </div>
                    
                      {/* Efecto borde */}
                      <div className="
                        absolute inset-0 border-2 border-transparent
                        group-hover:border-green-500/50
                        transition-colors rounded-2xl
                      "></div>
                    </div>
                  );
                })}
          </div>
        </>
    ) : (
  <div className="relative rounded-2xl border-2 border-neutral-500 p-2 md:p-4 overflow-hidden">
    {/* Imagen de fondo si existe */}
    {(() => {
      const data = selectedProfile.data as any;
      const imageUrl = data?.imagen_url || data?.photo_url || data?.image_url;
      
      if (imageUrl) {
        return (
          <div className="absolute inset-0 z-0">
            <img 
              src={imageUrl} 
              alt="Fondo" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        );
      }
      return null;
    })()}

    {/* Contenido principal */}
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
      
  
            <motion.button
               onClick={() => {setSelectedProfile(null);
               }}
            
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            <span>Volver al Inicio</span>
          </motion.button>
      </div>
      <CalendarView profileId={selectedProfile.id} perfil={selectedProfile}/>
    </div>
  </div>
)}
    </div>
  );
}