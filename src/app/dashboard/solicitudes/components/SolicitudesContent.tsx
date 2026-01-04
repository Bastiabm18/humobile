// app/dashboard/solicitudes/components/SolicitudesContent.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
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
} from "react-icons/hi";
import { useState,useEffect } from "react";
import { Profile, Solicitud, SolicitudRespuesta } from "@/types/profile";
import SolicitudesTabla from "./SolicitudesTabla";
import { IoIosAdd } from "react-icons/io";
import { aceptarSolicitud, getSolicitudesByPerfiles, rechazarSolicitud } from "../actions/actions";
import { BiUserX } from "react-icons/bi";
import { BsCalendar3 } from "react-icons/bs";
import { FaArrowCircleLeft, FaArrowLeft } from "react-icons/fa";
import NeonSign from "@/app/components/NeonSign";

type TipoSolicitud = "grupo" | "evento" | "booking";


interface Props {
  initialProfiles: Profile[];
  userId: string;
  userName: string;
}

// ──────────────────────────────────────────────────────────────
// MODAL COMPONENTE (integrado directamente para que sea un solo archivo)
function SolicitudModal({
  solicitud,
  isOpen,
  onClose,
  onAceptar,
  onRechazar,
}: {
  solicitud: Solicitud;
  isOpen: boolean;
  onClose: () => void;
  onAceptar: (id: string, id_banda:string,tipo_invitacion:string) => void;
  onRechazar: (id: string) => void;
}) {
  if (!isOpen || !solicitud) return null;

  const tipoConfig = {
    grupo: { icon: HiUserGroup, color: "bg-purple-600", label: "Invitación a grupo" },
    evento: { icon: HiCalendar, color: "bg-blue-600", label: "Evento grupal" },
    booking: { icon: HiOfficeBuilding, color: "bg-green-600", label: "Booking de local" },
  }[solicitud.tipo];

  const IconTipo = tipoConfig.icon;
  const horas = Math.round((solicitud.fechaFin.getTime() - solicitud.fechaInicio.getTime()) / 3600000);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="bg-neutral-900 border border-red-600/40 rounded-2xl shadow-2xl shadow-red-900/60 max-w-2xl w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-900/60 to-black p-6 border-b border-red-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`${tipoConfig.color} p-4 rounded-xl`}>
                  <IconTipo className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{solicitud.titulo}</h2>
                  <p className="text-red-400 text-lg">{tipoConfig.label}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-900/60 rounded-xl transition"
              >
                <HiX className="w-7 h-7 text-red-400" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Creador</p>
                <p className="text-2xl font-bold text-white">{solicitud.creador}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duración</p>
                <p className="text-2xl font-bold text-red-400">{horas} horas</p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-3">Fecha y horario</p>
              <div className="bg-black/50 border border-red-600/30 rounded-xl p-6 text-center">
                <p className="text-3xl font-bold text-white">
                  {format(solicitud.fechaInicio, "EEEE dd MMMM yyyy", { locale: es })}
                </p>
                <p className="text-2xl text-red-400 mt-3">
                  {format(solicitud.fechaInicio, "HH:mm")} → {format(solicitud.fechaFin, "HH:mm")} hs
                </p>
              </div>
            </div>

            {solicitud.estado === "pendiente" && (
              <div className="flex items-center gap-3 text-yellow-400 bg-yellow-400/10 px-5 py-3 rounded-xl">
                <HiClock className="w-6 h-6" />
                <span className="font-bold">
                   plazo hasta el {format(solicitud.plazoRespuesta, "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
              </div>
            )}
          </div>

          {/* Footer - Botones */}
          {solicitud.estado === "pendiente" && (
            <div className="bg-black/70 border-t border-red-600/30 p-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  onRechazar(solicitud.id);
                  onClose();
                }}
                title="rechazar"
                className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-red-900/60"
              >
                <HiXCircle size={24} />
              </button>
              <button
                onClick={() => {
                  onAceptar(solicitud.id, solicitud.creador,solicitud.tipo);
                  onClose();
                }}
                title="aceptar"
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-green-900/60"
              >
                <HiCheckCircle size={24} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
export default function SolicitudesContent({ initialProfiles, userId, userName }: Props) {
  const [filtro, setFiltro] = useState<"todos" | TipoSolicitud>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);

  const [solicitudes, setSolicitudes] = useState<SolicitudRespuesta[]>([]);
 const [loading, setLoading] = useState(false);

 
   const [profiles, setProfiles] = useState(initialProfiles);
   const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

 // console.log(initialProfiles);
console.log(solicitudes);
  // Obtener IDs de perfiles artistas
  const perfilIds = selectedProfile
    ? [selectedProfile.id]
    : [];

    console.log(perfilIds)
      useEffect(() => {
    const cargarSolicitudes = async () => {
      if (perfilIds.length === 0) return;
      
      setLoading(true);
      try {
        const data = await getSolicitudesByPerfiles(perfilIds);
        setSolicitudes(data);

      } catch (error) {
        console.error('Error cargando solicitudes:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitudes();
  }, [selectedProfile]);

  const handleProfileClick = (profile: Profile) => {
    setSelectedProfile(profile);
    // NO llamar cargarSolicitudes() aquí - el useEffect ya lo hará
  };

    
  const solicitudesFiltradas = filtro === "todos" ? solicitudes : solicitudes.filter((s) => s.tipo === filtro);

  const handleAceptar = async (id: string, id_banda:string,origen_invitacion:string) => {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;
    
    console.log('id_soliitud=',id,'id_banda=', id_banda,origen_invitacion );
    const resultado = await aceptarSolicitud({ 
      id_solicitud: id,
      respuesta_solicitud: true,
      motivo: solicitud.tipo_invitacion,
      tipo: origen_invitacion,
      id_banda: solicitud.id_banda ,
      id_artista: solicitud.id_perfil
    });
    
  
    if (resultado.success) {
      setSolicitudes(prev => prev.map(s => 
        s.id === id ? { ...s, estado: "aceptada" } : s
      ));
      //alert(resultado.message);
    } else {
      alert(`Error: ${resultado.error}`);
    }
  };

  const handleRechazar  = async (id:string) => {
      const solicitud = solicitudes.find(s => s.id === id);
      if(!solicitud) return;
      console.log(id);
      const resultado = await rechazarSolicitud({
        id_solicitud: id,
        respuesta_solicitud: false,
        motivo: "rechazo",
        tipo:solicitud.tipo,
        id_banda: solicitud.id_banda ,
        id_artista: solicitud.id_perfil
      });


    if(resultado.success){
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, estado: "rechazada" } : s)));
    }else{
      alert(`Error: ${resultado.error}`);
    }
    
  };

  const handleVer = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setModalOpen(true);
  };

  const getTipoConfig = (tipo: TipoSolicitud) => {
    switch (tipo) {
      case "grupo": return { icon: HiUserGroup, color: "bg-purple-600", label: "Invitación a grupo" };
      case "evento": return { icon: HiCalendar, color: "bg-blue-600", label: "Evento grupal" };
      case "booking": return { icon: HiOfficeBuilding, color: "bg-green-600", label: "Booking de local" };
    }
  };

  const getEstadoConfig = (estado: Solicitud["estado"]) => {
    switch (estado) {
      case "pendiente": return { color: "text-yellow-400", icon: HiClock };
      case "aceptada": return { color: "text-green-400", icon: HiCheckCircle };
      case "rechazada": return { color: "text-red-400", icon: HiXCircle };
      case "expirada": return { color: "text-gray-500", icon: HiExclamationCircle };
    }
  };
  
  console.log('Initial Profiles:', selectedProfile);
   if (profiles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-400">No tienes perfiles creados aún</p>
        <p className="mt-4 text-gray-500">Ve a <strong>Mis Perfiles</strong> y crea uno</p>
      </div>
    );
  } 

  return (
  <div className="w-[90vw]  md:max-w-7xl flex flex-col mx-auto">
      <div className="text-4xl font-bold py-15 text-center text-white">
      <NeonSign/>
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
    <div className="w-[95%]  border border-neutral-500 rounded-2xl bg-neutral-900 text-white px-2 py-6">

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
      <div className=" w-[98%] p-1 md:p-4 md:max-w-7xl mx-auto">

        {/* Título */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
            Mis Solicitudes
          </h1>
          <p className="text-gray-300 text-lg">Gestiona invitaciones a grupos, eventos y otros</p>
        </motion.div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-8">
          {(["todos", "grupo", "evento"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f === "todos" ? "todos" : f)}
              className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                filtro === f ? "bg-red-600 shadow-lg shadow-red-600/50" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {f === "grupo" && <HiUserGroup />}
              {f === "evento" && <HiCalendar />}
              {f === "todos" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
     
        </div>

        {/* Tabla */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Cargando solicitudes...</p>
            </div>
          ) : (
            <SolicitudesTabla
              solicitudes={solicitudes}
              filtro={filtro}
              onVer={handleVer}
              onAceptar={handleAceptar}
              onRechazar={handleRechazar}
            />
          )}





      
      </div>      
    </div>

      )}

    {/* MODAL */}
        <SolicitudModal
          solicitud={solicitudSeleccionada!}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAceptar={handleAceptar}
          onRechazar={handleRechazar}
        />  
  </div>

  
  );
}