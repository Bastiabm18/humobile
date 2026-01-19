'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiCalendar, HiClock, HiMap, HiUser, HiOutlineTicket, HiOutlineUserGroup } from 'react-icons/hi';
import { FaInstagram } from 'react-icons/fa';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EventoCalendario } from '@/types/profile';

interface EventoModalProps {
  evento: EventoCalendario;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventoModal({ evento, isOpen, onClose }: EventoModalProps) {
  if (!isOpen || !evento) return null;

  // Formatear fechas con la data nueva
  const start = new Date(evento.inicio);
  const end = evento.fin ? new Date(evento.fin) : new Date(evento.inicio);
  
  const fecha = format(start, "EEEE d 'de' MMMM yyyy", { locale: es });
  const horaInicio = format(start, "HH:mm");
  const horaFin = format(end, "HH:mm");

  // Mapeo de variables manteniendo la estructura anterior
  const lugar = evento.nombre_lugar || evento.direccion_lugar || 'Por confirmar';
  const flyerUrl = evento.flyer_url || '';
  const descripcion = evento.descripcion || '';
  
  // Datos adicionales
  const hasTickets = !!evento.tickets_evento;
  const hasInstagram = !!evento.video_url;
  const hasParticipants = true; // Se mantiene por UI
  const organizer = evento.nombre_creador || 'Organizador';

  return (
    <AnimatePresence>
      {/* Backdrop suave */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/80 backdrop-blur-md z-50"
      />

      {/* Modal elegante */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="
          bg-gradient-to-b from-neutral-800/95 to-neutral-900/95 
          border border-neutral-700/50 
          rounded-2xl 
          shadow-2xl shadow-black/30
          max-w-4xl w-full 
          max-h-[90vh] 
          overflow-hidden
          backdrop-blur-xl
        ">
          
          {/* Header sutil */}
          <div className="
            bg-gradient-to-r from-neutral-800/80 to-neutral-900/80 
            p-6 border-b border-neutral-700/30
            backdrop-blur-sm
          ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icono elegante */}
                <motion.div 
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="
                    bg-gradient-to-br from-neutral-700 to-neutral-800
                    p-3 rounded-xl
                    border border-neutral-600/50
                    shadow-inner
                  "
                >
                  <HiCalendar className="w-7 h-7 text-neutral-300" />
                </motion.div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {evento.titulo}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="
                      px-3 py-1 
                      bg-neutral-700/50 
                      text-neutral-300 
                      text-sm 
                      rounded-full
                      border border-neutral-600/50
                      backdrop-blur-sm
                    ">
                      {evento.nombre_categoria?.toLowerCase().includes('show') ? '🎵 Concierto' : '🤝 Evento'}
                    </span>
                    {organizer && (
                      <span className="text-neutral-400 text-sm flex items-center gap-1">
                        <HiUser className="w-3 h-3" />
                        {organizer}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Botón de cerrar elegante */}
              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="
                  p-2 
                  hover:bg-neutral-700/50 
                  rounded-xl 
                  transition-all
                  border border-transparent
                  hover:border-neutral-600/30
                  group
                "
              >
                <HiX className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
              </motion.button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Columna izquierda - Imagen con efectos */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                {flyerUrl ? (
                  <div className="relative group">
                    <img 
                      src={flyerUrl} 
                      alt={evento.titulo}
                      className="
                        w-full h-80 
                        object-cover 
                        rounded-xl 
                        border border-neutral-700
                        shadow-lg
                        group-hover:shadow-2xl
                        transition-all duration-500
                      "
                    />
                    {/* Overlay sutil en hover */}
                    <div className="
                      absolute inset-0 
                      bg-gradient-to-t from-black/20 to-transparent 
                      rounded-xl
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-300
                    " />
                  </div>
                ) : (
                  <div className="
                    w-full h-80 
                    bg-gradient-to-br from-neutral-800 to-neutral-900 
                    rounded-xl 
                    border border-neutral-700
                    flex flex-col items-center justify-center
                    shadow-inner
                  ">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <HiCalendar className="w-24 h-24 text-neutral-600/70" />
                    </motion.div>
                    <p className="mt-4 text-neutral-500 text-sm">
                      Sin imagen del evento
                    </p>
                  </div>
                )}
                
                {/* Estadísticas de participación (Simuladas como estaban antes) */}
                {hasParticipants && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="
                      mt-4 
                      p-4 
                      bg-neutral-800/50 
                      rounded-xl 
                      border border-neutral-700/50
                      backdrop-blur-sm
                    "
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HiOutlineUserGroup className="w-5 h-5 text-neutral-400" />
                        <span className="text-neutral-300 text-sm">Participantes</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-green-400 font-bold">
                           0
                          </div>
                          <div className="text-xs text-neutral-500">Confirmados</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold">
                           0
                          </div>
                          <div className="text-xs text-neutral-500">Pendientes</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Columna derecha - Información detallada */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-6"
              >
                {/* Fecha y hora */}
                <div className="
                  p-4 
                  bg-neutral-800/30 
                  rounded-xl 
                  border border-neutral-700/30
                ">
                  <h3 className="
                    text-lg font-semibold 
                    text-white mb-4
                    flex items-center gap-2
                  ">
                    <HiCalendar className="w-5 h-5 text-neutral-400" />
                    Fecha y Hora
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="
                        w-10 h-10 
                        bg-neutral-700/50 
                        rounded-lg 
                        flex items-center justify-center
                      ">
                        <span className="text-neutral-300 font-medium">
                          {format(start, "dd")}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{fecha}</div>
                        <div className="text-neutral-400 text-sm">
                          {horaInicio} - {horaFin}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lugar */}
                <div className="
                  p-4 
                  bg-neutral-800/30 
                  rounded-xl 
                  border border-neutral-700/30
                ">
                  <h3 className="
                    text-lg font-semibold 
                    text-white mb-3
                    flex items-center gap-2
                  ">
                    <HiMap className="w-5 h-5 text-neutral-400" />
                    Lugar
                  </h3>
                  <p className="text-neutral-300">{lugar}</p>
                </div>

                {/* Descripción */}
                {descripcion && (
                  <div className="
                    p-4 
                    bg-neutral-800/30 
                    rounded-xl 
                    border border-neutral-700/30
                  ">
                    <h3 className="
                      text-lg font-semibold 
                      text-white mb-3
                    ">
                      Descripción
                    </h3>
                    <p className="text-neutral-300 leading-relaxed">
                      {descripcion}
                    </p>
                  </div>
                )}

                {/* Links y acciones */}
                <div className="flex flex-wrap gap-3">
                  {hasTickets && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={evento.tickets_evento || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex items-center gap-2
                        px-4 py-3
                        bg-gradient-to-r from-neutral-700 to-neutral-800
                        hover:from-neutral-600 hover:to-neutral-700
                        text-white
                        rounded-lg
                        transition-all
                        border border-neutral-600/50
                        flex-1 min-w-[140px]
                      "
                    >
                      <HiOutlineTicket className="w-5 h-5" />
                      <span>Entradas</span>
                    </motion.a>
                  )}
                  
                  {hasInstagram && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={evento.video_url || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex items-center gap-2
                        px-4 py-3
                        bg-gradient-to-r from-neutral-700 to-neutral-800
                        hover:from-neutral-600 hover:to-neutral-700
                        text-white
                        rounded-lg
                        transition-all
                        border border-neutral-600/50
                        flex-1 min-w-[140px]
                      "
                    >
                      <FaInstagram className="w-5 h-5" />
                      <span>Instagram</span>
                    </motion.a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer minimalista */}
          <div className="
            border-t border-neutral-700/30 
            p-4 
            bg-neutral-900/50
            backdrop-blur-sm
          ">
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="
                  px-6 py-2 
                  bg-neutral-700 
                  hover:bg-neutral-600
                  text-white 
                  rounded-lg 
                  font-medium 
                  transition-all
                  border border-neutral-600/50
                "
              >
                Cerrar
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}