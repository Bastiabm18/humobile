// components/InvitarModal.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { HiX, HiPaperAirplane, HiUser  } from 'react-icons/hi';
import { enviarSolicitud, getPerfilesVisibles } from '../actions/actions';
import { format } from 'date-fns';

interface InvitarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnviar: (data: InvitacionData) => void;
  nombreBanda: string;
  id_banda: string;
}

export interface InvitacionData {
  id_perfil:string;
  id_banda:string;
  fecha_invitacion:string;
  fecha_vencimiento:string;
  nombre_banda: string;
  invitacion: string;
  descripcion: string;
}

export default function InvitarModal({ isOpen, onClose, onEnviar, nombreBanda, id_banda }: InvitarModalProps) {


  const formatDateToInput = (date: Date | string): string => {
    return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
  };
  const [formData, setFormData] = useState<InvitacionData>({
    id_perfil:'',
    id_banda: id_banda,
    fecha_invitacion: formatDateToInput(new Date()),
    fecha_vencimiento:formatDateToInput(new Date()) ,
    nombre_banda: nombreBanda,
    invitacion: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
    // NUEVO: Estado para perfiles visibles
  const [perfilesVisibles, setPerfilesVisibles] = useState<any[]>([]);
  const [loadingPerfiles, setLoadingPerfiles] = useState(false);


  // NUEVO: Cargar perfiles cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarPerfiles();
    }
  }, [isOpen]);

    // Función para cargar perfiles
  const cargarPerfiles = async () => {
    setLoadingPerfiles(true);
    try {
      const perfiles = await getPerfilesVisibles();
      setPerfilesVisibles(perfiles);
      console.log(perfiles);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingPerfiles(false);
    }
  };

  if (!isOpen) return null;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Enviar a la acción
    const resultado = await enviarSolicitud(formData);
    
    if (resultado.success) {
      // Si fue exitoso, pasar los datos a onEnviar
      onEnviar(formData);
      onClose();
      // Opcional: mostrar mensaje de éxito
      alert('Solicitud enviada exitosamente');
    } else {
      // Si hubo error
      alert(`Error: ${resultado.error}`);
    }
  } catch (error: any) {
    console.error('Error enviando solicitud:', error);
    alert('Error al enviar la solicitud');
  } finally {
    setLoading(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="bg-neutral-900 border border-green-600/40 rounded-2xl shadow-2xl shadow-green-900/60 max-w-md w-full">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900/60 to-black p-6 border-b border-green-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-600 p-3 rounded-xl">
                  <HiPaperAirplane className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Invitacion {nombreBanda}</h2>
                  <p className="text-green-400 text-sm">Envía una solicitud para que sean parte del grupo</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-900/60 rounded-xl transition"
              >
                <HiX className="w-6 h-6 text-green-400" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre del Grupo */}
            <div>
              <label className="block text-green-300 font-medium mb-2">
             De :  {nombreBanda}
              </label>
            
            
            </div>

             
  {/* NUEVO: Selector de perfiles visibles */}
  <div>
    <label className="block text-green-300 font-medium mb-2">
      <div className="flex items-center gap-2">
        <HiUser className="w-5 h-5" />
       Para:
      </div>
    </label>
    
    {loadingPerfiles ? (
      <div className="bg-black/50 border border-green-600/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
        <span className="text-gray-400">Cargando perfiles...</span>
      </div>
    ) : (
      <select
        name="id_perfil"
        value= {formData.id_perfil}
        onChange={handleChange}
        className="w-full bg-black border border-green-600/30 rounded-xl px-4 py-3 text-white"
        required
      >
        {perfilesVisibles.length === 0 ? (
          <option value="" disabled>No tienes perfiles visibles</option>
        ) : (
          <>
            <option value="" disabled>Selecciona un perfil</option>
            {perfilesVisibles.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.data?.name || 'Sin nombre'}
              </option>
            ))}
          </>
        )}
      </select>
    )}
  </div>

            {/* Tipo de Invitación */}
            <div>
              <label className="block text-green-300 font-medium mb-2">
                Tipo de invitación
              </label>
              <input
                type="text"
                name="invitacion"
                value={formData.invitacion}
                onChange={handleChange}
                placeholder="Ej: Invitación como guitarrista"
                className="w-full bg-black/50 border border-green-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />

            </div>

                        <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha Vencimiento 
              </label>
              <input
                type="datetime-local"
                name = "fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                min={formatDateToInput(new Date())}
                required
                className="w-full px-4 py-3 bg-light-gray border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-green-300 font-medium mb-2">
                Descripción/Mensaje
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Cuéntales por qué quieres unirte a la banda..."
                rows={4}
                className="w-full bg-black/50 border border-green-600/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Footer - Botones */}
            <div className="flex gap-4 pt-4 border-t border-green-600/30">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium text-white transition"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl font-medium text-white transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <HiPaperAirplane className="w-5 h-5" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}