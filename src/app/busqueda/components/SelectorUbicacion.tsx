'use client';
import { useState, useMemo, useEffect } from 'react';
import { FaMapMarkerAlt, FaTimesCircle, FaBullseye, FaLocationArrow } from 'react-icons/fa'; 
import { ComunaData } from '@/types/profile';
import { useUbicacion } from '@/app/hooks/useUbicacion';

export default function SelectorUbicacion({ 
  comunas, 
  onSelect 
}: { 
  comunas: ComunaData[], 
  onSelect: (lat: number | null, lon: number | null, radio: number) => void 
}) {
  const userUbicacion = useUbicacion();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [seleccionado, setSeleccionado] = useState(false);
  const [radio, setRadio] = useState(50);
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);

  // Función para encontrar y seleccionar la comuna más cercana
  const autoDetectarComuna = () => {
    if (!userUbicacion || comunas.length === 0) return;

    const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
    };

    let masCercana = comunas[0];
    let distanciaMinima = Infinity;

    comunas.forEach(comuna => {
      const d = calcularDistancia(
        userUbicacion.latitud, 
        userUbicacion.longitud, 
        Number(comuna.lat), 
        Number(comuna.lon)
      );
      if (d < distanciaMinima) {
        distanciaMinima = d;
        masCercana = comuna;
      }
    });

    if (masCercana) {
      setQuery(masCercana.nombre_comuna);
      setSeleccionado(true);
      const lat = Number(masCercana.lat);
      const lon = Number(masCercana.lon);
      setCoords({ lat, lon });
      onSelect(lat, lon, radio);
    }
  };

  // Auto-detección inicial
  useEffect(() => {
    if (userUbicacion && comunas.length > 0 && !seleccionado && query === '') {
      autoDetectarComuna();
    }
  }, [userUbicacion, comunas]);

  const filtradas = useMemo(() => {
    if (!query || seleccionado) return [];
    return comunas.filter(c => 
      c.nombre_comuna.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .includes(query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    ).slice(0, 5);
  }, [query, comunas, seleccionado]);

  const handleClear = () => {
    setQuery('');
    setSeleccionado(false);
    setCoords(null);
    onSelect(null, null, 50); 
    setIsOpen(false);
  };

  const handleRadioChange = (nuevoRadio: number) => {
    setRadio(nuevoRadio);
    if (coords) onSelect(coords.lat, coords.lon, nuevoRadio);
  };

  return (
    <div className="relative w-full space-y-3">
      <div>
        <label className="block text-sm text-neutral-400 mb-1 font-medium flex justify-between items-center">
          <span>Comuna / Ciudad</span>
          {userUbicacion && (
            <button 
              type="button"
              onClick={autoDetectarComuna}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-400/10 px-2 py-1 rounded-full transition-all"
            >
              <FaLocationArrow size={10} /> Usar mi ubicación
            </button>
          )}
        </label>
        
        <div className="relative">
          <FaMapMarkerAlt className={`absolute left-3 top-1/2 -translate-y-1/2 ${seleccionado ? 'text-green-500' : 'text-neutral-500'}`} />
          
          <input
            type="text"
            value={query}
            onChange={(e) => { 
              setQuery(e.target.value); 
              setIsOpen(true);
              if (seleccionado) setSeleccionado(false); 
            }}
            placeholder="Buscar comuna..."
            className="w-full pl-10 pr-20 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="text-neutral-500 hover:text-red-500 transition-colors p-1"
              >
                <FaTimesCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rango de distancia */}
      {seleccionado && coords && (
        <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase font-bold">
              <FaBullseye className="text-blue-500" />
              Radio de búsqueda
            </div>
            <span className="text-blue-400 font-mono font-bold text-sm">{radio} km</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            value={radio}
            onChange={(e) => handleRadioChange(parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      )}
      
      {/* Sugerencias */}
      {isOpen && filtradas.length > 0 && (
        <ul className="absolute z-[60] w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden">
          {filtradas.map((c) => (
            <li 
              key={c.id_comuna}
              onClick={() => {
                setQuery(c.nombre_comuna);
                setSeleccionado(true);
                const lat = Number(c.lat);
                const lon = Number(c.lon);
                setCoords({ lat, lon });
                onSelect(lat, lon, radio);
                setIsOpen(false);
              }}
              className="px-4 py-3 hover:bg-blue-600 cursor-pointer text-sm text-white flex justify-between items-center border-b border-neutral-700 last:border-0"
            >
              <span className="font-medium">{c.nombre_comuna}</span>
              <span className="text-[10px] opacity-60 bg-black/30 px-2 py-1 rounded">
                {c.nombre_region}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}