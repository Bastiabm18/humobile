'use client';

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

// INTERFACES para los filtros
interface FiltrosEventos {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoEvento?: string;
  artista?: string;
}

interface FiltrosPerfiles {
  artista: boolean;
  banda: boolean;
  local: boolean;
  lugar: boolean;
  productor: boolean;
  representante: boolean;
}

// PROPS que recibe el componente
interface BuscadorProps {
  onBuscar: (query: string, filtros: FiltrosEventos | FiltrosPerfiles) => void;
  tipo: 'eventos' | 'perfiles';
  onTipoChange: (tipo: 'eventos' | 'perfiles') => void;

}

export default function Buscador({ onBuscar, tipo, onTipoChange }: BuscadorProps) {
  const [query, setQuery] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const filtrosEventosIniciales: FiltrosEventos = {
    fechaDesde: '',
    fechaHasta: '',
    tipoEvento: '',
    artista: ''
  };

  const filtrosPerfilesIniciales: FiltrosPerfiles = {
    artista: true,
    banda: true,
    local: true,
    lugar: true,
    productor: false,
    representante: false
  };
  
  const [filtrosEventos, setFiltrosEventos] = useState<FiltrosEventos>(filtrosEventosIniciales);
  const [filtrosPerfiles, setFiltrosPerfiles] = useState<FiltrosPerfiles>(filtrosPerfilesIniciales);

  // Enviar búsqueda cuando cambia el query
  useEffect(() => {
    if (tipo === 'eventos') {
      onBuscar(query, filtrosEventos);
    } else {
      onBuscar(query, filtrosPerfiles);
    }
  }, [query]); // Solo cuando cambia el query

  // Enviar búsqueda cuando cambian los filtros
  useEffect(() => {
    if (tipo === 'eventos') {
      onBuscar(query, filtrosEventos);
    } else {
      onBuscar(query, filtrosPerfiles);
    }
  }, [filtrosEventos, filtrosPerfiles, tipo]); // Cuando cambian filtros o tipo

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // El submit ya no es necesario porque se hace automáticamente
  };

  const handleTogglePerfil = (tipoPerfil: keyof FiltrosPerfiles) => {
    const nuevosFiltros = {
      ...filtrosPerfiles,
      [tipoPerfil]: !filtrosPerfiles[tipoPerfil]
    };
    setFiltrosPerfiles(nuevosFiltros);
  };

  const handleLimpiarFiltros = () => {
    // Limpiar el query
    setQuery('');
    
    // Resetear filtros según el tipo
    if (tipo === 'eventos') {
      setFiltrosEventos(filtrosEventosIniciales);
    } else {
      setFiltrosPerfiles(filtrosPerfilesIniciales);
    }
    

  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* ========== SELECTOR DE TIPO ========== */}
      <div className="flex mb-6">
        <button
          onClick={() => {
            onTipoChange('eventos');
            setQuery(''); // Limpiar query al cambiar tipo
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-3 rounded-l-lg ${
            tipo === 'eventos' 
              ? 'bg-blue-600/80 text-white' 
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          } transition-colors`}
        >
          <FaCalendarAlt className="w-5 h-5" />
          <span className="font-medium">Eventos</span>
        </button>
        
        <button
          onClick={() => {
            onTipoChange('perfiles');
            setQuery(''); // Limpiar query al cambiar tipo
          }}
          className={`flex-1 py-3 flex items-center justify-center gap-3 rounded-r-lg ${
            tipo === 'perfiles' 
              ? 'bg-orange-600/80 text-white' 
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          } transition-colors`}
        >
          <FaUser className="w-5 h-5" />
          <span className="font-medium">Perfiles</span>
        </button>
      </div>

      {/* ========== FORMULARIO ========== */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={(e) => {
              // Esto envía la búsqueda cuando el usuario deja de escribir
              // No es necesario si usamos useEffect, pero es otra opción
            }}
            placeholder={`Buscar ${tipo === 'eventos' ? 'conciertos, shows, festivales...' : 'artistas, bandas, locales...'}`}
            className="w-full px-5 py-3 pl-12 pr-36 rounded-xl border border-neutral-700 bg-neutral-900 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    
          <div className="flex absolute right-2 top-1/2 -translate-y-1/2">
            {query && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="px-3 py-2 mr-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-lg transition-colors flex items-center gap-2"
                title="Limpiar búsqueda y filtros"
              >
                <FaTimes className="w-3 h-3" />
                <span className="text-sm">Limpiar</span>
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Indicador de búsqueda en tiempo real */}
        {query && (
          <div className="text-xs text-neutral-500 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Buscando...</span>
          </div>
        )}

        {/* ========== BOTÓN FILTROS ========== */}
        <button
          type="button"
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
        >
          <FaFilter className="w-4 h-4" />
          <span>{mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
        </button>

        {/* ========== FILTROS EVENTOS ========== */}
        {mostrarFiltros && tipo === 'eventos' && (
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700 space-y-4">
            <h3 className="text-white font-medium">Filtros de eventos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Fecha desde</label>
                <input
                  type="datetime-local"
                  value={filtrosEventos.fechaDesde || ''}
                  onChange={(e) => setFiltrosEventos({
                    ...filtrosEventos, 
                    fechaDesde: e.target.value
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Fecha hasta</label>
                <input
                  type="datetime-local"
                  value={filtrosEventos.fechaHasta || ''}
                  onChange={(e) => setFiltrosEventos({
                    ...filtrosEventos, 
                    fechaHasta: e.target.value
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Tipo de evento</label>
                <select
                  value={filtrosEventos.tipoEvento || ''}
                  onChange={(e) => setFiltrosEventos({
                    ...filtrosEventos, 
                    tipoEvento: e.target.value
                  })}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white"
                >
                  <option value="">Todos los tipos</option>
                  <option value="concierto">Concierto</option>
                  <option value="festival">Festival</option>
                  <option value="show">Show</option>
                  <option value="privado">Privado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Artista</label>
                <input
                  type="text"
                  value={filtrosEventos.artista || ''}
                  onChange={(e) => setFiltrosEventos({
                    ...filtrosEventos, 
                    artista: e.target.value
                  })}
                  placeholder="Nombre del artista"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-700 border border-neutral-600 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========== FILTROS PERFILES ========== */}
        {mostrarFiltros && tipo === 'perfiles' && (
          <div className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <h3 className="text-white font-medium mb-4">Tipos de perfil</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(filtrosPerfiles).map(([tipoPerfil, activo]) => (
                <button
                  key={tipoPerfil}
                  type="button"
                  onClick={() => handleTogglePerfil(tipoPerfil as keyof FiltrosPerfiles)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                    activo 
                      ? 'bg-orange-600/80 text-white' 
                      : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600 hover:text-white'
                  }`}
                >
                  <span className="capitalize">{tipoPerfil}</span>
                  <div className={`w-2 h-2 rounded-full ${activo ? 'bg-white' : 'bg-transparent border border-neutral-500'}`} />
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}