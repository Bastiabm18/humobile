'use client';

import { useState, useEffect } from 'react';
import { HiX, HiSearch } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa6';
import { Profile } from '@/types/profile';

interface ModalSeleccionarParticipantesEdicionProps {
  isOpen: boolean;
  onClose: () => void;
  perfilesDisponibles: Profile[];
  participantesActuales: string[];
  onAgregar: (perfiles: Profile[]) => void;
}

export default function ModalSeleccionarParticipantesEdicion({
  isOpen,
  onClose,
  perfilesDisponibles,
  participantesActuales,
  onAgregar
}: ModalSeleccionarParticipantesEdicionProps) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setBusqueda('');
      setFiltroTipo('');
      setSeleccionados([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const perfilesFiltrados = perfilesDisponibles.filter(p => {
    const yaEstaAgregado = participantesActuales.includes(p.id);
    const coincideBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo ? p.tipo === filtroTipo : true;

    return !yaEstaAgregado && coincideBusqueda && coincideTipo;
  });

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleConfirmar = () => {
    const perfilesElegidos = perfilesDisponibles.filter(p => seleccionados.includes(p.id));
    onAgregar(perfilesElegidos);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h3 className="text-lg font-bold text-white">Agregar Participantes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <HiX size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-neutral-700 space-y-3">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFiltroTipo('')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${!filtroTipo ? 'bg-yellow-600 text-white' : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFiltroTipo('artista')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filtroTipo === 'artista' ? 'bg-yellow-600 text-white' : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'}`}
            >
              Artistas
            </button>
            <button 
              onClick={() => setFiltroTipo('banda')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filtroTipo === 'banda' ? 'bg-yellow-600 text-white' : 'bg-neutral-700 text-gray-300 hover:bg-neutral-600'}`}
            >
              Bandas
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {perfilesFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No se encontraron resultados</p>
          ) : (
            perfilesFiltrados.map((perfil) => (
              <div
                key={perfil.id}
                onClick={() => toggleSeleccion(perfil.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  seleccionados.includes(perfil.id) 
                    ? 'bg-yellow-900/30 border-yellow-500' 
                    : 'bg-neutral-900/50 border-transparent hover:border-neutral-600'
                }`}
              >
                <img 
                  src={perfil.imagen_url || '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png'} 
                  alt={perfil.nombre} 
                  className="w-10 h-10 rounded-full object-cover border border-neutral-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{perfil.nombre || 'Sin nombre'}</p>
                  <p className="text-xs text-gray-400 capitalize">{perfil.tipo}</p>
                </div>
                
                {seleccionados.includes(perfil.id) && (
                  <div className="bg-yellow-600 rounded-full p-1">
                    <FaCheck size={12} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-neutral-700 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {seleccionados.length} seleccionado(s)
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg text-sm transition">
              Cancelar
            </button>
            <button 
              onClick={handleConfirmar} 
              disabled={seleccionados.length === 0}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}