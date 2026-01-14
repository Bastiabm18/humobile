// src/constants/menu.tsx   ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
//            ^^^^^^^^  ←  .tsx  NO .ts
import { ReactNode } from 'react';
import {
  FaHome,
  FaUserCircle,
  FaComment,
  FaChartBar,
  FaQuestion,
} from 'react-icons/fa';
import { MdEventAvailable, MdMenuBook, MdOutlinePersonPin } from 'react-icons/md';
import { RiCustomerService2Fill } from 'react-icons/ri';
import { AiFillSetting } from 'react-icons/ai';
import { BsBackspace } from 'react-icons/bs';
import {  UserRole } from '@/types/role';
import { TbMessageQuestion } from 'react-icons/tb';
import { GrUserManager } from 'react-icons/gr';
import { GiTakeMyMoney } from 'react-icons/gi';

export interface MenuItem {
  name: string;
  path: string;
  descripcion:string;
  icon: ReactNode;
  role: UserRole[];
  membresia:string[];
}

export const MENU_ITEMS: MenuItem[] = [
  { name: 'Inicio',                path: 'dashboard',                descripcion:'Vuele a empezar ', icon: <FaHome className='text-4xl text-cyan-500/80' />,                                       role: ['ADMIN','user'], membresia:['GRATIS']           },
  { name: 'Cuenta',                path: 'dashboard/cuenta',         descripcion:' Setea Tu Humobile', icon: <MdOutlinePersonPin className='text-4xl text-green-500/80' />,                        role: ['ADMIN','user'], membresia:['GRATIS']           },
  { name: 'Perfiles',              path: 'dashboard/mi_perfil',      descripcion:'Accede a tus perfiles Humobile ', icon: <FaUserCircle className='text-4xl text-violet-500/80' />,                role: ['ADMIN','user'], membresia:['GRATIS']           },
  { name: 'Agenda',                path: 'dashboard/agenda',         descripcion:' Maneja Tus Tiempos ', icon: <MdMenuBook className='text-4xl text-purple-500/80' />,                             role: ['ADMIN','user'], membresia:['GRATIS']           },
  { name: 'Eventos',               path: 'dashboard/eventos',        descripcion:'Chequea Tus Actividades ', icon: <MdEventAvailable className='text-4xl text-sky-500/80' />,                      role: ['ADMIN','user'], membresia:['GRATIS']           },
  { name: 'Solicitudes',           path: 'dashboard/solicitudes',    descripcion:' Acepta/Rechaza Fechas o Invitaciones', icon: <TbMessageQuestion className='text-4xl text-indigo-500/80'  />,    role: ['ADMIN','user'], membresia:['GRATIS']           },
  { name: 'Representante',           path: 'dashboard/representante',    descripcion:'Panel Representante', icon: <GrUserManager  className='text-4xl text-teal-500/80'  />,                       role: ['ADMIN','user'], membresia:['PREMIUM']          },
  { name: 'Productor',           path: 'dashboard/productor',    descripcion:' Panel Productor', icon: <GiTakeMyMoney className='text-4xl text-yellow-500/80'  />,                                 role: ['ADMIN','user'], membresia:['PREMIUM']          },
  { name: 'Configuracion',         path: 'dashboard/Configuracion',   descripcion:'Panel Admin', icon: <AiFillSetting className='text-4xl text-blue-500/80' />,                                    role: ['ADMIN']       , membresia:['PREMIUM']          },
  { name: 'Salir',                 path: '/',                        descripcion:' Salida ', icon: <BsBackspace className='text-4xl text-red-500/80' />,                                             role: ['ADMIN','user'], membresia:['GRATIS']           },
];