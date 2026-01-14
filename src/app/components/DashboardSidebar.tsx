'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, 
  FaUsers, 
  FaComment, 
  FaChartBar, 
  FaQuestion, 
  FaSignOutAlt, 
  FaChevronLeft, 
  FaChevronRight, 
  FaUserCircle,
  FaCog,
  FaCrown
} from 'react-icons/fa';
import { RiCalendarScheduleLine, RiHealthBookLine } from 'react-icons/ri';
import { GrUserAdmin } from 'react-icons/gr';
import { AiFillSetting } from 'react-icons/ai';
import { MdMenu, MdMenuBook, MdOutlinePostAdd, MdSmokeFree } from "react-icons/md";
import { RiCustomerService2Fill } from "react-icons/ri";
import { BsBackspace, BsStars, BsLightningFill } from "react-icons/bs";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { GiSmokeBomb, GiSparkPlug } from "react-icons/gi";
import { MENU_ITEMS } from '../constants/menu';
import { UserRole } from '@/types/role';
import NeonSign from './NeonSign';
import { WiSmoke } from 'react-icons/wi';
import { useRouter } from 'next/navigation';

interface MenuItem {
  name: string;
  path: string;
  icon: ReactElement;
  role: string[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userRole: UserRole;
  userMembresia?: 
    {
      nombre_membresia: string;
      estado_membresia: string;
      fecha_ini_membresia: string;
      fecha_fin_membresia: string;
      precio_membresia: number;
      id: number;

    }
  ;
}

export default function DashboardSidebar({ collapsed, onToggle, mobileOpen, setMobileOpen, userRole, userMembresia }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [usuarioMembresia, setUsuarioMembresia] = useState<string | null>(null);

  const router = useRouter();
    useEffect(() => {
    if (userMembresia) {
      setUsuarioMembresia(userMembresia.nombre_membresia);
    }
  }, [userMembresia]);
const menuItems = MENU_ITEMS.filter(item => {
  // Debe tener el rol correcto
  if (!userRole || !item.role.includes(userRole)) return false;
  
  // Si es PREMIUM, muestra todo de su rol
  if (usuarioMembresia === 'PREMIUM') return true;
  
  // De lo contrario, solo muestra items GRATIS
  return item.membresia.includes('GRATIS');
});
  const dias = userMembresia?.fecha_fin_membresia && userMembresia?.fecha_ini_membresia
    ? Math.ceil((new Date(userMembresia.fecha_fin_membresia).getTime() - new Date(userMembresia.fecha_ini_membresia).getTime()) / (1000 * 3600 * 24))
    : 0;
  

  
  
  //console.log('membresia', userMembresia)
  

  return (
    <>
      {/* Sidebar para Desktop */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 lg:z-10
          hidden lg:block
          transition-all duration-300 ease-in-out
          
          ${collapsed ? 'w-24' : 'w-92'}
        `}
      >
        <div className="h-full flex flex-col bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 border-r border-neutral-700/50 shadow-2xl">
          {/* Header */}
          <div className={`p-4 border-b border-neutral-700/50 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} relative overflow-hidden`}>
            {/* Background glow effect */}
            <div className="absolute inset-0 "></div>
            
            {!collapsed ? (
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                    <b>H</b>
                  </div>
                  <h1 className="text-3xl text-gray-300 font-bold ">
                    HUMOBILE
                  </h1>
                </div>
                <p className="text-xs text-neutral-400 mt-1 ml-11"></p>
              </div>
            ) : (
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                  <b>H</b>
                </div>
              </div>
            )}
            
            <button
              onClick={onToggle}
              className="relative ml-2 p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-200 flex items-center justify-center"
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              {collapsed ? (
                <FaChevronRight className="text-blue-300" />
              ) : (
                <FaChevronLeft className="text-blue-300" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-scroll custom-scrollbar py-4 px-2">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === `/${item.path}`;
                const isHovered = hoveredItem === item.path;
                
                return (
                  <li
                    key={item.path}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`relative rounded-lg mx-2 transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600/15 border-l-2 border-blue-500' 
                        : isHovered 
                          ? 'bg-neutral-800/50' 
                          : ''
                      }
                    `}
                  >
                    <Link
                      href={`/${item.path}`}
                      className={`flex items-center p-3 transition-all duration-200
                        ${collapsed ? 'justify-center' : ''}
                      `}
                    >
                      {/* Icon container */}
                      <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-br from-blue-600/20 to-sky-500/20 shadow-lg shadow-blue-500/10' 
                          : 'bg-neutral-800/30'
                        }
                        ${isHovered ? 'scale-105' : ''}
                      `}>
                        <div className={`text-lg transition-colors duration-200
                          ${isActive ? 'text-blue-300' : 'text-neutral-300 hover:text-blue-300'}
                        `}>
                          {item.icon}
                        </div>
                      </div>

                      {/* Label */}
                      {!collapsed && (
                        <div className="ml-3 flex-1">
                          <span className={`font-medium transition-colors duration-200
                            ${isActive ? 'text-blue-200' : 'text-neutral-200 hover:text-blue-200'}
                          `}>
                            {item.name}
                          </span>
                        </div>
                      )}


