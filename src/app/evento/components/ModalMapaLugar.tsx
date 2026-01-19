// components/ModalMapaLugar.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Fix del ícono por defecto de Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Marcador rojo personalizado
const redMarkerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <path fill="#dc2626" stroke="#7f1d1d" stroke-width="3" d="M20,3C11,3 4,10 4,19c0,13 16,23 16,23s16-10 16-23C36,10 29,3 20,3z"/>
      <circle fill="#7f1d1d" cx="20" cy="19" r="9"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ModalMapaLugarProps {
  isOpen: boolean;
  onClose: () => void;
  latitud: number;
  longitud: number;
  nombreLugar: string;
  direccion?: string;
}

// Componente para ajustar el mapa a la ubicación
function FitMapToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, {
        animate: true,
        duration: 1
      });
    }
  }, [lat, lng, map]);

  return null;
}

export default function ModalMapaLugar({
  isOpen,
  onClose,
  latitud,
  longitud,
  nombreLugar,
  direccion
}: ModalMapaLugarProps) {


    const center = useMemo(() => {
    if (latitud && longitud) {
      return [latitud, longitud] as [number, number];
    }
    return [-36.827, -73.050] as [number, number]; // Fallback a Concepción
  }, [latitud, longitud]);

  const accessToken = 'pk.eyJ1IjoiYXZlZ2FwNDEiLCJhIjoiY2tibWtpdGttMGl1NjJybjhjNTVxaGtpcyJ9.dLbDgSiWkdlq8SyzhREO7A';
  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token=${accessToken}`;

  // Si no tenemos coordenadas válidas, mostramos mensaje
  const hasValidCoords = latitud && longitud && !isNaN(latitud) && !isNaN(longitud);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl bg-neutral-900/90 border border-sky-600/40 rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/60"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-sky-600/30 bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-600/20 rounded-lg">
                  <FaMapMarkerAlt className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    {nombreLugar || 'Ubicación del lugar'}
                  </h2>
                  {direccion && (
                    <p className="text-sm text-neutral-400 mt-1">{direccion}</p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                aria-label="Cerrar mapa"
              >
                <FaTimes className="w-5 h-5 text-neutral-400 hover:text-white" />
              </button>
            </div>

            {/* Contenido - Mapa o mensaje de error */}
            <div className="h-[60vh] md:h-[70vh]">
              {hasValidCoords ? (
                <MapContainer
                  center={center}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  className="rounded-b-2xl"
                >
                  <TileLayer
                    attribution='© OpenStreetMap © Mapbox'
                    url={tileUrl}
                    tileSize={512}
                    zoomOffset={-1}
                    maxZoom={22}
                  />

                  <FitMapToLocation lat={latitud} lng={longitud} />

                  <Marker position={[latitud, longitud]} icon={redMarkerIcon}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-sky-400 text-lg">{nombreLugar}</p>
                        {direccion && (
                          <p className="text-sm text-gray-300 mt-1">{direccion}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Coordenadas: {latitud.toFixed(6)}, {longitud.toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="p-4 bg-sky-600/20 rounded-full mb-4">
                    <FaMapMarkerAlt className="w-12 h-12 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ubicación no disponible
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    No se encontraron coordenadas válidas para mostrar en el mapa.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="p-4 bg-neutral-800/50 rounded-xl">
                      <p className="text-sm text-neutral-400">Latitud</p>
                      <p className="text-white font-mono">{latitud || 'No disponible'}</p>
                    </div>
                    <div className="p-4 bg-neutral-800/50 rounded-xl">
                      <p className="text-sm text-neutral-400">Longitud</p>
                      <p className="text-white font-mono">{longitud || 'No disponible'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con información */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-sky-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-neutral-400">
                    Marcador: <span className="text-white font-medium">{nombreLugar}</span>
                  </p>
                </div>
                
                {hasValidCoords && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-neutral-400">
                      <span className="text-white font-mono">{latitud.toFixed(6)}</span>
                      <span className="mx-2">|</span>
                      <span className="text-white font-mono">{longitud.toFixed(6)}</span>
                    </div>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
                        window.open(url, '_blank');
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                       Buscar ruta
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}