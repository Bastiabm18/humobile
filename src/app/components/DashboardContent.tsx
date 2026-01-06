'use client';

import { ReactElement, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaHome, 
  FaComment, 
  FaChartBar, 
  FaQuestion, 
  FaUserCircle,
  FaChevronRight,
  FaCrown
} from 'react-icons/fa';
import { 
  BsSignpostSplit, 
  BsBackspace,
  BsLightningFill,
  BsStars,
  BsCheckCircle,
  BsArrowRightCircle
} from "react-icons/bs";
import { 
  MdMenuBook, 
  MdOutlinePostAdd,
  MdOutlineGridView,
  MdEventAvailable,
  MdOutlinePersonPin
} from "react-icons/md";
import { AiFillSetting } from 'react-icons/ai';
import { RiCustomerService2Fill, RiDashboardFill } from "react-icons/ri";
import { HiCube } from "react-icons/hi";
import { GiCube } from "react-icons/gi";
import { TbCube, TbMessageQuestion } from "react-icons/tb";
import { MENU_ITEMS } from '../constants/menu';
import { UserRole } from '@/types/role';
import { BiCalendarCheck, BiCubeAlt } from 'react-icons/bi';
import { DiSpark } from 'react-icons/di';
import { CgNotifications } from 'react-icons/cg';
import { useRouter } from 'next/navigation';

interface MenuItem {
  name: string;
  path: string;
  icon: ReactElement;
  role: UserRole;
}

interface DashboardContentProps {
  userName?: string | null;
  userRole?: UserRole;
 userMembresia?: 
    {
      nombre_membresia: string;
      estado_membresia: string;
      fecha_ini_membresia: string;
      fecha_fin_membresia: string;
      precio_membresia: number;
      id: number;

    }
  
}

// Iconos adicionales para cada item del menú
const additionalIcons = [
  <BsStars className="text-blue-500" key="star" />,
  <BsCheckCircle className="text-emerald-500" key="check" />,
  <BsArrowRightCircle className="text-sky-500" key="arrow" />,
  <HiCube className="text-indigo-500" key="cube1" />,
  <GiCube className="text-violet-500" key="cube2" />,
  <TbCube className="text-cyan-500" key="cube3" />,
  <BiCubeAlt className="text-blue-400" key="cube4" />
];