                      {/* Hover arrow */}
                      {isHovered && !collapsed && !isActive && (
                        <div className="ml-2">
                          <FaChevronRight className="text-blue-300 text-xs" />
                        </div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Premium Section */}
             {/* Premium Section Mobile */}
                { !collapsed && 
                ( usuarioMembresia != 'PREMIUM'?
                  (  
                  <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-400/10 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <GiSparkPlug className="text-amber-300 text-lg" />
                        <span className="text-sm font-bold text-amber-200">Funciones Premium </span>
                      </div>
                      <p className="text-xs text-amber-100/70">
                        Desbloquea todas las funciones avanzadas
                      </p>
                      <button
                      onClick={()=>router.push('/dashboard/serPremium')}
                      className=" cursor-pointer mt-3 gap-2 w-full flex items-center justify-center py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25">
                     <FaCrown size={18}/> Actualiza Ahora
                      </button>
                    </div>
                  </div>
                 ):(
                    <div>
                            <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-400/10 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
                    <div className="relative">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <GiSparkPlug className="text-amber-300 text-lg" />
                        <span className="text-sm font-bold text-amber-200">HUMOBILE PRO </span>
                      </div>
                      <p className="text-xs text-amber-100/70">
                      
                      </p>
                      <button
                      onClick={()=>router.push('/dashboard/cuenta')}
                      className=" cursor-pointer mt-3 gap-2 w-full flex items-center justify-center py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25">
                     <FaCrown size={18}/> Ver Mi Suscripción
                      </button>
                      <div className='w-full flex text-amber-300 px-2 py-4 items-center justify-center '>
                      
                        <p>Dias Restantes: {dias}
                        </p>
                      </div>
                    </div>
                  </div>
                    </div>
                  )
                )}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-neutral-700/50 ${collapsed ? 'text-center' : ''}`}>
            {!collapsed ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                    <FaUserCircle className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-200">Usuario</p>
                    <p className="text-xs text-neutral-400">Online</p>
                  </div>
                </div>
                <button
                   onClick={()=>router.push('/dashboard/cuenta')}
                  className=" cursor-pointer p-2 rounded-lg hover:bg-neutral-700/50 transition-colors">
                  <FaCog className="text-neutral-400 hover:text-blue-300" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                  <FaUserCircle className="text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sidebar para Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden"
            >
              <div className="h-full flex flex-col bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 border-r border-neutral-700/50 shadow-2xl">
                {/* Header Mobile */}
                <div className="p-4 border-b border-neutral-700/50 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-sky-500/5"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                       <b>H</b>
                      </div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 via-sky-200 to-cyan-200 bg-clip-text text-transparent">
                        HUMOBILE 
                      </h1>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 ml-11"></p>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="relative p-2 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <FaChevronLeft className="text-blue-300" />
                  </button>
                </div>

                {/* Navigation Mobile */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                  <ul className="space-y-1">
                    {menuItems.map((item) => {
                      const isActive = pathname === `/${item.path}`;
                      
                      return (
                        <li
                          key={item.path}
                          className={`relative rounded-lg mx-2 transition-all duration-200
                            ${isActive 
                              ? 'bg-blue-600/15 border-l-2 border-blue-500' 
                              : 'hover:bg-neutral-800/50'
                            }
                          `}
                        >
                          <Link
                            href={`/${item.path}`}
                            className="flex items-center p-3 transition-all duration-200"
                            onClick={() => setMobileOpen(false)}
                          >
                            <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200
                              ${isActive 
                                ? 'bg-gradient-to-br from-blue-600/20 to-sky-500/20 shadow-lg shadow-blue-500/10' 
                                : 'bg-neutral-800/30'
                              }
                            `}>
                              <div className={`text-lg transition-colors duration-200
                                ${isActive ? 'text-blue-300' : 'text-neutral-300'}
                              `}>
                                {item.icon}
                              </div>
                            </div>

                            <div className="ml-3 flex-1">
                              <span className={`font-medium transition-colors duration-200
                                ${isActive ? 'text-blue-200' : 'text-neutral-200'}
                              `}>
                                {item.name}
                              </span>
                            </div>

                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Premium Section Mobile */}
                { !collapsed && 
                ( usuarioMembresia != 'PREMIUM'?
                  (  
                  <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-400/10 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <GiSparkPlug className="text-amber-300 text-lg" />
                        <span className="text-sm font-bold text-amber-200">Funciones Premium </span>
                      </div>
                      <p className="text-xs text-amber-100/70">
                        Desbloquea todas las funciones avanzadas
                      </p>
                      <button
                      onClick={()=>router.push('/dashboard/serPremium')}
                      className=" cursor-pointer mt-3 gap-2 w-full flex items-center justify-center py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25">
                     <FaCrown size={18}/> Actualiza Ahora
                      </button>
                    </div>
                  </div>
                 ):(
                    <div>
                            <div className="mt-8 mx-3 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-400/10 border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-yellow-500/5"></div>
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <GiSparkPlug className="text-amber-300 text-lg" />
                        <span className="text-sm font-bold text-amber-200">HUMOBILE PRO </span>
                      </div>
                      <p className="text-xs text-amber-100/70">
                      
                      </p>
                      <button
                      onClick={()=>router.push('/dashboard/cuenta')}
                      className=" cursor-pointer mt-3 gap-2 w-full flex items-center justify-center py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/25">
                     <FaCrown size={18}/> Ver Mi Suscripción
                      </button>
                       <div className='w-full flex text-amber-300 px-2 py-4 items-center justify-center '>
                      
                        <p>Dias Restantes: {dias}
                        </p>
                      </div>
                    </div>
                  </div>
                    </div>
                  )
                )}
                </nav>

                {/* Footer Mobile */}
                <div className="p-4 border-t border-neutral-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
                        <FaUserCircle className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-200">Usuario</p>
                        <p className="text-xs text-neutral-400">Online</p>
                      </div>
                    </div>
                    <button
                    onClick={()=>router.push('/dashboard/cuenta')}
                    className="cursor-pinter p-2 rounded-lg hover:bg-neutral-700/50 transition-colors">
                      <FaCog className="text-neutral-400 hover:text-blue-300" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Overlay Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
          </>
        )}
      </AnimatePresence>

     
    </>
  );
}