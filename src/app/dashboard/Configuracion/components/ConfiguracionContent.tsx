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
  FaCreditCard,
  FaCrown
} from 'react-icons/fa';
import ModalPreguntasFrecuentes from './ModalPreguntasFrecuentes';
import ModalGestionUsuarios from './ModalGestionUsuarios';
import { FaUserAstronaut } from 'react-icons/fa6';
import { TipoSeccion, User } from '@/types/profile';
import ModalGestionCategorias from './ModalGestionCategorias';
import ModalGestorPermisos from './ModalGestorPermisos';
import { RiPassValidLine } from 'react-icons/ri';
import ModalGestionPrecioMembresia from './ModalGestionPrecioMembresia';

interface ConfiguracionContentProps {
  userData:User[];
}




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
  const [mostrarModalGestorPerfil, setMostrarModalGestorPerfil] = useState(false);
  const [mostrarModalGestorPermisos, setMostrarModalGestorPermisos] = useState(false);
  const [mostrarModalMembresia, setMostrarModalMembresia] = useState(false);

  const secciones = [
    {
      id: 'preguntas_frecuentes' as TipoSeccion,
      titulo: 'Preguntas Frecuentes',
      icono: <FaQuestionCircle />,
      colorIcono: 'text-red-600 hover:text-red-700',
      colorFondo: 'hover:bg-red-900/20'
    },
    {
      id: 'gestor_perfil' as TipoSeccion,
      titulo: 'Gestor Categorias',
      icono: <FaUserAstronaut />,
      colorIcono: 'text-orange-600 hover:text-orange-700',
      colorFondo: 'hover:bg-orange-900/20'
    },
    {
      id: 'gestor_permisos' as TipoSeccion,
      titulo: 'Gestor Permisos',
      icono: <RiPassValidLine />,
      colorIcono: 'text-purple-600 hover:text-purple-700',
      colorFondo: 'hover:bg-purple-900/20'
    },
    {
      id: 'tablas_configuracion' as TipoSeccion,
      titulo: 'Tablas Configuración',
      icono: <FaTable />,
      colorIcono: 'text-blue-600 hover:text-blue-700',
      colorFondo: 'hover:bg-blue-900/20'
    },
    {
      id: 'gestion_usuarios' as TipoSeccion,
      titulo: 'Gestión Usuarios',
      icono: <FaUsers />,
      colorIcono: 'text-sky-600 hover:text-sky-700',
      colorFondo: 'hover:bg-sky-900/20'
    },
    {
      id: 'notificaciones' as TipoSeccion,
      titulo: 'Notificaciones',
      icono: <FaBell />,
      colorIcono: 'text-yellow-600 hover:text-yellow-700',
      colorFondo: 'hover:bg-yellow-900/20'
    },
    {
      id: 'apariencia' as TipoSeccion,
      titulo: 'Apariencia',
      icono: <FaPalette />,
      colorIcono: 'text-purple-600 hover:text-purple-700',
      colorFondo: 'hover:bg-purple-900/20'
    },
    {
      id: 'configuracion_general' as TipoSeccion,
      titulo: 'Configuración General',
      icono: <FaCog />,
      colorIcono: 'text-green-600 hover:text-green-700',
      colorFondo: 'hover:bg-green-900/20'
    },
    {
      id: 'respaldo_datos' as TipoSeccion,
      titulo: 'Respaldo Datos',
      icono: <FaDatabase />,
      colorIcono: 'text-amber-600 hover:text-amber-700',
      colorFondo: 'hover:bg-amber-900/20'
    },
    {
      id: 'calendario' as TipoSeccion,
      titulo: 'Configuración Calendario',
      icono: <FaCalendarAlt />,
      colorIcono: 'text-pink-600 hover:text-pink-700',
      colorFondo: 'hover:bg-pink-900/20'
    },
    {
      id: 'reportes' as TipoSeccion,
      titulo: 'Reportes',
      icono: <FaFileAlt />,
      colorIcono: 'text-indigo-600 hover:text-indigo-700',
      colorFondo: 'hover:bg-indigo-900/20'
    },
    {
      id: 'seguridad' as TipoSeccion,
      titulo: 'Seguridad',
      icono: <FaShieldAlt />,
      colorIcono: 'text-cyan-600 hover:text-cyan-700',
      colorFondo: 'hover:bg-cyan-900/20'
    },
    {
      id: 'pagos' as TipoSeccion,
      titulo: 'Configuración Pagos',
      icono: <FaCreditCard />,
      colorIcono: 'text-lime-600 hover:text-lime-700',
      colorFondo: 'hover:bg-lime-900/20'
    },
       {
      id: 'precios_membresia' as TipoSeccion, 
      titulo: 'Membresías',
      icono: <FaCrown />,
      colorIcono: 'text-yellow-500 hover:text-yellow-400',
      colorFondo: 'hover:bg-yellow-900/20'
    }
  ];

  const manejarClickSeccion = (seccionId: TipoSeccion) => {
    setSeccionActiva(seccionId);
    
    // Ejemplo: Para la sección de preguntas frecuentes, abrir modal
    if (seccionId === 'preguntas_frecuentes') {
      setMostrarModalPreguntas(true);
    }
        if (seccionId === 'precios_membresia') {
      setMostrarModalMembresia(true);
    }
    
  
    if (seccionId === 'gestion_usuarios') {
      setMostrarModalGestionUsuario(true);
    }

    if (seccionId === 'gestor_perfil') {

      setMostrarModalGestorPerfil(true);
    }
    if (seccionId === 'gestor_permisos') {
      setMostrarModalGestorPermisos(true);
    }
  };

  const cerrarModalGestorPerfil = () => {
    setMostrarModalGestorPerfil(false);
  };
  const cerrarModalGestorPermisos = () => {
    setMostrarModalGestorPermisos(false);
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

      <ModalGestionCategorias
        estaAbierto={mostrarModalGestorPerfil}
        alCerrar={cerrarModalGestorPerfil}
      />

      <ModalGestorPermisos
        estaAbierto={mostrarModalGestorPermisos}
        alCerrar={cerrarModalGestorPermisos}
      />

        <ModalGestionPrecioMembresia
        estaAbierto={mostrarModalMembresia}
        alCerrar={() => {
          setMostrarModalMembresia(false);
          setSeccionActiva(null);
        }}
      />
    </div>
  );
}