// components/PresentacionPerfil.tsx
'use client';

import { motion } from 'framer-motion';
import { HiPhone, HiUser, HiUsers } from 'react-icons/hi';
import { FaGuitar, FaMapMarkerAlt } from 'react-icons/fa';
import { HiBuildingOffice } from 'react-icons/hi2';

interface PresentacionPerfilProps {
  perfil: {
    type: 'artista' | 'banda' | 'lugar';
    data: {
      // Campos comunes
      name?: string;              // artist
      band_name?: string;         // band  
      place_name?: string;        // place
      phone?: string;             // común
      contact_phone?: string;     // band
      email?: string;             // artist
      cityId?: string;            // común
      regionId?: string;          // común
      
      // Campos de imagen (diferentes nombres)
      image_url?: string;         // artist
      photo_url?: string;         // band/place
      
      // Campos específicos
      music_type?: string;        // band
      place_type?: string;        // place
      instrumento?: string;       // artist
    };
  };
}

export default function PresentacionPerfil({ perfil }: PresentacionPerfilProps) {
  // Normalizar datos
  const type = perfil.type;
  const data = perfil.data;
  
  // Obtener nombre según tipo
  const getName = () => {
    switch (type) {
      case 'artista': return data.name || 'Sin nombre';
      case 'banda': return data.band_name || 'Sin nombre';
      case 'lugar': return data.place_name || 'Sin nombre';
    }
  };
  
  // Obtener imagen
  const getImageUrl = () => {
    return data.image_url || data.photo_url || '';
  };
  
  // Obtener teléfono
  const getPhone = () => {
    return data.phone || data.contact_phone || 'Sin teléfono';
  };
  
  // Obtener ubicación
  const getLocation = () => {
    if (data.cityId && data.regionId) {
      return `${data.cityId}, ${data.regionId}`;
    }
    return data.cityId || data.regionId || 'Sin ubicación';
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
  
  // Obtener información adicional según tipo
  const getAdditionalInfo = () => {
    switch (type) {
      case 'artista':
        return data.instrumento || 'Artista musical';
      case 'banda':
        return data.music_type || 'Banda musical';
      case 'lugar':
        return data.place_type || 'Establecimiento';
    }
  };
  
  const name = getName();
  const imageUrl = getImageUrl();
  const phone = getPhone();
  const location = getLocation();
  const additionalInfo = getAdditionalInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative
        w-[95vw] md:w-[95vw]
        h-[30vh]
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
            <span className="ml-2 text-3xl font-bold opacity-30">{name.charAt(0)}</span>
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
            <div className="flex items-center gap-4">
              <p className="text-neutral-300 font-medium">
                {additionalInfo}
              </p>
              
              {/* Línea decorativa */}
              <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-neutral-500 to-transparent" />
              
              {/* Contacto */}
              <div className="flex items-center gap-2">
                <HiPhone className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">{phone}</span>
              </div>
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
  );
}