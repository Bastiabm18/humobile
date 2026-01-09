// components/ProfileCards.tsx
'use client';

import { Profile, ProfileType } from '@/types/profile';
import { deleteProfile } from '../actions/actions';
import { HiPencil, HiPlus, HiTrash, HiEye } from 'react-icons/hi';
import { HiOutlineBuildingStorefront } from 'react-icons/hi2';
import { useState } from 'react';
import ProfileViewModal from './ProfileViewModal';
import { FaUser, FaGuitar } from 'react-icons/fa';
import { BiUserX } from 'react-icons/bi';
import { BsCalendar3 } from 'react-icons/bs';
import InvitarModal from './InvitarModal';
import { InvitacionData } from '@/types/profile';
interface Props {
  profiles: Profile[];
  onRefresh: () => void;
  onEdit: (profile: Profile) => void;
  geoData: any;
}

export default function ProfileCards({ profiles, onRefresh, onEdit, geoData }: Props) {
  const [viewProfile, setViewProfile] = useState<Profile | null>(null);
  const [invitarModalOpen, setInvitarModalOpen] = useState(false);
  const [bandaSeleccionada, setBandaSeleccionada] = useState<Profile | null>(null);

  if (profiles.length === 0) {
    return <p className="text-gray-500">No tienes perfiles creados.</p>;
  }

  const getTypeLabel = (type: ProfileType) => {
    switch (type) {
      case 'artist': return 'Artista';
      case 'band': return 'Banda';
      case 'place': return 'Local';
    }
  };

  const getTypeIcon = (type: ProfileType) => {
    switch (type) {
      case 'artist': return <FaUser className="w-5 h-5" />;
      case 'band': return <FaGuitar className="w-5 h-5" />;
      case 'place': return <HiOutlineBuildingStorefront className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ProfileType) => {
    switch (type) {
      case 'artist': return 'text-blue-400 bg-blue-400/10';
      case 'band': return 'text-purple-400 bg-purple-400/10';
      case 'place': return 'text-green-400 bg-green-400/10';
    }
  };

  const getBandName = (profile: Profile | null): string => {
    if (!profile || profile.type !== 'band') return 'Banda';
    return (profile.data as any).band_name || 'Banda';
  };

  const getBandaId = (profile: Profile | null): string => {
    if (!profile) return '';
    return profile.id || '';
  };

  const getName = (p: Profile): string => {
    switch (p.type) {
      case 'artist': return (p.data as any).name || 'Sin nombre';
      case 'band': return (p.data as any).band_name || 'Sin nombre';
      case 'place': return (p.data as any).place_name || 'Sin nombre';
      default: return 'Sin nombre';
    }
  };

  const getCity = (p: Profile): string => {
    return (p.data as any).cityId || 'Sin ciudad';
  };

  const getImagenUrl = (p: Profile): string => {
    const data = p.data as any;
    return data.imagen_url || data.photo_url || data.image_url || data.foto_url || '';
  };

  const handleDelete = async (id: string, type: ProfileType) => {
    if (!confirm(`¿Estás seguro de eliminar el perfil "${getName(profiles.find(p => p.id === id)!)}"?`)) return;
    await deleteProfile(id, type);
    onRefresh();
  };

  const handleVer = (profile: Profile) => {
    setViewProfile(profile);
  };

  const handleInvitar = (profile: Profile) => {
    setBandaSeleccionada(profile);
    setInvitarModalOpen(true);
  };

  const handleEnviarInvitacion = async (data: InvitacionData) => {
    console.log('Enviando invitación a:', bandaSeleccionada?.id);
    console.log('Datos:', data);
    alert(`Invitación enviada a ${bandaSeleccionada ? getName(bandaSeleccionada) : 'la banda'}`);
  };

  const handleCardClick = (profile: Profile) => {
    // Si ya hay un modal abierto, no hacer nada con el click en la card
    if (viewProfile || bandaSeleccionada) return;
    // Aquí podrías agregar otra acción si quieres
    console.log('Card click:', profile);
  };

  return (
    <>
      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          const name = getName(profile);
          const city = getCity(profile);
          const imagenUrl = getImagenUrl(profile);
          const typeLabel = getTypeLabel(profile.type);
          const typeIcon = getTypeIcon(profile.type);
          const typeColor = getTypeColor(profile.type);

          return (
            <div
              key={profile.id}
              className="
                relative rounded-2xl overflow-hidden
                bg-neutral-800/50
                border border-neutral-700/50
                group
                transition-all duration-300
                hover:shadow-xl hover:shadow-neutral-900/50
                hover:border-neutral-600
                flex flex-col
                h-[400px] /* Altura fija para consistencia */
              "
            >
              {/* Sección de imagen */}
              <div 
                className="relative h-48 overflow-hidden cursor-pointer"
                onClick={() => handleCardClick(profile)}
              >
                {imagenUrl ? (
                  <img
                    src={imagenUrl}
                    alt={name}
                    className="
                      w-full h-full object-cover
                      group-hover:scale-105
                      transition-transform duration-500
                    "
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <BiUserX size={80} className="text-neutral-600" />
                  </div>
                )}

                {/* Overlay gradiente */}
                <div className="
                  absolute inset-0
                  bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent
                  group-hover:from-neutral-900/80
                  transition-colors
                "></div>

                {/* Badge de tipo */}
                <div className={`
                  absolute top-4 left-4
                  ${typeColor}
                  px-3 py-1.5 rounded-full
                  flex items-center gap-2
                  text-sm font-medium
                  backdrop-blur-sm
                `}>
                  {typeIcon}
                  <span>{typeLabel}</span>
                </div>

                {/* Nombre en la imagen */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                    {name}
                  </h3>
                </div>
              </div>

              {/* Sección de información */}
              <div className="p-4 flex-grow">
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-neutral-400 mb-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{city}</span>
                  </div>
                  
                  {/* Información adicional según tipo */}
                  {profile.type === 'artist' && (
                    <div className="text-sm text-neutral-300">
                      {(profile.data as any).instrumento && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" />
                          </svg>
                          <span>{(profile.data as any).instrumento}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sección de botones */}
              <div className="p-4 border-t border-neutral-700/50 bg-neutral-900/30">
                <div className="flex items-center  justify-between gap-2">
                  {/* Botón Ver */}
                  <button
                    onClick={() => handleVer(profile)}
                    className="
                      flex-1 flex items-center justify-center gap-2
                     px-2 py-2.5
                      bg-neutral-800 hover:bg-blue-600/20
                      border border-neutral-700 hover:border-blue-500/50
                      rounded-lg
                      transition-all duration-200
                      group/btn
                    "
                    title="Ver perfil"
                  >
                    <HiEye className="w-4 h-4 text-blue-400 group-hover/btn:text-blue-300" />
                    <span className="text-sm font-medium text-neutral-300 group-hover/btn:text-blue-300">
                      Ver
                    </span>
                  </button>

                  {/* Botón Invitar (solo para bandas) */}
                  {profile.type === 'band' && (
                    <button
                      onClick={() => handleInvitar(profile)}
                      className="
                        flex-1 flex items-center justify-center gap-2
                       px-2 py-2.5
                        bg-neutral-800 hover:bg-green-600/20
                        border border-neutral-700 hover:border-green-500/50
                        rounded-lg
                        transition-all duration-200
                        group/btn
                      "
                      title="Invitar"
                    >
                      <HiPlus className="w-4 h-4 text-green-400 group-hover/btn:text-green-300" />
                      <span className="text-sm font-medium text-neutral-300 group-hover/btn:text-green-300">
                        Invitar
                      </span>
                    </button>
                  )}

                  {/* Botón Editar */}
                  <button
                    onClick={() => onEdit(profile)}
                    className="
                      flex-1 flex items-center justify-center gap-2
                     px-2 py-2.5
                      bg-neutral-800 hover:bg-yellow-600/20
                      border border-neutral-700 hover:border-yellow-500/50
                      rounded-lg
                      transition-all duration-200
                      group/btn
                    "
                    title="Editar"
                  >
                    <HiPencil className="w-4 h-4 text-yellow-400 group-hover/btn:text-yellow-300" />
                    <span className="text-sm font-medium text-neutral-300 group-hover/btn:text-yellow-300">
                      Editar
                    </span>
                  </button>

                  {/* Botón Eliminar */}
                  <button
                    onClick={() => handleDelete(profile.id, profile.type)}
                    className="
                      flex-1 flex items-center justify-center gap-2
                     px-2 py-2.5
                      bg-neutral-800 hover:bg-red-600/20
                      border border-neutral-700 hover:border-red-500/50
                      rounded-lg
                      transition-all duration-200
                      group/btn
                    "
                    title="Eliminar"
                  >
                    <HiTrash className="w-4 h-4 text-red-400 group-hover/btn:text-red-300" />
                    <span className="text-sm font-medium text-neutral-300 group-hover/btn:text-red-300">
                      Eliminar
                    </span>
                  </button>
                </div>
              </div>

              {/* Efecto de borde en hover */}
              <div className="
                absolute inset-0 border-2 border-transparent
                group-hover:border-neutral-600/50
                transition-colors rounded-2xl
                pointer-events-none
              "></div>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay perfiles */}
      {profiles.length === 0 && (
        <div className="text-center py-16">
          <div className="mb-4">
            <BiUserX className="w-20 h-20 text-neutral-600 mx-auto" />
          </div>
          <p className="text-xl font-medium text-neutral-400 mb-2">No hay perfiles creados</p>
          <p className="text-neutral-500">Crea tu primer perfil para comenzar</p>
        </div>
      )}

      {/* Modales */}
      {viewProfile && (
        <ProfileViewModal
          profile={viewProfile}
          isOpen={true}
          onClose={() => setViewProfile(null)}
        />
      )}

      {bandaSeleccionada && (
        <InvitarModal
          isOpen={invitarModalOpen}
          onClose={() => {
            setInvitarModalOpen(false);
            setBandaSeleccionada(null);
          }}
          onEnviar={handleEnviarInvitacion}
          nombreBanda={getBandName(bandaSeleccionada)}
          id_banda={getBandaId(bandaSeleccionada)}
        />
      )}
    </>
  );
}