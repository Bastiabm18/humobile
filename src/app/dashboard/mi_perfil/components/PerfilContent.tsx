// app/dashboard/mi_perfil/PerfilContent.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiArrowLeft } from 'react-icons/hi';
import GridPerfiles from './GridPerfiles';
import VistaPerfil from './VistaPerfil';
import { actualizarPerfil, crearPerfil, eliminarPerfil, getProfiles } from '../actions/actions';
import { GeoData, Perfil } from '@/types/profile';
import { FaUserPlus, FaGuitar, FaBuilding, FaMusic, FaBriefcase, FaPlus } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import EditarPerfil from './EditarPerfil';
import ModalMensaje from './Modalmensaje';
import ModalConfirmacion from './ModalConfirmacion';
import CrearPerfil from './CrearPerfil';

interface PerfilContentProps {
  initialProfiles: Perfil[];
  userEmail: string;
  userName?: string;
  userId: string;
  geoData: GeoData;
  membresia: string;
}

export default function PerfilContent({
  initialProfiles,
  userEmail,
  userName,
  userId,
  geoData,
  membresia
}: PerfilContentProps) {
  const [perfiles, setPerfiles] = useState<Perfil[]>(initialProfiles);
  const [perfilVista, setPerfilVista] = useState<Perfil | null>(null);
  const [perfilEditando, setPerfilEditando] = useState<Perfil | null>(null);
  const [creandoPerfil, setCreandoPerfil] = useState(false);
  const [membresiaEstado, setMembresiaEstado] = useState(membresia);
  
  // Estados para el modal
  const [showModal, setShowModal] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');
  const [modalTipo, setModalTipo] = useState<'exito' | 'error' | 'info'>('info');

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [perfilAEliminar, setPerfilAEliminar] = useState<string | null>(null);

  // Función para mostrar modal
  const mostrarMensaje = (mensaje: string, tipo: 'exito' | 'error' | 'info' = 'info') => {
    setModalMensaje(mensaje);
    setModalTipo(tipo);
    setShowModal(true);
  };

  // Función para cerrar modal
  const cerrarModal = () => {
    setShowModal(false);
  };

  const loadPerfiles = async () => {
    try {
      const data = await getProfiles(userId);
      setPerfiles(data);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
      mostrarMensaje('Error al cargar los perfiles', 'error');
    }
  };

  const handleEdit = (perfil: Perfil) => {
    setPerfilEditando(perfil);
  };

  const handleActualizaPerfil = async (perfilActualizado: Perfil) => {
    try {
      const resultado = await actualizarPerfil(perfilActualizado);
      
      if (resultado.exito && resultado.datos) {
        setPerfiles(prev => prev.map(p => 
          p.id_perfil === perfilActualizado.id_perfil ? resultado.datos! : p
        ));
        
        setPerfilEditando(null);
        setPerfilVista(resultado.datos);
        
        mostrarMensaje(resultado.mensaje, 'exito');
      } else {
        mostrarMensaje(`Error: ${resultado.mensaje}`, 'error');
      }
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      mostrarMensaje('Error al guardar los cambios. Intenta nuevamente.', 'error');
    }
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

  const handleConfirmarEliminar = (id_perfil: string) => {
    setPerfilAEliminar(id_perfil);
    setShowConfirmModal(true);
  };

  // 
  const handleEliminarPerfilConfirmado = async () => {
    if (!perfilAEliminar) return;

    try {
      const resultado = await eliminarPerfil(perfilAEliminar);
      
      if (resultado.exito) {
        await loadPerfiles();
        mostrarMensaje(resultado.mensaje || 'Perfil eliminado exitosamente', 'exito');
        
        if (perfilVista?.id_perfil === perfilAEliminar) {
          setPerfilVista(null);
        }
        if (perfilEditando?.id_perfil === perfilAEliminar) {
          setPerfilEditando(null);
        }
      } else {
        mostrarMensaje(`Error: ${resultado.mensaje || 'Error desconocido'}`, 'error');
      }
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
      mostrarMensaje('Error al eliminar el perfil. Intenta nuevamente.', 'error');
    } finally {
      setPerfilAEliminar(null);
      setShowConfirmModal(false);
    }
  };

const handleCrearPerfil = async (nuevoPerfilData: Omit<Perfil, 'id_perfil' | 'creado_en' | 'actualizado_en'>) => {
  try {
    const resultado = await crearPerfil(nuevoPerfilData);
    
    if (resultado.exito && resultado.datos) {
      mostrarMensaje('Perfil creado exitosamente', 'exito');
      await loadPerfiles();
      setCreandoPerfil(false);
    } else {
      mostrarMensaje(resultado.mensaje || 'Error al crear el perfil', 'error');
    }
  } catch (error) {
    console.error('Error al crear perfil:', error);
    mostrarMensaje('Error al crear el perfil', 'error');
  }
};


  // Función para renderizar ambos modales en todos los estados
  const renderModales = () => (
    <>
      <ModalMensaje 
        isOpen={showModal}
        onClose={cerrarModal}
        mensaje={modalMensaje}
        tipo={modalTipo}
      />
      
      <ModalConfirmacion
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPerfilAEliminar(null);
        }}
        onConfirm={handleEliminarPerfilConfirmado}
        titulo="Eliminar perfil"
        mensaje="¿Estás seguro de eliminar este perfil? Esta acción no se puede deshacer."
        textoConfirmar="Eliminar"
        textoCancelar="Cancelar"
      />
    </>
  );

  if (creandoPerfil) {
  return (
    <>
      {renderModales()}
      <div className="min-h-screen p-4 bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          {/* Botón volver */}
          <div className="mb-8">
            <button
              onClick={() => setCreandoPerfil(false)}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-300 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              <HiArrowLeft className="w-4 h-4" />
              <span>Volver a Perfiles</span>
            </button>
          </div>
          
          {/* Componente CrearPerfil */}
          <CrearPerfil
            userId={userId}
            onSave={handleCrearPerfil}
            onCancel={() => setCreandoPerfil(false)}
            geoData={geoData}
            membresia={membresiaEstado}
          />
        </div>
      </div>
    </>
  );
}

  // si estamos editando perfil
  if (perfilEditando) {
    return (
      <>
        {renderModales()}
        <div className="min-h-screen p-4 bg-neutral-900">
          <div className="max-w-7xl mx-auto">
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
            </div>

            <EditarPerfil
              perfil={perfilEditando}
              onSave={handleActualizaPerfil}
              onCancel={handleVolverEdicion}
              geoData={geoData}
            />
          </div>
        </div>
      </>
    );
  }

  // Si estamos viendo un perfil, mostrar VistaPerfil
  if (perfilVista) {
    return (
      <>
        {renderModales()}
        <div className="min-h-screen p-4 bg-neutral-900">
          <div className="max-w-7xl mx-auto">
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

            <VistaPerfil perfil={perfilVista} />
          </div>
        </div>
      </>
    );
  }

  // Si no hay perfiles, mostrar pantalla de crear primer perfil
  if (perfiles.length === 0) {
    return (
      <>
        {renderModales()}
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-900">
          <div className="max-w-md mx-auto text-center">
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

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setCreandoPerfil(true)}
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
      </>
    );
  }

  // Si hay perfiles y no estamos viendo uno específico, mostrar el grid
  return (
    <>
      {renderModales()}
      <div className="min-h-screen p-4 bg-neutral-900">
        <div className="max-w-7xl mx-auto">
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
          
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setCreandoPerfil(true)}
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

          <GridPerfiles
            perfiles={perfiles}
            onRefresh={loadPerfiles}
            onEdit={handleEdit}
            onDelete={handleConfirmarEliminar}
            onVer={handleVer}
          />
        </div>
      </div>
    </>
  );
}