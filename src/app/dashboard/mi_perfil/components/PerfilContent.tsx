// app/dashboard/mi_perfil/PerfilContent.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiArrowLeft, HiEye } from 'react-icons/hi';
import GridPerfiles from './GridPerfiles';
import VistaPerfil from './VistaPerfil';
import { getProfiles } from '../actions/actions';
import { GeoData, Perfil } from '@/types/profile';
import { FaUserPlus, FaGuitar, FaBuilding, FaMusic, FaBriefcase, FaPlus } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import EditarPerfil from './EditarPerfil';

interface PerfilContentProps {
  initialProfiles: Perfil[];
  userEmail: string;
  userName?: string;
  userId: string;
  geoData: GeoData;
}

export default function PerfilContent({
  initialProfiles,
  userEmail,
  userName,
  userId,
  geoData
}: PerfilContentProps) {
  const [perfiles, setPerfiles] = useState<Perfil[]>(initialProfiles);
  const [perfilVista, setPerfilVista] = useState<Perfil | null>(null);
  const [perfilEditando, setPerfilEditando] = useState<Perfil | null>(null);

  const loadPerfiles = async () => {
    try {
      const data = await getProfiles(userId);
      setPerfiles(data);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
    }
  };

  const handleEdit = (perfil: Perfil) => {
    console.log('Editar perfil:', perfil);
     setPerfilEditando(perfil); // nuevo estado para controlar edición
    // Aquí irías a la página de edición o abrirías formulario
  };

  const handleVer = (perfil: Perfil) => {
    setPerfilVista(perfil);
  };

  const handleVolver = () => {
    setPerfilVista(null);
  };
   const handleVolverEdicion = () => {
    setPerfilEditando(null);
  };

  const handleDelete = async (id_perfil: string) => {
    try {
      console.log('Eliminar perfil:', id_perfil);
      // await deletePerfil(id_perfil);
      await loadPerfiles();
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      throw error;
    }
  };

  const handleCreateProfile = () => {
    console.log('Ir a crear perfil');
    // Navegar a página de creación
  };

  if (perfilEditando) {
  return (
    <div className="min-h-screen p-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Header con botón volver */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={handleVolverEdicion}
            className="
              flex items-center gap-2
              px-4 py-2.5
              bg-neutral-800
              hover:bg-neutral-700
              border border-neutral-700
              hover:border-neutral-600
              text-neutral-300
              rounded-lg
              transition-all duration-200
              text-sm
              font-medium
            "
          >
            <HiArrowLeft className="w-4 h-4" />
            <span>Volver a Perfiles</span>
          </button>
          
          {/* Botón para guardar (este iría en el componente EditarPerfil mejor) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPerfilVista(perfilEditando)}
              className="
                flex items-center gap-2
                px-4 py-2.5
                bg-neutral-800
                hover:bg-neutral-700
                border border-neutral-700
                hover:border-neutral-600
                text-neutral-300
                rounded-lg
                transition-all duration-200
                text-sm
                font-medium
              "
            >
              <HiEye className="w-4 h-4" />
              <span>Vista Previa</span>
            </button>
          </div>
        </div>

        {/* Componente EditarPerfil */}
        <EditarPerfil
          perfil={perfilEditando}
          onSave={(perfilActualizado) => {
            console.log('Guardar perfil editado:', perfilActualizado);
            // Aquí llamarías a tu función de actualización
            // Ej: await updatePerfil(perfilActualizado);
            setPerfilEditando(null);
            setPerfilVista(perfilActualizado); // Para ver los cambios
            loadPerfiles(); // Recargar la lista
          }}
          onCancel={handleVolverEdicion}
          geoData={geoData}
        />
      </div>
    </div>
  );
}


  // Si estamos viendo un perfil, mostrar VistaPerfil
  if (perfilVista) {
    return (
      <div className="min-h-screen p-4 bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          {/* Header con botón volver */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={handleVolver}
              className="
                flex items-center gap-2
                px-4 py-2.5
                bg-neutral-800
                hover:bg-neutral-700
                border border-neutral-700
                hover:border-neutral-600
                text-neutral-300
                rounded-lg
                transition-all duration-200
                text-sm
                font-medium
              "
            >
              <HiArrowLeft className="w-4 h-4" />
              <span>Volver a Perfiles</span>
            </button>
          </div>

          {/* Componente VistaPerfil */}
          <VistaPerfil perfil={perfilVista} />
        </div>
      </div>
    );
  }

  // Si no hay perfiles, mostrar pantalla de crear primer perfil
  if (perfiles.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-900">
        <div className="max-w-md mx-auto text-center">
          {/* Icono animado */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="mb-8"
          >
            <div className="relative py-5">
              <div className="w-32 h-32 mx-auto bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center">
                <FaUserPlus className="w-16 h-16 text-neutral-400" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 border-2 border-neutral-600 rounded-full"
              />
            </div>
          </motion.div>

          {/* Texto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              ¡Crea tu primer perfil!
            </h1>
            <p className="text-neutral-400 text-lg mb-8">
              Comienza tu experiencia en la plataforma creando tu primer perfil musical
            </p>
          </motion.div>

          {/* Botón crear */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={handleCreateProfile}
            className="
              group relative
              px-8 py-4
              bg-neutral-800
              hover:bg-neutral-700
              border border-neutral-700
              hover:border-neutral-600
              text-white font-semibold
              rounded-xl
              transition-all duration-300
              overflow-hidden
            "
          >
            <div className="relative flex items-center justify-center gap-3">
              <HiPlus className="w-6 h-6" />
              <span className="text-lg">Crear Primer Perfil</span>
            </div>
          </motion.button>

          {/* Tipos de perfiles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {[
              { icon: <FaMusic />, label: 'Artista', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: <FaGuitar />, label: 'Banda', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: <FaBuilding />, label: 'Local', color: 'text-green-400', bg: 'bg-green-500/10' },
              { icon: <FaMusic />, label: 'Productor', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { icon: <FaBriefcase />, label: 'Representante', color: 'text-red-400', bg: 'bg-red-500/10' },
              { icon: <FaPlus />, label: 'Y Mas', color: 'text-sky-400', bg: 'bg-sky-500/10' },
            ].map((tipo, index) => (
              <motion.div
                key={tipo.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className={`
                  p-4 rounded-lg
                  ${tipo.bg}
                  border border-neutral-700
                  flex flex-col items-center gap-2
                `}
              >
                <div className={tipo.color}>
                  {tipo.icon}
                </div>
                <span className="text-sm font-medium text-neutral-300">
                  {tipo.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Si hay perfiles y no estamos viendo uno específico, mostrar el grid
  return (
    <div className="min-h-screen p-4 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-6">
            <div className="inline-flex border-2 border-neutra items-center justify-center p-5 bg-green-700 rounded-full">
              <FaUser className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Perfil Humobile
          </h1>
          <p className="text-neutral-400">
            Gestiona tus perfiles musicales en la plataforma
          </p>
        </div>
        
        {/* Botón crear nuevo perfil */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleCreateProfile}
            className="
              flex items-center gap-2
              px-5 py-2.5
              bg-neutral-800
              hover:bg-neutral-700
              border border-neutral-700
              hover:border-neutral-600
              text-neutral-300
              rounded-lg
              transition-all duration-200
              text-sm
              font-medium
              shadow-sm
            "
          >
            <HiPlus className="w-4 h-4" />
            <span>Crear Perfil</span>
          </button>
        </div>

        {/* Grid de perfiles */}
        <GridPerfiles
          perfiles={perfiles}
          onRefresh={loadPerfiles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onVer={handleVer}
        />
      </div>
    </div>
  );
}