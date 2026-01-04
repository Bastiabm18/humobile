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
import { SolicitudRespuesta, Solicitud } from "@/types/profile";

interface SolicitudesTablaProps {
  solicitudes: SolicitudRespuesta[];
  filtro: "todos" | "grupo" | "evento" | "booking";
  onVer: (solicitud: Solicitud) => void;
  onAceptar: (id: string, id_banda:string,tipo_invitacion:string) => void;
  onRechazar: (id: string) => void;
}

export default function SolicitudesTabla({
  solicitudes,
  filtro,
  onVer,
  onAceptar,
  onRechazar,
}: SolicitudesTablaProps) {
  const solicitudesFiltradas = filtro === "todos" ? solicitudes : solicitudes.filter((s) => s.tipo === filtro);

  console.log(solicitudesFiltradas)
  const getTipoConfig = (tipo: "grupo" | "evento" | "booking") => {
    switch (tipo) {
      case "grupo":
        return { icon: HiUserGroup, color: "bg-purple-600", label: "Invitación a grupo" };
      case "evento":
        return { icon: HiCalendar, color: "bg-blue-600", label: "Evento grupal" };
      case "booking":
        return { icon: HiOfficeBuilding, color: "bg-green-600", label: "Booking de local" };
    }
  };

  const getEstadoConfig = (estado: Solicitud["estado"]) => {
    switch (estado) {
      case "pendiente":
        return { color: "text-yellow-400", icon: HiClock };
      case "aceptada":
        return { color: "text-green-400", icon: HiCheckCircle };
      case "rechazada":
        return { color: "text-red-400", icon: HiXCircle };
      case "expirada":
        return { color: "text-gray-500", icon: HiExclamationCircle };
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-red-600/20 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-red-600/30">
             <th className="text-left p-6 font-medium text-red-300">Tipo</th>
             <th className="text-left p-6 font-medium text-red-300">Detalles</th>
             <th className="text-left p-6 font-medium text-red-300">Fecha Invitación</th>
             <th className="text-left p-6 font-medium text-red-300">Vencimiento</th> 
             <th className="text-left p-6 font-medium text-red-300">Estado</th>
             <th className="text-right p-6 font-medium text-red-300">Acción</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {solicitudesFiltradas.map((s, i) => {
                const tipo = getTipoConfig(s.tipo);
                const estado = getEstadoConfig(s.estado);
                const descripcion = s.descripcion || 'Sin descripción';
                const IconTipo = tipo.icon;
                const IconEstado = estado.icon;
                const horas = Math.round((s.fechaFin.getTime() - s.fechaInicio.getTime()) / 3600000);

                return (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-red-600/10 hover:bg-red-900/20 transition-all"
                  >
                  <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className={`${tipo.color} p-3 rounded-xl`}>
                              <IconTipo className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-medium">{tipo.label}</span>
                          </div>
                        </td>

                        <td className="p-6">
                          <p className="font-bold text-lg">{s.titulo}</p>
                          <p className="text-gray-400 text-sm">
                            {s.tipo_invitacion || 'Invitación'}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Banda: {s.nombre_banda?.slice(0, 14)}...
                          </p>
                        </td>

                        <td className="p-6">
                          <p className="font-medium">{format(s.fechaInicio, "dd MMM yyyy", { locale: es })}</p>
                          <p className="text-gray-400 text-sm">
                            Invitación: {format(s.fechaInicio, "HH:mm")}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Perfil: {s.nombre_artista?.slice(0, 10)}...
                          </p>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <HiClock className="w-5 h-5 text-yellow-400" />
                            <span className={s.estado === "expirada" ? "text-red-400" : "text-yellow-400"}>
                              {s.estado === "expirada"
                                ? "Expirada"
                                : formatDistanceToNow(s.plazoRespuesta, { addSuffix: true, locale: es })}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            Vence: {format(s.plazoRespuesta, "dd/MM HH:mm", { locale: es })}
                          </p>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <IconEstado className="w-6 h-6" />
                            <span className={estado.color}>
                              {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            {format(new Date(s.created_at), "dd/MM/yyyy")}
                          </p>
                        </td>


                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onVer(s)}
                          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition transform hover:scale-110"
                          title="Ver detalles"
                        >
                          <HiEye className="w-6 h-6 text-red-400" />
                        </button>

                        {s.estado === "pendiente" && (
                          <>
                            <button
                              onClick={() => onRechazar(s.id)}
                              title="rechazar"
                              className="px-2.5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition transform hover:scale-105"
                            >
                              <HiXCircle size={24}/>
                            </button>
                            <button
                              onClick={() => onAceptar(s.id, s.id_banda, s.origen_tabla)}
                              title="aceptar"
                              className="px-2.5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-medium transition transform hover:scale-105 shadow-lg"
                            >
                              <HiCheckCircle size={24}/>
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