export default function DashboardContent({ userName, userRole, userMembresia }: DashboardContentProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [usuarioMembresia, setUsuarioMembresia] = useState<string | null>(null);

  useEffect(() => {
    if (userMembresia) {
      setUsuarioMembresia(userMembresia.nombre_membresia);
    }
  }, [userMembresia]);
  
    const dias = userMembresia?.fecha_fin_membresia && userMembresia?.fecha_ini_membresia
    ? Math.ceil((new Date(userMembresia.fecha_fin_membresia).getTime() - new Date(userMembresia.fecha_ini_membresia).getTime()) / (1000 * 3600 * 24))
    : 0;
  console.log('membresia content', usuarioMembresia)
  const router = useRouter()
  const menuItems = MENU_ITEMS.filter(item => 
    userRole && item.role.includes(userRole)
  );

  // Mapeo de iconos para cada opción del menú
  const getMenuIcon = (index: number) => {
    const iconMap: { [key: string]: ReactElement } = {
      'inicio': <FaHome className="text-neutral-500/30 text-4xl" />,
      'perfiles': <FaUserCircle className="text-neutral-500/30 text-4xl" />,
      'eventos': <MdEventAvailable className="text-neutral-500/30 text-4xl" />,
      'agenda': <MdMenuBook  className="text-neutral-500/30 text-4xl" />,
      'config': <AiFillSetting className="text-neutral-500/30 text-4xl" />,
      'preguntas frecuentes': <FaQuestion className="text-neutral-400/30 text-4xl" />,
      'solicitudes': <TbMessageQuestion className="text-neutral-500/30 text-4xl" />,
      'cuenta': <MdOutlinePersonPin className="text-neutral-400/30 text-4xl" />,
      'salir': <BsBackspace className="text-neutral-400/30 text-4xl" />,

    };

    // Buscar por nombre del item
    const itemName = menuItems[index]?.name.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (itemName.includes(key)) {
        return icon;
      }
    }

    // Si no encuentra coincidencia, usar icono adicional por índice
    return additionalIcons[index % additionalIcons.length];
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br  from-neutral-900 via-neutral-800 to-neutral-900 p-6 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-500/10 to-sky-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500/10 to-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl text-gray-200 md:text-5xl font-bold bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 bg-clip-text">
                Bienvenido, <span className="text-blue-400">{userName || 'Usuario'}</span>!
              </h1>
              <p className="text-neutral-400 mt-2 text-lg">
                A tu panel de control Humobile
              </p>
            </div>
            
           { usuarioMembresia!='PREMIUM'? 
           (
             <motion.div
               onClick={()=>router.push('/dashboard/serPremium')}
                      
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-white rounded-xl shadow-lg shadow-amber-500/30 relative overflow-hidden"
            >
              {/* Efecto de brillo dorado */}
              <div
           
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-300/20 animate-pulse"></div>
              <FaCrown className="text-lg relative z-10" />
              <span className="font-bold text-white relative z-10">Cambia a  Premium</span>
              <DiSpark className="text-xs text-yellow-200 relative z-10 animate-spin-slow" />
            </motion.div>
           ):(
            <div>
               <motion.div
               onClick={()=>router.push('/dashboard/cuenta')}
                      
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer gap-2 w-md md:w-lg inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-white rounded-xl shadow-lg shadow-amber-500/30 relative overflow-hidden"
            >
              {/* Efecto de brillo dorado */}
              <div
           
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-300/20 animate-pulse">
                
              </div>
              <FaCrown className="text-lg relative z-10" />
              <span className="font-bold text-white relative z-10">HUMOBILE PRO</span>
                <div className=' flex text-gray-100 px-2 py-4 items-center justify-center '>
                      
                        <b>Dias Restantes: {dias}
                        </b>
                      </div>
            </motion.div>
            </div>
           ) }
          </div>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 12
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 17
                }
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setActiveItem(item.name)}
              className="relative group"
            >
              <Link href={`/${item.path}`} className="block">
                {/* Card */}
                <div className="relative h-full bg-gradient-to-b from-neutral-800 via-neutral-800 to-neutral-900 rounded-2xl border border-neutral-700 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
                  
                  {/* Glow effect */}
                  {hoveredIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.2, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-sky-500/20"
                    />
                  )}

                  {/* Gradient border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-sky-500/0 group-hover:from-blue-500/10 group-hover:via-blue-500/10 group-hover:to-neutral-800/10 transition-all duration-500 rounded-2xl" />

                  {/* Content */}
                  <div className="relative p-6 md:p-7 flex flex-col items-center text-center h-full">
                    {/* Main Icon Container */}
                    <div className="relative mb-5 md:mb-6">
                      <motion.div
                        initial={{ scale: 1, rotate: 0 }}
                        animate={{ 
                          scale: hoveredIndex === index ? 1.15 : 1,
                          rotate: hoveredIndex === index ? 0 : 0
                        }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300"
                      >
                        <div className="text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                          {getMenuIcon(index)}
                        </div>
                      </motion.div>
                      
                      {/* Small React Icon Badge */}
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                        className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 g-neutral-800 rounded-full border-2 border-neutral-800 shadow-md"
                      >
                        <div className="text-sm">
                          {item.icon}
                        </div>
                      </motion.div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-neutral-400 mb-4 flex-1">
                      {item.descripcion}
                    </p>

                    {/* Action Indicator */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explorar
                      </span>
                      <motion.div
                        animate={{ x: hoveredIndex === index ? 5 : 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <FaChevronRight className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </motion.div>
                    </div>

                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-500/10 to-transparent" />
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <motion.div
                    animate={{ 
                      width: hoveredIndex === index ? '100%' : '0%',
                      opacity: hoveredIndex === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-sky-500"
                  />
                </div>
              </Link>

              {/* Active state indicator */}
              {activeItem === item.name && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                >
                 
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* System Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-8 bg-gradient-to-r from-neutral-800/60 to-neutral-800/40 backdrop-blur-sm rounded-2xl border border-neutral-700/50"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500/20 to-sky-500/20 flex items-center justify-center"
              >
                <BsLightningFill className="text-2xl text-blue-500" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Sistema en Tiempo Real
                </h3>
                <p className="text-neutral-400">
                  Todas las funcionalidades operativas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm text-neutral-400">Performance</div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm text-neutral-400"
        >
          <p>© {new Date().getFullYear()} Dashboard Pro </p>
          <p className="text-xs mt-1 text-neutral-500">
            • BABM •
          </p>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}