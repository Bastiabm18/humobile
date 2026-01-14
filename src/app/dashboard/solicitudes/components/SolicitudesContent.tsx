// app/dashboard/solicitudes/components/SolicitudesContent.tsx
"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  HiUserGroup,
  HiCalendar,
  HiOfficeBuilding,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamationCircle,
  HiEye,
  HiX,
  HiPhone,
  HiMail,
} from "react-icons/hi";
import { useState, useEffect } from "react";
import { Profile, SolicitudRespuesta } from "@/types/profile";
import SolicitudesTabla from "./SolicitudesTabla";
import { aceptarSolicitud, getSolicitudesByPerfil, rechazarSolicitud } from "../actions/actions";
import { BiUserX } from "react-icons/bi";
import { BsCalendar3 } from "react-icons/bs";
import { FaArrowLeft, FaGlobeAmericas, FaHome, FaMapMarkerAlt } from "react-icons/fa";
import NeonSign from "@/app/components/NeonSign";
import SolicitudModal from "./SolicitudModal";
import { FaCity, FaTag, FaUser } from "react-icons/fa6";
import { TbMessageQuestion } from "react-icons/tb";

interface Props {
  initialProfiles: Profile[];
  userId: string;
  userName: string;
}



// COMPONENTE PRINCIPAL
export default function SolicitudesContent({ initialProfiles, userId, userName }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudRespuesta | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudRespuesta[]>([]);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [estado_solicitud, SetEstadoSolicitud] = useState('');

  const perfilId = selectedProfile ? selectedProfile.id : '';

  useEffect(() => {
    const cargarSolicitudes = async () => {
      if (perfilId.length === 0) return;
      setLoading(true);
      try {
        const data = await getSolicitudesByPerfil(perfilId, estado_solicitud);
        setSolicitudes(data);
      } catch (error) {
        console.error('Error cargando solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarSolicitudes();
  }, [perfilId, estado_solicitud]);

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
  };

  const handleAceptar = async (id: string,codigo_solicitud:string,id_evento_solicitud:string,invitado_id:string,creador_id:string) => {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;
    
    const resultado = await aceptarSolicitud({ 
      id_solicitud: id,
      codigo_solicitud:codigo_solicitud,
      id_evento_solicitud:id_evento_solicitud,
      id_invitado:invitado_id,
      id_creador:creador_id
    });
    
    if (resultado.success) {
      setSolicitudes(prev => prev.map(s => 
        s.id === id ? { ...s, estado: "aceptada" } : s
      ));
    } else {
      alert(`Error: ${resultado.error}`);
    }
  };

  const handleRechazar = async (id: string,codigo_solicitud:string,id_evento_solicitud:string,invitado_id:string,creador_id:string) => {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;
    
    const resultado = await rechazarSolicitud({
        id_solicitud:id,
        codigo_solicitud:codigo_solicitud,
        id_evento_solicitud:id_evento_solicitud,  
        id_invitado:invitado_id,
        motivo_rechazo:'',
        id_creador:creador_id
    });

    if (resultado.success) {
      setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: "rechazada" } : s)));
    } else {
      alert(`Error: ${resultado.error}`);
    }
  };

  const handleVer = (solicitud: SolicitudRespuesta) => {
    setSolicitudSeleccionada(solicitud);
    setModalOpen(true);
  };

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
        <NeonSign />
      </div>

      {!selectedProfile ? (
        <>
          <p className="text-center text-gray-400 mb-12">
            Selecciona uno de tus perfiles para ver sus solicitudes 
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {profiles.map((profile) => {
              const data = profile.data as any;
              const name = data.name || data.band_name || data.place_name || 'Sin nombre';
              const imagenUrl = data.imagen_url || data.photo_url || data.image_url || '';

              return (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  className="                        relative rounded-2xl overflow-hidden
                        cursor-pointer group
                        h-48
                        transition-all duration-500
                        hover:scale-[1.02] hover:shadow-2xl"
                >
                  {imagenUrl ? (
                    <img 
                      src={imagenUrl} 
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br flex items-center justify-center from-neutral-800 to-neutral-900">
                      <BiUserX size={100}/>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80 transition-colors"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform group-hover:translate-y-[-5px] transition-transform duration-300">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg group-hover:text-green-300 transition-colors">
                          {name}
                        </h3>
                        <p className="text-green-400/80 text-sm mt-1 group-hover:text-green-300 transition-colors">
                          {profile.type}
                        </p>
                      </div>
                      <div className="bg-black/50 p-3 rounded-full group-hover:bg-green-600 transition-colors backdrop-blur-sm">
                        <BsCalendar3 size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-500/50 transition-colors rounded-2xl"></div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="w-[98%] border border-neutral-500 rounded-2xl bg-neutral-900 text-white px-2 py-6">
          <div className="flex items-center justify-between mb-8 ml-4">
            <motion.button
              onClick={() => setSelectedProfile(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
            >
              <FaArrowLeft className="text-sm" />
              <span>Volver a Perfiles</span>
            </motion.button>
          </div>
          <div className="flex flex-row gap-3 mb-3 w-full h-full items-center justify-center">
            <TbMessageQuestion size={42} className="text-purple-800/80 bg-gray-300 rounded-full p-2"/>
            <h2 className="font-bold text-purple-200 text-3xl"> SOLICITUDES</h2>
          </div>
          <div className="w-[98%] p-1 md:p-4 md:max-w-7xl mx-auto">
              <div className="
                relative 
                w-full 
                h-[30vh] 
                rounded-2xl 
                overflow-hidden 
                group 
                shadow-2xl shadow-black/40
                border border-neutral-700
                mx-auto
              ">
                {/* Imagen de fondo */}
                {(() => {
                  const data = selectedProfile.data as any;
                  const imageUrl = data?.imagen_url || data?.photo_url || data?.image_url;

                  return imageUrl ? (
                    <div className="absolute inset-0">
                      <img 
                        src={imageUrl} 
                        alt="Fondo"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/85 transition-all duration-300" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900">
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] bg-[length:30px_30px]" />
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                        <FaUser className="w-16 h-16" />
                      </div>
                    </div>
                  );
                })()}

                {/* Contenido */}
                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  {/* Encabezado - Tipo */}
                  <div className="flex justify-between items-start">
                    {/* Badge de tipo */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border border-neutral-600/50 bg-black/30">
                      <FaTag className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">{selectedProfile.type}</span>
                    </div>

                    {/* Ubicación */}
                    {(() => {
                      const data = selectedProfile.data as any;
                      const location = data?.cityId || data?.regionId || data?.countryId;

                      return location ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full backdrop-blur-sm border border-neutral-600/50">
                          <FaMapMarkerAlt className="w-4 h-4 text-neutral-400" />
                          <span className="text-sm text-neutral-300">{location}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                  
                  {/* Información principal */}
                  <div className="space-y-2">
                    {/* Nombre */}
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-3">
                        {(() => {
                          const data = selectedProfile.data as any;
                          return data?.name || data?.band_name || data?.place_name || 'Sin nombre';
                        })()}
                      </h1>
                      
                      {/* Información de contacto - Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const data = selectedProfile.data as any;
                          const badges = [];

                          if (data?.phone) {
                            badges.push(
                              <div key="phone" className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30">
                                <HiPhone className="w-4 h-4 text-green-400" />
                                <span className="text-green-300 text-sm font-medium">{data.phone}</span>
                              </div>
                            );
                          }

                          if (data?.email) {
                            badges.push(
                              <div key="email" className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/30">
                                <HiMail className="w-4 h-4 text-red-400" />
                                <span className="text-red-300 text-sm font-medium">{data.email}</span>
                              </div>
                            );
                          }

                          if (data?.countryId) {
                            badges.push(
                              <div key="country" className="flex items-center gap-2 bg-yellow-500/20 px-3 py-2 rounded-lg border border-yellow-500/30">
                                <FaGlobeAmericas className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-300 text-sm font-medium">{data.countryId}</span>
                              </div>
                            );
                          }

                          if (data?.regionId) {
                            badges.push(
                              <div key="region" className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 rounded-lg border border-purple-500/30">
                                <FaMapMarkerAlt className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-300 text-sm font-medium">{data.regionId}</span>
                              </div>
                            );
                          }

                          if (data?.cityId) {
                            badges.push(
                              <div key="city" className="flex items-center gap-2 bg-pink-500/20 px-3 py-2 rounded-lg border border-pink-500/30">
                                <FaCity className="w-4 h-4 text-pink-400" />
                                <span className="text-pink-300 text-sm font-medium">{data.cityId}</span>
                              </div>
                            );
                          }

                          if (data?.address) {
                            badges.push(
                              <div key="address" className="flex items-center gap-2 bg-gray-500/20 px-3 py-2 rounded-lg border border-gray-500/30">
                                <FaHome className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 text-sm font-medium">{data.address}</span>
                              </div>
                            );
                          }

                          return badges;
                        })()}
                      </div>
                    </div>
                  </div>
                      
                  {/* Footer con efecto de brillo */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-neutral-500/50 to-transparent opacity-50 group-hover:via-neutral-400 group-hover:opacity-100 transition-all duration-300 mt-2" />
                </div>
                      
                {/* Efectos visuales */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-neutral-500/30 transition-colors duration-300 pointer-events-none rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
</div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
               <NeonSign/>
              </div>
            ) : (
              <SolicitudesTabla
                solicitudes={solicitudes}
                onVer={handleVer}
                onAceptar={handleAceptar}
                onRechazar={handleRechazar}
              />
            )}
          </div>
        </div>
      )}

      <SolicitudModal
        solicitud={solicitudSeleccionada}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAceptar={handleAceptar}
        onRechazar={handleRechazar}
      />
    </div>
  );
}