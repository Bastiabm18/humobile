'use client';

import { useState, useEffect } from 'react';
import { HiX, HiSearch, HiMap, HiTrash } from 'react-icons/hi';
import { FaCheck } from 'react-icons/fa6';
import { Profile } from '@/types/profile';

interface LugarSeleccionadoEdicion {
  id: string | null;
  nombre: string;
  direccion: string | null;
  tipo: string;
  accion: 'seleccionar' | 'editar_custom' | 'quitar';
}

interface LugarActual {
  id: string | null;
  nombre: string | null;
  direccion: string | null;
}

interface ModalSeleccionarLugarEdicionProps {
  isOpen: boolean;
  onClose: () => void;
  lugaresDisponibles: Profile[];
  lugarActual: LugarActual;
  onSeleccionar: (lugar: LugarSeleccionadoEdicion) => void;
}

export default function ModalSeleccionarLugarEdicion({
  isOpen,
  onClose,
  lugaresDisponibles,
  lugarActual,
  onSeleccionar
}: ModalSeleccionarLugarEdicionProps) {
  const [busqueda, setBusqueda] = useState('');
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [nombreCustom, setNombreCustom] = useState('');
  const [direccionCustom, setDireccionCustom] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBusqueda('');
      
      // Si ya hay un lugar personalizado cargado, abro directamente en modo edición
      if (lugarActual.nombre && !lugarActual.id) {
        setModoPersonalizado(true);
        setNombreCustom(lugarActual.nombre);
        setDireccionCustom(lugarActual.direccion || '');
      } else {
        setModoPersonalizado(false);
        setNombreCustom('');
        setDireccionCustom('');
      }
    }
  }, [isOpen, lugarActual]);

  if (!isOpen) return null;

  const lugaresFiltrados = lugaresDisponibles.filter(p => {
    const coincideBusqueda = p.nombre?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideBusqueda;
  });

  const handleSeleccionarExistente = (lugar: Profile) => {
    onSeleccionar({
      id: lugar.id,
      nombre: lugar.nombre || 'Sin nombre',
      direccion: lugar.direccion || null,
      tipo: lugar.tipo,
      accion: 'seleccionar'
    });
    onClose();
  };

  const handleGuardarPersonalizado = () => {
    if (!nombreCustom.trim()) {
      alert('Debes ingresar un nombre para el lugar');
      return;
    }
    onSeleccionar({
      id: null,
      nombre: nombreCustom.trim(),
      direccion: direccionCustom.trim() || null,
      tipo: 'lugar',
      accion: 'editar_custom'
    });
    onClose();
  };

  const handleQuitarLugar = () => {
    onSeleccionar({
      id: null,
      nombre: '',
      direccion: null,
      tipo: 'lugar',
      accion: 'quitar'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h3 className="text-lg font-bold text-white">Editar Lugar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <HiX size={24} />
          </button>
        </div>

        {/* Opciones Superiores */}
        <div className="p-4 border-b border-neutral-700 space-y-3">
          {!modoPersonalizado ? (
            <>
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  placeholder="Buscar lugar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModoPersonalizado(true);
                    setNombreCustom('');
                    setDireccionCustom('');
                  }}
                  className="flex-1 text-left px-4 py-3 border border-dashed border-neutral-600 hover:border-yellow-500 text-gray-400 hover:text-yellow-400 rounded-lg transition flex items-center gap-3 text-sm"
                >
                  <HiMap size={18} />
                  Lugar no registrado
                </button>

                {/* Solo mostrar botón "Quitar" si ya hay un lugar asignado */}
                {(lugarActual.id || lugarActual.nombre) && (
                  <button
                    type="button"
                    onClick={handleQuitarLugar}
                    className="px-4 py-3 border border-dashed border-red-700/50 hover:border-red-500 text-red-400 hover:text-red-300 rounded-lg transition flex items-center gap-2 text-sm"
                    title="Quitar lugar del evento"
                  >
                    <HiTrash size={18} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 p-1">
                <input
                  type="text"
                  value={nombreCustom}
                  onChange={(e) => setNombreCustom(e.target.value)}
                  placeholder="Nombre del lugar *"
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
                  autoFocus
                />
                <input
                  type="text"
                  value={direccionCustom}
                  onChange={(e) => setDireccionCustom(e.target.value)}
                  placeholder="Dirección del lugar (opcional)"
                  className="w-full px-4 py-2.5 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setModoPersonalizado(false)}
                className="text-xs text-gray-500 hover:text-gray-300 underline transition"
              >
                Volver a la lista de lugares
              </button>
            </>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {modoPersonalizado ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
              <p className="text-sm mb-2">Edita los datos del lugar personalizado arriba.</p>
              <p className="text-xs text-gray-600">Al guardar se actualizará la información del evento.</p>
            </div>
          ) : (
            <>
              {lugaresFiltrados.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No se encontraron lugares</p>
              ) : (
                lugaresFiltrados.map((lugar) => (
                  <div
                    key={lugar.id}
                    onClick={() => handleSeleccionarExistente(lugar)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      lugarActual.id === lugar.id 
                        ? 'bg-yellow-900/30 border-yellow-500 pointer-events-none' 
                        : 'bg-neutral-900/50 border-transparent hover:border-neutral-600'
                    }`}
                  >
                    <img 
                      src={lugar.imagen_url || '/Gemini_Generated_Image_cqos2tcqos2tcqos-removebg-preview.png'} 
                      alt={lugar.nombre} 
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{lugar.nombre || 'Sin nombre'}</p>
                      <p className="text-xs text-gray-400 truncate">{lugar.direccion || 'Sin dirección'}</p>
                    </div>
                    
                    {lugarActual.id === lugar.id && (
                      <div className="bg-yellow-600 rounded-full p-1 flex-shrink-0">
                        <FaCheck size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-700 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg text-sm transition">
            Cancelar
          </button>
          
          {modoPersonalizado && (
            <button 
              onClick={handleGuardarPersonalizado} 
              disabled={!nombreCustom.trim()}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <HiMap size={16} />
              Guardar lugar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}