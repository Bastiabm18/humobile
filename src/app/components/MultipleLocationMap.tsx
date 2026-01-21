// components/LugareCercanosMap.tsx
'use client';

import { useEffect, useMemo, useState } from 'react'; // Añadir useState
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Añadir import de la acción
import { obtenerLugaresCercanos} from '../actions/actions'
// Fix del ícono por defecto de Leaflet
import L from 'leaflet';
import { useUbicacion } from '../hooks/useUbicacion';
import { lugarMapa } from '@/types/mapa';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Marcador personalizado para el usuario
const userMarkerIcon =  new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
     
      <ellipse cx="24" cy="16" rx="12" ry="14" fill="#0ea5e9" stroke="#0369a1" stroke-width="2"/>
      <path d="M12,16 Q24,56 36,16" fill="#0ea5e9" stroke="#0369a1" stroke-width="2"/>
      <text x="24" y="24" font-family="Arial" font-size="12" font-weight="bold" fill="white" text-anchor="middle">TU</text>
    </svg>
  `),
  iconSize: [48, 56],
  iconAnchor: [24, 56],
  popupAnchor: [0, -56],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
// Marcador para los lugares (azul)
const lugarMarkerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <path fill="#ef4444" stroke="#dc2626" stroke-width="2" d="M20,5 L24,15 L35,16 L27,24 L29,35 L20,30 L11,35 L13,24 L5,16 L16,15 Z"/>
      <circle fill="#f87171" cx="20" cy="20" r="8"/>
      <text x="20" y="22" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">H</text>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ajusta el zoom
function FitBounds({ locations }: { locations: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [65, 65], maxZoom: 15 });
  }, [locations, map]);
  return null;
}

// Componente para resetear z-index de Leaflet
function ResetLeafletZIndex() {
  const map = useMap();

  useEffect(() => {
    // Resetear z-index de los contenedores principales de Leaflet
    const leafletContainer = map.getContainer();
    const leafletPane = leafletContainer.querySelector('.leaflet-pane');
    const leafletMapPane = leafletContainer.querySelector('.leaflet-map-pane');
    
    if (leafletPane) {
      (leafletPane as HTMLElement).style.zIndex = '0';
    }
    if (leafletMapPane) {
      (leafletMapPane as HTMLElement).style.zIndex = '0';
    }
    
    // También los popups y controles
    setTimeout(() => {
      const popups = leafletContainer.querySelectorAll('.leaflet-popup');
      const controls = leafletContainer.querySelectorAll('.leaflet-control');
      
      popups.forEach(popup => {
        (popup as HTMLElement).style.zIndex = '20';
      });
      
      controls.forEach(control => {
        (control as HTMLElement).style.zIndex = '10';
      });
    }, 100);
  }, [map]);

  return null;
}

export default function LugareCercanosMap() {
  const ubicacion = useUbicacion();
  const [lugaresReales, setLugaresReales] = useState<lugarMapa[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // Obtener lugares reales cuando tenemos ubicación
  useEffect(() => {
    if (!ubicacion?.latitud || !ubicacion?.longitud) return;
    
    const cargarLugares = async () => {
      setCargando(true);
      try {
        const lugares = await obtenerLugaresCercanos(
          ubicacion.latitud,
          ubicacion.longitud,
          10 // Radio de 10km
        );
        setLugaresReales(lugares);
        console.log('Lugares encontrados:', lugares.length);
      } catch (error) {
        console.error('Error cargando lugares:', error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarLugares();
  }, [ubicacion]);
  
  // Usar lugares reales o ficticios si no hay resultados
  const locations = useMemo(() => {
    if (lugaresReales.length > 0) {
      return lugaresReales.map(lugar => ({
        lat: lugar.lat,
        lng: lugar.lon,
        name: lugar.nombre,
        type: lugar.tipo,
        address: lugar.direccion,
        imagen_url: lugar.imagen_url || '',
        distancia_km: lugar.distancia_km
      }));
    }
    
    // Si no hay lugares reales, mostrar ficticios
    return [
      {
        lat: -36.820135,
        lng: -73.044265,
        name: "Casa de la Música",
        type: "place",
        address: "Caupolicán 1235, Concepción",
        imagen_url:''
      },
      // ... resto de tus datos ficticios
    ];
  }, [lugaresReales]);

  const center = useMemo(() => {
    // Si tenemos ubicación del usuario, usarla como centro
    if (ubicacion?.latitud && ubicacion?.longitud) {
      return [ubicacion.latitud, ubicacion.longitud] as [number, number];
    }
    
    // Si no, usar promedio de locations
    if (locations.length === 0) return [-36.827, -73.050] as [number, number];
    const avgLat = locations.reduce((a, b) => a + b.lat, 0) / locations.length;
    const avgLng = locations.reduce((a, b) => a + b.lng, 0) / locations.length;
    return [avgLat, avgLng] as [number, number];
  }, [ubicacion, locations]);

  console.log('mapa ubicacion: ', ubicacion?.latitud, ubicacion?.longitud);
  console.log('lugares cargados: ', lugaresReales.length);

  const accessToken = 'pk.eyJ1IjoiYXZlZ2FwNDEiLCJhIjoiY2tibWtpdGttMGl1NjJybjhjNTVxaGtpcyJ9.dLbDgSiWkdlq8SyzhREO7A';
  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token=${accessToken}`;

  return (
    <div className="bg-neutral-900/90 w-[90vw] rounded-md overflow-hidden p-5 relative z-0">
      {/* HEADER */}
      <div className="p-5">
        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-4">
          <FaMapMarkerAlt className="text-sky-500" />
          Cerca de ti
          <span className="text-sky-600 font-bold text-lg rounded-full bg-gray-300 px-1 ml-2">
            {lugaresReales.length > 0 ? lugaresReales.length : locations.length}
          </span>
          {cargando && (
            <span className="text-sm text-neutral-400 ml-2">
              <span className="animate-pulse">Cargando...</span>
            </span>
          )}
        </h2>
        {ubicacion && lugaresReales.length > 0 && (
          <p className="text-neutral-400 text-sm mt-2">
            Mostrando {lugaresReales.length} lugares en un radio de 10km
          </p>
        )}
      </div>

      {/* MAPA con z-index controlado */}
      <div className="h-96 md:h-screen max-h-[700px] relative z-0">
        <MapContainer
          center={center}
          zoom={13}
          style={{ 
            height: '100%', 
            width: '100%',
            position: 'relative',
            zIndex: '0'
          }}
          className="leaflet-container-custom"
        >
          <TileLayer
            attribution='© OpenStreetMap © Mapbox'
            url={tileUrl}
            tileSize={512}
            zoomOffset={-1}
            maxZoom={22}
          />

          <FitBounds locations={locations} />
          <ResetLeafletZIndex />

          {/* Marcador del usuario */}
          {ubicacion?.latitud && ubicacion?.longitud && (
            <Marker 
              position={[ubicacion.latitud, ubicacion.longitud]} 
              icon={userMarkerIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-red-500 text-lg">Tu Ubicación</p>
                  <p className="text-sm text-gray-600">Aquí estás tú</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcadores de lugares */}
          {locations.map((loc, i) => (
            <Marker key={i} position={[loc.lat, loc.lng]} icon={lugarMarkerIcon}>
              <Popup>
                <div className="text-center min-w-[200px]">
                  <p className="font-bold text-sky-600 text-lg">{loc.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{loc.type}</p>
                  {loc.address && <p className="text-xs text-gray-500 mt-1">{loc.address}</p>}
                  {'distancia_km' in loc && (
                    <p className="text-xs text-green-600 mt-2">
                      📍 A {(loc as any).distancia_km.toFixed(1)} km
                    </p>
                  )}
                  {loc.imagen_url && (
                    <img 
                      src={loc.imagen_url} 
                      alt={loc.name}
                      className="mt-2 rounded w-full h-20 object-cover"
                    />
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}