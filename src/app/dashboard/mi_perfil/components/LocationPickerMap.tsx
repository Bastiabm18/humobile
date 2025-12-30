// /components/LocationPickerMap.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para el ícono por defecto de Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [-36.827035635947574, -73.05020459780704];

interface LocationPickerMapProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

// Subcomponente que maneja clics, marcador y resize correcto
function LocationMarkerHandler({
  onLocationSelect,
  initialPosition,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition: [number, number];
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  // Forzar invalidateSize cuando el modal ya está visible
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  // Sincronizar posición inicial
  useEffect(() => {
    if (initialPosition[0] !== 0 || initialPosition[1] !== 0) {
      setPosition(initialPosition);
      map.setView(initialPosition, 16);
    }
  }, [initialPosition, map]);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
      map.setView(newPos, 9);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

// Componente Principal
export default function LocationPickerMap({
  initialLat,
  initialLng,
  onLocationSelect,
  onClose,
}: LocationPickerMapProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detectar tema oscuro
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const centerPosition: [number, number] = useMemo(() => {
    return initialLat !== 0 && initialLng !== 0
      ? [initialLat, initialLng]
      : defaultCenter;
  }, [initialLat, initialLng]);

  // Tu token (funciona, ya lo confirmaste)
  const accessToken = 'pk.eyJ1IjoiYXZlZ2FwNDEiLCJhIjoiY2tibWtpdGttMGl1NjJybjhjNTVxaGtpcyJ9.dLbDgSiWkdlq8SyzhREO7A';
  const mapStyleId =  'mapbox/navigation-night-v1' ;
  const tileUrl = `https://api.mapbox.com/styles/v1/${mapStyleId}/tiles/{z}/{x}/{y}?access_token=${accessToken}`;
  const attribution = 'Map data &copy; OpenStreetMap contributors, Imagery © Mapbox';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col text-white">
        <h3 className="text-2xl font-bold mb-2">Seleccionar ubicación del local</h3>
        <p className="text-sm text-gray-300 mb-4">
          Haz clic en el mapa para colocar el marcador en la ubicación exacta.
        </p>

        {/* CONTENEDOR FIJO DEL MAPA - ESTO ES LO QUE LO HACE FUNCIONAR */}
        <div className="relative w-full h-[60vh] min-h-[500px] max-h-[70vh] rounded-lg overflow-hidden border border-gray-700">
          <MapContainer
            center={centerPosition}
            zoom={16}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="absolute inset-0"
            key={`${isDarkMode}-${centerPosition[0]}-${centerPosition[1]}`}
          >
            <TileLayer
              attribution={attribution}
              url={tileUrl}
              tileSize={512}
              zoomOffset={-1}
              maxZoom={22}
              key={mapStyleId}
            />

            <LocationMarkerHandler
              onLocationSelect={onLocationSelect}
              initialPosition={centerPosition}
            />
          </MapContainer>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-lg"
          >
            Confirmar y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}