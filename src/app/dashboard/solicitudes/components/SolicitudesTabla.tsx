// app/dashboard/solicitudes/components/SolicitudesTabla.tsx
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
} from "react-icons/hi";
import { SolicitudRespuesta } from "@/types/profile";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoBanSharp } from "react-icons/io5";

interface SolicitudesTablaProps {
  solicitudes: SolicitudRespuesta[];
  onVer: (solicitud: SolicitudRespuesta) => void;
  onAceptar: (id: string,codigo_solicitud:string,id_evento_solicitud:string,invitado_id:string,creador_id:string) => void;
  onRechazar: (id: string,codigo_solicitud:string,id_evento_solicitud:string,invitado_id:string,creador_id:string) => void;
}

export default function SolicitudesTabla({
  solicitudes,
  onVer,
  onAceptar,
  onRechazar,
}: SolicitudesTablaProps) {
  const [filtroEstado, setFiltroEstado] = useState<string>("");

  // Filtrar por estado
  const solicitudesFiltradas = filtroEstado === "" 
    ? solicitudes 
    : solicitudes.filter((s) => s.estado === filtroEstado);

    console.log('SolicitudesTabla - Filtradas →', solicitudesFiltradas);

  const getTipoConfig = (codigo: string) => {
    switch (codigo) {
      case "invitacion_banda":
        return { icon: HiUserGroup, color: "border-l-4 border-l-purple-700", bg: "bg-purple-700/20", label: "Invitación a Banda" };
      case "invitacion_evento":
        return { icon: HiCalendar, color: "border-l-4 border-l-blue-700", bg: "bg-blue-700/20", label: "Invitación a Evento" };
      case "colaboracion":
        return { icon: HiOfficeBuilding, color: "border-l-4 border-l-emerald-700", bg: "bg-emerald-700/20", label: "Colaboración" };
      default:
        return { icon: HiCalendar, color: "border-l-4 border-l-gray-700", bg: "bg-gray-700/20", label: "Solicitud" };
    }
  };

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return { 
          color: "text-yellow-400", 
          icon: HiClock, 
          bg: "bg-yellow-400/10",
          border: "border-yellow-400/30"
        };
      case "aceptada":
        return { 
          color: "text-green-400", 
          icon: HiCheckCircle, 
          bg: "bg-green-400/10",
          border: "border-green-400/30"
        };
      case "rechazada":
        return { 
          color: "text-red-400", 
          icon: HiXCircle, 
          bg: "bg-red-400/10",
          border: "border-red-400/30"
        };
      case "expirada":
        return { 
          color: "text-gray-400", 
          icon: HiExclamationCircle, 
          bg: "bg-gray-400/10",
          border: "border-gray-400/30"
        };
      default:
        return { 
          color: "text-gray-400", 
          icon: HiClock, 
          bg: "bg-gray-400/10",
          border: "border-gray-400/30"
        };
    }
  };

  const isExpirada = (solicitud: SolicitudRespuesta) => {
    return solicitud.estado === "expirada" || 
      (solicitud.fecha_expiracion && new Date(solicitud.fecha_expiracion) < new Date());
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-neutral-300/20 overflow-hidden shadow-2xl">
      {/* Filtros de estado */}
      <div className="p-4 border-b border-gray-600/30">
        <div className="flex flex-wrap gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFiltroEstado("")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroEstado === "" 
                ? "bg-green-600/80 text-green-200" 
                : "bg-gray-800/80 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Todos ({solicitudes.length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFiltroEstado("pendiente")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroEstado === "pendiente" 
                ? "bg-yellow-600 text-white" 
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Pendientes ({solicitudes.filter(s => s.estado === "pendiente" && !isExpirada(s)).length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFiltroEstado("aceptada")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroEstado === "aceptada" 
                ? "bg-green-600 text-white" 
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Aceptadas ({solicitudes.filter(s => s.estado === "aceptada").length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFiltroEstado("rechazada")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroEstado === "rechazada" 
                ? "bg-red-600 text-white" 
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Rechazadas ({solicitudes.filter(s => s.estado === "rechazada").length})
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFiltroEstado("expirada")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroEstado === "expirada" 
                ? "bg-gray-600 text-white" 
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Expiradas ({solicitudes.filter(s => s.estado === "expirada").length})
          </motion.button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-600/30">
              <th className="text-left p-6 font-medium text-sky-300">Tipo</th>
              <th className="text-left p-6 font-medium text-sky-300">Detalles</th>
              <th className="text-left p-6 font-medium text-sky-300">Fecha Creación</th>
              <th className="text-left p-6 font-medium text-sky-300">Expiración</th>
              <th className="text-left p-6 font-medium text-sky-300">Estado</th>
              <th className="text-right p-6 font-medium text-sky-300">Acción</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {solicitudesFiltradas.map((s, i) => {
                const tipo = getTipoConfig(s.codigo_solicitud);
                const estado = getEstadoConfig(s.estado);
                const IconTipo = tipo.icon;
                const IconEstado = estado.icon;
                const expirada = isExpirada(s);

                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: i * 0.05 }}
                    className={`border-b border-neutral-600/10 hover:bg-neutral-600/20 transition-all ${tipo.color}`}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`${tipo.bg} p-3 rounded-xl`}>
                          <IconTipo className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">{tipo.label}</span>
                          <p className="text-gray-400 text-sm">{s.codigo_solicitud}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-6">
                      <p className="font-bold text-lg">{s.nombre_solicitud}</p>

                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-700/30 rounded text-blue-300">
                          Creador: {s.creador_nombre} ({s.creador_tipo})
                        </span>
                        { (s.es_invitacion_banda && s.nombre_banda_asociada!='')? (
                        <span className="text-xs px-2 py-1 bg-purple-700/30 rounded text-purple-300">
                          Invitado: {s.nombre_banda_asociada} 
                        </span>
                        ):(<>
                        <span className="text-xs px-2 py-1 bg-purple-700/30 rounded text-purple-300">
                          Invitado: {s.invitado_nombre} 
                        </span>

                        </>)}
                      </div>
                      {s.evento_titulo && (
                 <div className=" w-auto p-2 bg-neutral-500 uppercase mt-2">
                        <p className="text-xs text-emerald-400 mt-2 uppercase">
                          Evento: {s.evento_titulo}
                        </p>

                                    

                      {s.evento_fecha_inicio && (
                        <p className="text-xs text-neutral-100 mt-2"> 
                          Desde: {format(s.evento_fecha_inicio, "dd/MM/yyyy HH:mm", { locale: es })} 
                          </p>)}
                       {s.evento_fecha_fin && (
                         <p className="text-xs text-neutral-100 mt-2">
                          Hasta : {format(s.evento_fecha_fin, "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                       )}   
                       </div>
                      )}
        
                    </td>

                    <td className="p-6">
                      <p className="font-medium">{format(s.fecha_creacion, "dd MMM yyyy", { locale: es })}</p>
                      <p className="text-gray-400 text-sm">
                        {format(s.fecha_creacion, "HH:mm", { locale: es })}
                      </p>
                    </td>

                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <HiClock className={`w-5 h-5 ${expirada ? 'text-red-400' : 'text-yellow-400'}`} />
                        <span className={expirada ? "text-red-400" : "text-yellow-400"}>
                          {expirada
                            ? "Expirada"
                            : s.fecha_expiracion 
                              ? formatDistanceToNow(s.fecha_expiracion, { addSuffix: true, locale: es })
                              : "Sin fecha"}
                        </span>
                      </div>
                      {s.fecha_expiracion && (
                        <p className="text-gray-400 text-xs mt-1">
                          Vence: {format(s.fecha_expiracion, "dd/MM HH:mm", { locale: es })}
                        </p>
                      )}
                    </td>

                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <IconEstado className="w-6 h-6" />
                        <span className={estado.color}>
                          {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                        </span>
                      </div>
                      {s.motivo_rechazo && (
                        <p className="text-gray-400 text-xs mt-2">
                          {s.motivo_rechazo.slice(0, 40)}...
                        </p>
                      )}
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onVer(s)}
                          className="px-3 py-3 flex flex-row items-center justify-center gap-2 text-blue-400 bg-gray-500/70 hover:bg-gray-700 border-gray-900 border-3 rounded-full transition transform hover:scale-110"
                          title="Ver detalles"
                        >
                          <HiEye className="w-6 h-6 " />
                        </button>

                        {s.estado === "pendiente" && !expirada && (
                          <>
                            <button
                              onClick={() => onRechazar(s.id,s.codigo_solicitud,s.id_evento_solicitud,s.invitado_id,s.creador_id)}
                              className="px-3 flex flex-row items-center justify-center gap-2 py-2.5 bg-red-500/70 text-red-200 hover:bg-red-700 border-red-900 border-3 rounded-full font-medium transition transform hover:scale-105"
                              title="Rechazar"
                           >
                              
                              <IoBanSharp />
                            </button>
                            <button
                              onClick={() => onAceptar(s.id,s.codigo_solicitud,s.id_evento_solicitud,s.invitado_id,s.creador_id)}
                              className="px-3 flex rounded-full flex-row items-center justify-center gap-2 py-2.5 bg-green-600/80 border-green-900 border-3 text-green-200 font-medium transition transform hover:scale-105 shadow-lg"
                              title="Aceptar"
                           >
                              <FaCheck/> 
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {solicitudesFiltradas.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl">No tienes solicitudes con este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}