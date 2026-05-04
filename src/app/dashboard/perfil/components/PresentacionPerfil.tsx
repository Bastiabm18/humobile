// components/PresentacionPerfil.tsx
'use client';

import { motion } from 'framer-motion';
import { HiMail, HiOutlineUserGroup, HiPhone, HiUser, HiUsers } from 'react-icons/hi';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { HiBuildingOffice } from 'react-icons/hi2';
import { Profile } from '@/types/profile';
import { useState } from 'react';
import ModalMapaLugar from '@/app/evento/components/ModalMapaLugar';
import { FaEarthAmericas } from 'react-icons/fa6';

interface PresentacionPerfilProps {
  perfil: Profile
}

export default function PresentacionPerfil({ perfil }: PresentacionPerfilProps) {
  const [verModalMapa, setVerModalMapa] = useState(false);
  const type = perfil.tipo;
  const data = perfil;

  const getName = () => data.nombre || 'Sin nombre';
  const getImageUrl = () => data.imagen_url || '';
  const getPhone = () => data.telefono || 'Sin teléfono';
  const getMail = () => data.email || 'Sin email';
  const getDescription = () => data.descripcion_perfil || 'Sin descripción';
  const getLocation = () => {
    if (data.ciudad_id && data.region_id) {
      return `${data.ciudad_id}, ${data.region_id}`;
    }
    return data.ciudad_id || data.region_id || 'Sin ubicación';
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'artista': return <HiUser className="w-5 h-5 md:w-6 md:h-6" />;
      case 'banda': return <HiUsers className="w-5 h-5 md:w-6 md:h-6" />;
      case 'lugar': return <HiBuildingOffice className="w-5 h-5 md:w-6 md:h-6" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'artista': return 'Artista';
      case 'banda': return 'Banda';
      case 'lugar': return 'Local';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'artista': return 'bg-red-600/20 text-red-400 border-red-500/30';
      case 'banda': return 'bg-green-600/20 text-green-400 border-green-500/30';
      case 'lugar': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
    }
  };

  const name = getName();
  const imageUrl = getImageUrl();
  const phone = getPhone();
  const location = getLocation();
  const mail = getMail();
  const descripcion = getDescription();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          relative
          w-[95vw] md:w-[80vw]
          h-auto min-h-[45vh] md:h-[35vh]
          rounded-2xl
          overflow-hidden
          group
          shadow-2xl shadow-black/40
          border border-neutral-700
          mx-auto
        "
      >
        {/* Imagen de fondo */}
        {imageUrl ? (
          <div className="absolute inset-0">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-all duration-300" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:30px_30px]" />
            <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
              {getTypeIcon()}
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="relative z-10 h-full flex flex-col justify-between p-4 md:p-6">
          {/* Encabezado */}
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full backdrop-blur-sm border ${getTypeColor()}`}>
              {getTypeIcon()}
              <span className="text-sm md:font-medium">{getTypeLabel()}</span>
            </div>
            
            {location && (
              <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-black/50 rounded-full backdrop-blur-sm border border-neutral-600/50">
                <FaMapMarkerAlt className="w-3 h-3 md:w-4 md:h-4 text-neutral-400" />
                <span className="text-xs md:text-sm text-neutral-300">{location}</span>
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className="mt-8 md:mt-0 space-y-3 md:space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white break-words">
              {name}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
              {perfil.direccion && (  
                <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm border border-neutral-600/50 w-fit">
                  <FaMapMarkerAlt className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span className="text-xs md:text-sm text-neutral-300 truncate max-w-[60vw] md:max-w-none">{perfil.direccion}</span>
                </div>
              )}

              {/* Divisor solo en desktop */}
              <div className="hidden md:block h-6 w-[1px] bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />

              <div className="flex items-center gap-3">
                {perfil.lat != null && perfil.lon != null && (
                  <div
                    onClick={() => setVerModalMapa(true)}
                    className="flex items-center cursor-pointer text-purple-300 gap-2 px-4 py-2 bg-purple-700/50 rounded-full backdrop-blur-sm border border-purple-600/50 text-xs md:text-sm"
                  >
                    <FaEarthAmericas className="w-4 h-4 text-purple-400" />
                    ¡Aquí estamos!
                  </div>
                )}
                
                <div className="flex items-center gap-2 px-2 md:px-0">
                  <HiMail className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-medium text-sm md:text-base">{mail}</span>
                </div>
              </div>

            </div>
              <div className='flex items-center gap-3'>
                {perfil.descripcion_perfil && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-neutral-700/30 rounded-sm backdrop-blur-sm border border-neutral-600/30 text-xs md:text-sm">
                    <HiUser className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300">{perfil.descripcion_perfil.length > 100 ? perfil.descripcion_perfil.slice(0, 100) + '...' : perfil.descripcion_perfil}</span>
                  </div>
                )}

              </div>

            {/* Oculto en mobile: Pertenece a grupo */}
            <div className='hidden md:grid w-full mt-4 grid-cols-1 md:grid-cols-3'>
              {perfil.pertenece_a_grupo && perfil.pertenece_a_grupo.length > 0 && (
                <div className="flex flex-row gap-3">
                  {perfil.pertenece_a_grupo.map((participacion, index) => (
                    <div 
                      key={`${participacion.id_banda}-${index}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700/30 hover:bg-blue-700/50 rounded-full backdrop-blur-sm border border-blue-600/30 transition-colors"
                    >
                      <HiOutlineUserGroup className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-blue-200">
                        <span className="font-medium capitalize">{participacion.tipo}</span>
                        <span className="mx-1 opacity-60 text-xs">en</span>
                        <span className="font-bold text-white">{participacion.nombre_banda}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-1 mt-2 bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent opacity-50" />
        </div>
      </motion.div>

      {verModalMapa && (
        <ModalMapaLugar
          isOpen={verModalMapa}
          onClose={() => setVerModalMapa(false)}
          latitud={perfil.lat ?? -36.827}
          longitud={perfil.lon ?? -73.050}
          nombreLugar={perfil.nombre ?? 'Perfil'}
          direccion={perfil.direccion}
        />
      )}
    </>
  );
}