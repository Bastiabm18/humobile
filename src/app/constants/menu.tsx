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
import { UserRole } from '@/types/role';
import { TbMessageQuestion } from 'react-icons/tb';

export interface MenuItem {
  name: string;
  path: string;
  descripcion:string;
  icon: ReactNode;
  role: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  { name: 'Inicio',                path: 'dashboard',                descripcion:'Vuele a empezar ', icon: <FaHome className='text-4xl text-cyan-500/80' />,                role: ['ADMIN', 'user'] },
  { name: 'Perfiles',              path: 'dashboard/mi_perfil',      descripcion:'Accede a tus perfiles Humobile ', icon: <FaUserCircle className='text-4xl text-violet-500/80' />,          role: ['ADMIN', 'user'] },
  { name: 'Agenda',                path: 'dashboard/agenda',         descripcion:' Maneja Tus Tiempos ', icon: <MdMenuBook className='text-4xl text-purple-500/80' />,            role: ['ADMIN', 'user'] },
  { name: 'Eventos',               path: 'dashboard/eventos',        descripcion:'Chequea Tus Actividades ', icon: <MdEventAvailable className='text-4xl text-sky-500/80' />,      role: ['ADMIN', 'user'] },
  { name: 'Solicitudes',           path: 'dashboard/solicitudes',    descripcion:' Acepta/Rechaza Fechas o Invitaciones', icon: <TbMessageQuestion className='text-4xl text-indigo-500/80'  />,    role: ['ADMIN', 'user'] },
  { name: 'Cuenta',                path: 'dashboard/cuenta',         descripcion:' Setea Tu Humobile', icon: <MdOutlinePersonPin className='text-4xl text-green-500/80' />,         role: ['ADMIN','user'] },
  { name: 'preguntas frecuentes',  path: 'dashboard/faq',            descripcion:' Maneja Preguntas Frecuentes', icon: <FaQuestion className='text-4xl text-blue-500/80' />,            role: ['ADMIN'] },
  { name: 'Configuracion',         path: 'dashboard/MasterConfig',   descripcion:'Only Mr Cabrera Derek', icon: <AiFillSetting className='text-4xl text-blue-500/80' />,            role: ['ADMIN'] },
  { name: 'Salir',                 path: '/',                        descripcion:' Salida ', icon: <BsBackspace className='text-4xl text-red-500/80' />,           role: ['ADMIN', 'user'] },
];