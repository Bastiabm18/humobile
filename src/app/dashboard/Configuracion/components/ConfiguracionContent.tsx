'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQuestionCircle,
  FaTable,
  FaUsers,
  FaBell,
  FaPalette,
  FaCog,
  FaDatabase,
  FaCalendarAlt,
  FaFileAlt,
  FaShieldAlt,
  FaCreditCard
} from 'react-icons/fa';
import ModalPreguntasFrecuentes from './ModalPreguntasFrecuentes';
import ModalGestionUsuarios from './ModalGestionUsuarios';

interface ConfiguracionContentProps {
  userData:UserData[];
}

type TipoSeccion = 
  | 'preguntas_frecuentes' 
  | 'tablas_configuracion' 
  | 'gestion_usuarios' 
  | 'notificaciones' 
  | 'apariencia' 
  | 'configuracion_general'
  | 'respaldo_datos'
  | 'calendario'
  | 'reportes'
  | 'seguridad'
  | 'pagos';


interface UserData {
  uid: string;
  role: string;
  name: string;
  email:string;
  membresia: [];
}
export default function ConfiguracionContent({ 
 userData
}: ConfiguracionContentProps) {
  const [profile, setProfile] = useState(userData);
  const [seccionActiva, setSeccionActiva] = useState<TipoSeccion | null>(null);
  const [mostrarModalPreguntas, setMostrarModalPreguntas] = useState(false);
  const [mostrarModalGestionUsuario, setMostrarModalGestionUsuario] = useState(false);

  const secciones = [
    {
      id: 'preguntas_frecuentes' as TipoSeccion,
      titulo: 'Preguntas Frecuentes',
      icono: <FaQuestionCircle />,
      colorIcono: 'text-red-600 hover:text-red-700',
      colorFondo: 'hover:bg-red-50 dark:hover:bg-red-900/20'
    },
    {
      id: 'tablas_configuracion' as TipoSeccion,
      titulo: 'Tablas Configuración',
      icono: <FaTable />,
      colorIcono: 'text-blue-600 hover:text-blue-700',
      colorFondo: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      id: 'gestion_usuarios' as TipoSeccion,
      titulo: 'Gestión Usuarios',
      icono: <FaUsers />,
      colorIcono: 'text-sky-600 hover:text-sky-700',
      colorFondo: 'hover:bg-sky-50 dark:hover:bg-sky-900/20'
    },
    {
      id: 'notificaciones' as TipoSeccion,
      titulo: 'Notificaciones',
      icono: <FaBell />,
      colorIcono: 'text-yellow-600 hover:text-yellow-700',
      colorFondo: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
    },
    {
      id: 'apariencia' as TipoSeccion,
      titulo: 'Apariencia',
      icono: <FaPalette />,
      colorIcono: 'text-purple-600 hover:text-purple-700',
      colorFondo: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
    },
    {
      id: 'configuracion_general' as TipoSeccion,
      titulo: 'Configuración General',
      icono: <FaCog />,
      colorIcono: 'text-green-600 hover:text-green-700',
      colorFondo: 'hover:bg-green-50 dark:hover:bg-green-900/20'
    },
    {
      id: 'respaldo_datos' as TipoSeccion,
      titulo: 'Respaldo Datos',
      icono: <FaDatabase />,
      colorIcono: 'text-amber-600 hover:text-amber-700',
      colorFondo: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
    },
    {
      id: 'calendario' as TipoSeccion,
      titulo: 'Configuración Calendario',
      icono: <FaCalendarAlt />,
      colorIcono: 'text-pink-600 hover:text-pink-700',
      colorFondo: 'hover:bg-pink-50 dark:hover:bg-pink-900/20'
    },
    {
      id: 'reportes' as TipoSeccion,
      titulo: 'Reportes',
      icono: <FaFileAlt />,
      colorIcono: 'text-indigo-600 hover:text-indigo-700',
      colorFondo: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
    },
    {
      id: 'seguridad' as TipoSeccion,
      titulo: 'Seguridad',
      icono: <FaShieldAlt />,
      colorIcono: 'text-cyan-600 hover:text-cyan-700',
      colorFondo: 'hover:bg-cyan-50 dark:hover:bg-cyan-900/20'
    },
    {
      id: 'pagos' as TipoSeccion,
      titulo: 'Configuración Pagos',
      icono: <FaCreditCard />,
      colorIcono: 'text-lime-600 hover:text-lime-700',
      colorFondo: 'hover:bg-lime-50 dark:hover:bg-lime-900/20'
    }
  ];

  const manejarClickSeccion = (seccionId: TipoSeccion) => {
    setSeccionActiva(seccionId);
    
    // Ejemplo: Para la sección de preguntas frecuentes, abrir modal
    if (seccionId === 'preguntas_frecuentes') {
      setMostrarModalPreguntas(true);
    }
    
  
    if (seccionId === 'gestion_usuarios') {
      setMostrarModalGestionUsuario(true);
    }
  };

  const cerrarModalPreguntas = () => {
    setMostrarModalPreguntas(false);
  
    setSeccionActiva(null);
  };

  const cerrarModalGestionUsuario = () => {
 
    setMostrarModalGestionUsuario(false);
    setSeccionActiva(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-4">
      {/* Título */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Panel de Configuración
        </h1>
        <p className="text-neutral-400">
          Administra todas las configuraciones del sistema
        </p>
      </div>

      {/* Grid de Botones */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {secciones.map((seccion) => (
            <motion.button
              key={seccion.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => manejarClickSeccion(seccion.id)}
              className={`
                flex flex-col items-center justify-center 
                p-6 rounded-xl 
                bg-neutral-800 
                border border-neutral-700
                transition-all duration-200
                ${seccionActiva === seccion.id 
                  ? 'ring-2 ring-blue-500 bg-neutral-700' 
                  : 'hover:ring-1 hover:ring-neutral-500'
                }
                ${seccion.colorFondo}
              `}
            >
              <div className={`text-4xl mb-3 transition-colors ${seccion.colorIcono}`}>
                {seccion.icono}
              </div>
              <span className="text-sm font-medium text-white text-center">
                {seccion.titulo}
              </span>
              
              {seccionActiva === seccion.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 w-2 h-2 rounded-full bg-blue-500"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Área para mostrar componente activo */}
        <AnimatePresence>
          {seccionActiva && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 p-6 bg-neutral-800 rounded-xl border border-neutral-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {secciones.find(s => s.id === seccionActiva)?.titulo}
                </h2>
                <button
                  onClick={() => setSeccionActiva(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  Cerrar
                </button>
              </div>
              
              <div className="text-neutral-300">
                {/* Aquí se renderizarán los componentes según la sección activa */}
                <p>Componente para: {secciones.find(s => s.id === seccionActiva)?.titulo}</p>
                <p className="text-sm text-neutral-400 mt-2">
                  Este componente se desarrollará en el archivo correspondiente
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instrucciones */}
        <div className="mt-8 text-center text-neutral-400 text-sm">
          <p>Selecciona una categoría para administrar su configuración</p>
        </div>
      </div>

      {/* Modal de Preguntas Frecuentes */}
      <ModalPreguntasFrecuentes
        estaAbierto={mostrarModalPreguntas}
        alCerrar={cerrarModalPreguntas}
      />
      <ModalGestionUsuarios
        estaAbierto={mostrarModalGestionUsuario}
        alCerrar={cerrarModalGestionUsuario}
      />
    </div>
  );
}