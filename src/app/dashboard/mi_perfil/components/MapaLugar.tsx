// /components/MapaLugar.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { IoNavigate } from 'react-icons/io5';

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
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path fill="#ef4444" stroke="#7f1d1d" stroke-width="2" d="M16,2C8,2 2,8 2,16c0,10 14,18 14,18s14-8 14-18C30,8 24,2 16,2z"/>
      <circle fill="#7f1d1d" cx="16" cy="16" r="7"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapaLugarProps {
  latitud: number | null;
  longitud: number | null;
  nombreLugar: string;
  direccion?: string;
  compacto?: boolean;
}

function FitMapToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapaLugar({
  latitud,
  longitud,
  nombreLugar,
  direccion,
  compacto = false
}: MapaLugarProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);



  const hasValidCoords = latitud && longitud && !isNaN(latitud) && !isNaN(longitud);

  const center = useMemo(() => {
    return hasValidCoords ? [latitud, longitud] as [number, number] : [-36.827, -73.050] as [number, number];
  }, [latitud, longitud, hasValidCoords]);

  const accessToken = 'pk.eyJ1IjoiYXZlZ2FwNDEiLCJhIjoiY2tibWtpdGttMGl1NjJybjhjNTVxaGtpcyJ9.dLbDgSiWkdlq8SyzhREO7A';
  const mapStyleId = isDarkMode ? 'mapbox/navigation-night-v1' : 'mapbox/streets-v11';
  const tileUrl = `https://api.mapbox.com/styles/v1/${mapStyleId}/tiles/{z}/{x}/{y}?access_token=${accessToken}`;

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!hasValidCoords) {
    return (
      <div className={`w-full rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800 ${compacto ? 'h-48' : 'h-64'}`}>
        <div className="h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="p-3 bg-neutral-700/50 rounded-full mb-3">
            <FaMapMarkerAlt className="w-6 h-6 text-neutral-500" />
          </div>
          <h4 className="text-sm font-medium text-neutral-300 mb-1">
            Ubicación no disponible
          </h4>
          <p className="text-neutral-500 text-xs">
            No se configuraron coordenadas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-lg overflow-hidden border border-neutral-700 ${compacto ? 'h-48' : 'h-64'}`}>
      <div className="relative h-full">
        <MapContainer
          center={center}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
         
          className="rounded-lg"
          key={`${mapLoaded}-${latitud}-${longitud}`}
        >
          <TileLayer
            url={tileUrl}
            tileSize={512}
            zoomOffset={-1}
            maxZoom={22}
          />
          <FitMapToLocation lat={latitud} lng={longitud} />
          <Marker position={[latitud, longitud]} icon={redMarkerIcon}>
            <Popup className="custom-popup">
              <div className="p-2 text-center min-w-[200px]">
                <p className="font-bold text-neutral-900 text-sm">{nombreLugar}</p>
                {direccion && <p className="text-xs text-gray-600 mt-1">{direccion}</p>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        
        {/* Overlay con botones */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
              window.open(url, '_blank');
            }}
            className="px-3 py-1.5 bg-neutral-800/90 hover:bg-neutral-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 backdrop-blur-sm border border-neutral-600"
            title="Abrir en Google Maps"
          >
            <IoNavigate className="w-3 h-3" />
            <span>Llegar</span>
          </button>
        </div>
        
        {/* Coordenadas */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
            <span className="font-mono">
              {latitud?.toFixed(4)}, {longitud?.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}