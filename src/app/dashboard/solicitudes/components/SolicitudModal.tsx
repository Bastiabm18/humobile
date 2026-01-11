// app/dashboard/solicitudes/components/SolicitudModal.tsx
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
  HiX,
} from "react-icons/hi";
import { SolicitudRespuesta } from "@/types/profile";

interface SolicitudModalProps {
  solicitud: SolicitudRespuesta | null;
  isOpen: boolean;
  onClose: () => void;
  onAceptar: (id: string,codigo_solicitud:string,id_evento_solicitud:string,invitado_id:string) => void;
  onRechazar: (id: string,codigo_solicitud:string,id_evento_solicitud:string,invitado_id:string) => void;
}

export default function SolicitudModal({
  solicitud,
  isOpen,
  onClose,
  onAceptar,
  onRechazar,
}: SolicitudModalProps) {
  if (!isOpen || !solicitud) return null;

  const getTipoConfig = (codigo: string) => {
    switch (codigo) {
      case "invitacion_banda":
        return { icon: HiUserGroup, color: "bg-purple-600", label: "Invitación a Banda" };
      case "invitacion_evento":
        return { icon: HiCalendar, color: "bg-blue-600", label: "Evento" };
      case "colaboracion":
        return { icon: HiOfficeBuilding, color: "bg-green-600", label: "Colaboración" };
      default:
        return { icon: HiCalendar, color: "bg-gray-600", label: "Solicitud" };
    }
  };

  const tipoConfig = getTipoConfig(solicitud.codigo_solicitud);
  const IconTipo = tipoConfig.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/80 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="bg-neutral-800   rounded-xl  max-w-2xl w-full">
          <div className=" bg-neutral-900/80 p-6 border-b border-blue-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`${tipoConfig.color} p-4 rounded-xl`}>
                  <IconTipo className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{solicitud.nombre_solicitud}</h2>
                  <p className="text-blue-400 text-lg">{tipoConfig.label}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-blue-900/60 rounded-xl transition">
                <HiX className="w-7 h-7 text-blue-400" />
              </button>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Creador</p>
                <p className="text-2xl font-bold text-white">
                  {solicitud.creador_nombre} ({solicitud.creador_tipo})
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Invitado</p>
                <p className="text-2xl font-bold text-blue-400">
                  {solicitud.invitado_nombre} ({solicitud.invitado_tipo})
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm mb-2">Descripción</p>
              <p className="text-white text-lg">{solicitud.descripcion_solicitud}</p>
            </div>

            {solicitud.evento_titulo && (
              <div className="bg-neutral-900/90 border border-neutral-700 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Evento asociado</p>
                <p className="text-2xl font-bold text-white">{solicitud.evento_titulo}</p>
                {solicitud.evento_fecha_inicio && (
                  <p className="text-blue-400 mt-2">
                    {format(solicitud.evento_fecha_inicio, "dd/MM/yyyy HH:mm")}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Fecha creación</p>
                <p className="text-white font-medium">
                  {format(solicitud.fecha_creacion, "dd/MM/yyyy HH:mm", { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fecha expiración</p>
                <p className="text-white font-medium">
                  {solicitud.fecha_expiracion 
                    ? format(solicitud.fecha_expiracion, "dd/MM/yyyy HH:mm", { locale: es })
                    : "Sin fecha"}
                </p>
              </div>
            </div>

            {solicitud.estado === "pendiente" && (
              <div className="flex items-center gap-3 text-yellow-400 bg-yellow-400/10 px-5 py-3 rounded-xl">
                <HiClock className="w-6 h-6" />
                <span className="font-bold">
                  Plazo hasta: {format(solicitud.plazoRespuesta, "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
              </div>
            )}
          </div>
          {solicitud.estado === "pendiente" && (
            <div className="bg-neutral-950/90 border-t border-blue-600/30 p-6 flex justify-center gap-4">
              <button
                onClick={() => {
                  onRechazar(solicitud.id,solicitud.codigo_solicitud,solicitud.id_evento_solicitud,solicitud.invitado_id);
                  onClose();
                }}
                title="rechazar"
                className="px-8 py-4  gap-1 flex items-center justify-center flex-row bg-red-600/60 border-red-800 border-2 hover:bg-red-700 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-red-900/60"
              >
                <HiXCircle size={24} />
                Rechazar
              </button>
              <button
                onClick={() => {
                  onAceptar(solicitud.id,solicitud.codigo_solicitud,solicitud.id_evento_solicitud,solicitud.invitado_id);
                  onClose();
                }}
                title="aceptar"
                className="px-8 py-4 gap-1 flex items-center justify-center flex-row border-green-800 border-2 bg-green-600/70 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-lg shadow-green-900/60"
              >
                <HiCheckCircle size={24} />
                Aceptar
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}