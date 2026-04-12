// components/PresentacionPerfil.tsx
'use client';

import { motion } from 'framer-motion';
import { HiOutlineUserGroup, HiPhone, HiUser, HiUsers } from 'react-icons/hi';
import { FaGuitar, FaMapMarkerAlt } from 'react-icons/fa';
import { HiBuildingOffice } from 'react-icons/hi2';
import { Profile } from '@/types/profile';
import MapaLugar from '@/app/dashboard/mi_perfil/components/MapaLugar';
import { useState } from 'react';
import ModalMapaLugar from '@/app/evento/components/ModalMapaLugar';
import { FaEarthAmericas } from 'react-icons/fa6';

interface PresentacionPerfilProps {
  perfil: Profile
}

export default function PresentacionPerfil({ perfil }: PresentacionPerfilProps) {


  const [lat, setLat]= useState("");
  const [lon, setLon]= useState("");
  const [verModalMapa, setVerModalMapa]= useState(false);
  // Normalizar datos
  const type = perfil.tipo;
  const data = perfil;

  console.log(perfil);
  
  // Obtener nombre según tipo
  const getName = () => {
    switch (type) {
      case 'artista': return data.nombre || 'Sin nombre';
      case 'banda': return data.nombre || 'Sin nombre';
      case 'lugar': return data.nombre || 'Sin nombre';
    }
  };
  
  // Obtener imagen
  const getImageUrl = () => {
    return data.imagen_url || '';
  };
  
  // Obtener teléfono
  const getPhone = () => {
    return data.telefono || 'Sin teléfono';
  };
  
  // Obtener ubicación
  const getLocation = () => {
    if (data.ciudad_id && data.region_id) {
      return `${data.ciudad_id}, ${data.region_id}, ${data.pais_id}`;
    }
    return data.ciudad_id || data.region_id || 'Sin ubicación';
  };
  
  // Obtener icono según tipo
  const getTypeIcon = () => {
    switch (type) {
      case 'artista': return <HiUser className="w-6 h-6" />;
      case 'banda': return <HiUsers className="w-6 h-6" />;
      case 'lugar': return <HiBuildingOffice className="w-6 h-6" />;
    }
  };
  
  // Obtener etiqueta del tipo
  const getTypeLabel = () => {
    switch (type) {
      case 'artista': return 'Artista';
      case 'banda': return 'Banda';
      case 'lugar': return 'Local';
    }
  };
  
  // Obtener color según tipo
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

  return (

    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative
        w-[95vw]
        h-[35vh]
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
            className="
              w-full h-full object-cover
              group-hover:scale-110
              transition-transform duration-700
            "
          />
          {/* Overlay oscuro */}
          <div className="
            absolute inset-0
            bg-gradient-to-t from-black/90 via-black/50 to-transparent
            group-hover:from-black/85
            transition-all duration-300
          " />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
          {/* Patrón de fondo */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:30px_30px]" />
          
          {/* Icono de fallback */}
          <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
            {getTypeIcon()}
            <span className="ml-2 text-3xl font-bold opacity-30">{}</span>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* Encabezado - Tipo y ubicación */}
        <div className="flex justify-between items-start">
          {/* Badge de tipo */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${getTypeColor()}`}>
            {getTypeIcon()}
            <span className="font-medium">{getTypeLabel()}</span>
          </div>
          
          {/* Ubicación */}
          {location && (
            <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm border border-neutral-600/50">
              <FaMapMarkerAlt className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-300">{location}</span>
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {name}
            </h1>
            
            {/* Información adicional */}
            <div className="grid grid-cols-1 md:flex items-center gap-2 md:gap-4">
            {perfil.direccion!='' && (  
              <div className="flex w-[60vw] md:w-auto items-center gap-2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm border border-neutral-600/50">
              <FaMapMarkerAlt className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-300">{perfil.direccion}</span>
            </div>)}

              {/* Línea decorativa */}
              <div className="h-6 w-[1px]  bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />


            {perfil.lat!=null && perfil.lon!=null && (
             <div
               onClick={()=>
                 {
                 setVerModalMapa(true);
                  }
                
                 }
               className="flex flex-row w-[40vw] md:w-auto items-center cursor-pointer text-purple-300 gap-2 px-4 py-2 bg-purple-700/50 rounded-full backdrop-blur-sm border border-purple-600/50">
                 <FaEarthAmericas className="w-4 h-4 text-purple-400" />
                   Aqui estamos!
                 {/* Línea decorativa */}
               </div>
          
              )} 
        <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />


              
              {/* Contacto */}
              <div className="flex items-center gap-2">
                <HiPhone className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">{phone}</span>
              </div>
              <div  className="h-6 cursor-pointer w-[1px] bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />
           
            </div>

            <div className='w-full mt-4 grid-cols-1 md:grid-cols-3'>
                 {perfil.pertenece_a_grupo && perfil.pertenece_a_grupo.length > 0 && (
                <div
                
                className="flex flex-row gap-3 "> {/* Contenedor para múltiples etiquetas */}
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

        </div>

        {/* Footer con efecto de brillo */}
        <div className="h-1 bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent opacity-50 group-hover:via-neutral-400 group-hover:opacity-100 transition-all duration-300" />
      </div>

      {/* Efectos visuales */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-neutral-500/30 transition-colors duration-300 pointer-events-none rounded-2xl" />
      
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>


              {verModalMapa &&
              
                   <ModalMapaLugar
                   isOpen={verModalMapa}
                   onClose={() => setVerModalMapa(false)}
                   latitud={perfil.lat ?? -36.827 }
                   longitud={perfil.lon ?? -73.050}
                   nombreLugar={  perfil.nombre ?? 'Perfil'}
                   direccion={perfil.direccion}
                   />
                  }
    </>
  );
}