// components/CuentaContent.tsx
'use client';

import { motion } from 'framer-motion';
import { FaCrown, FaEnvelope, FaUser, FaShieldAlt, FaCalendarAlt, FaTag } from 'react-icons/fa';

interface MembresiaData {
  estado_membresia: string;
  fecha_fin_membresia: string;
  fecha_ini_membresia: string;
  id: string;
  nombre_membresia: string;
  precio_membresia: number;
}

interface UserData {
  uid: string;
  email: string;
  role: string;
  name: string;
  membresia: MembresiaData;
}

interface CuentaContentProps {
  userData: UserData;
}

export default function CuentaContent({ userData }: CuentaContentProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-green-600 text-white';
      case 'PENDIENTE':
        return 'bg-yellow-600 text-white';
      case 'VENCIDO':
        return 'bg-red-600 text-white';
      default:
        return 'bg-neutral-600 text-white';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Mi Cuenta Premium
          </h1>
          <p className="text-neutral-400">
            Gestiona tu información y membresía
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del Usuario */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <FaUser className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Información del Usuario</h2>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-neutral-700/50 rounded-xl hover:bg-neutral-700/70 transition-colors">
                <FaUser className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">Nombre Completo</p>
                  <p className="text-white font-medium">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-700/50 rounded-xl hover:bg-neutral-700/70 transition-colors">
                <FaEnvelope className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">Correo Electrónico</p>
                  <p className="text-white font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-700/50 rounded-xl hover:bg-neutral-700/70 transition-colors">
                <FaShieldAlt className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">Rol del Sistema</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${userData.role === 'ADMIN' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'}`}>
                      {userData.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-neutral-700/50 rounded-xl hover:bg-neutral-700/70 transition-colors">
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-400">ID de Usuario</p>
                  <p className="text-white font-mono text-sm truncate">{userData.uid.slice(0,20)}...</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Membresía Premium */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700 p-6 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-600/30 to-orange-600/30 rounded-xl">
                <FaCrown className="w-6 h-6 text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Membresía Premium</h2>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-700/50 to-neutral-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FaTag className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-sm text-neutral-400">Plan</p>
                    <p className="text-white font-medium">{userData.membresia.nombre_membresia}</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full font-medium ${getEstadoColor(userData.membresia.estado_membresia)}`}>
                  {userData.membresia.estado_membresia}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-700/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendarAlt className="w-4 h-4 text-green-400" />
                    <p className="text-sm text-neutral-400">Fecha de Inicio</p>
                  </div>
                  <p className="text-white font-medium">
                    {formatDate(userData.membresia.fecha_ini_membresia)}
                  </p>
                </div>

                <div className="p-4 bg-neutral-700/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <FaCalendarAlt className="w-4 h-4 text-red-400" />
                    <p className="text-sm text-neutral-400">Fecha de Vencimiento</p>
                  </div>
                  <p className="text-white font-medium">
                    {formatDate(userData.membresia.fecha_fin_membresia)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-neutral-700/50 to-neutral-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Valor de la Membresía</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(userData.membresia.precio_membresia)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-400">ID de Membresía</p>
                    <p className="text-white font-mono text-sm truncate max-w-[150px]">
                      {userData.membresia.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de progreso de membresía */}
              <div className="p-4 bg-neutral-700/50 rounded-xl">
                <div className="flex justify-between text-sm text-neutral-400 mb-2">
                  <span>Progreso de la membresía</span>
                  <span>{(new Date(userData.membresia.fecha_ini_membresia) < new Date() ? 'Activa' : 'Pendiente')}</span>
                </div>
                <div className="h-2 bg-neutral-600 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-600 to-emerald-400"
                  />
                </div>
              </div>
            </motion.div>

            {/* Acciones */}
            <motion.div
              variants={itemVariants}
              className="mt-6 pt-6 border-t border-neutral-700/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
                  Renovar Membresía
                </button>
                <button className="px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-xl transition-colors">
                  Ver Facturación
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50">
            <p className="text-sm text-neutral-400">Días Restantes</p>
            <p className="text-2xl font-bold text-white">
              {Math.ceil((new Date(userData.membresia.fecha_fin_membresia).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
            </p>
          </div>
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50">
            <p className="text-sm text-neutral-400">Beneficios Activos</p>
            <p className="text-2xl font-bold text-white">15+</p>
          </div>
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-4 border border-neutral-700/50">
            <p className="text-sm text-neutral-400">Próxima Renovación</p>
            <p className="text-lg font-semibold text-white">
              {formatDate(userData.membresia.fecha_fin_membresia)}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}