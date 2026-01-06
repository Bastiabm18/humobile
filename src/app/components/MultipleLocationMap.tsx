// components/LugareCercanosMap.tsx
'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

// Fix del ícono por defecto de Leaflet
import L from 'leaflet';
import { useUbicacion } from '../hooks/useUbicacion';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Marcador personalizado
const redMarkerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <path fill="#0369a1" stroke="#0c4a6e" stroke-width="2" d="M20,3C11,3 4,10 4,19c0,13 16,23 16,23s16-10 16-23C36,10 29,3 20,3z"/>
      <circle fill="#0ea5e9" cx="20" cy="19" r="9"/>
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

// TUS UBICACIONES
const locations = [
  {
    lat: -36.820135,
    lng: -73.044265,
    name: "Casa de la Música",
    type: "place",
    address: "Caupolicán 1235, Concepción"
  },
  {
    lat: -36.826990,
    lng: -73.053131,
    name: "Balmaceda Arte Joven",
    type: "place",
    address: "Colo Colo 1855, Concepción"
  },
  {
    lat: -36.829456,
    lng: -73.050789,
    name: "Artistas del Acero",
    type: "place",
    address: "O’Higgins 1235, Concepción"
  },
  {
    lat: -36.814523,
    lng: -73.035678,
    name: "Bar El Rincón",
    type: "place",
    address: "Av. Chacabuco 1780, Concepción"
  },
  {
    lat: -36.785234,
    lng: -73.089012,
    name: "La Bodeguita de Nicanor",
    type: "place",
    address: "Nicanor Parra 123, San Pedro de la Paz"
  },
  {
    lat: -36.828112,
    lng: -73.048923,
    name: "Sala 2",
    type: "place",
    address: "Aníbal Pinto 123, Concepción"
  },
  {
    lat: -36.783456,
    lng: -73.075432,
    name: "El Refugio",
    type: "place",
    address: "Lagunillas, San Pedro de la Paz"
  },
  {
    lat: -36.812345,
    lng: -73.042198,
    name: "La Casa del Viento",
    type: "place",
    address: "Barros Arana 789, Concepción"
  },
  {
    lat: -36.839876,
    lng: -73.061234,
    name: "Rock & Blues",
    type: "place",
    address: "Av. Los Carrera 2345, Hualpén"
  },
  {
    lat: -36.770123,
    lng: -73.065432,
    name: "El Túnel",
    type: "place",
    address: "Camino a Lenga, Hualpén"
  }
];

export default function LugareCercanosMap() {
  const center = useMemo(() => {
    if (locations.length === 0) return [-36.827, -73.050] as [number, number];
    const avgLat = locations.reduce((a, b) => a + b.lat, 0) / locations.length;
    const avgLng = locations.reduce((a, b) => a + b.lng, 0) / locations.length;
    return [avgLat, avgLng] as [number, number];
  }, []);

  const ubicacion =  useUbicacion();
  
  console.log('mapa ubicacion: ',ubicacion?.latitud,ubicacion?.longitud);

  const accessToken = 'pk.eyJ1IjoiYXZlZ2FwNDEiLCJhIjoiY2tibWtpdGttMGl1NjJybjhjNTVxaGtpcyJ9.dLbDgSiWkdlq8SyzhREO7A';
  const tileUrl = `https://api.mapbox.com/styles/v1/mapbox/navigation-night-v1/tiles/{z}/{x}/{y}?access_token=${accessToken}`;

  return (
    <div className="bg-neutral-900/90 w-[90vw] rounded-md overflow-hidden p-5 relative z-0"> {/* z-0 aquí */}
      {/* HEADER */}
      <div className="p-5">
        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-4">
          <FaMapMarkerAlt className="text-sky-500" />
          Cerca de ti
          <span className="text-sky-600 font-bold text-lg rounded-full bg-gray-300 px-1 ml-2">{locations.length}</span>
        </h2>
      </div>

      {/* MAPA con z-index controlado */}
      <div className="h-96 md:h-screen max-h-[700px] relative z-0"> {/* z-0 aquí también */}
        <MapContainer
          center={center}
          zoom={5}
          style={{ 
            height: '100%', 
            width: '100%',
            position: 'relative',
            zIndex: '0' // Forzar z-index
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

          {locations.map((loc, i) => (
            <Marker key={i} position={[loc.lat, loc.lng]} icon={redMarkerIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-sky-400 text-lg">{loc.name}</p>
                  <p className="text-sm text-gray-300">Local</p>
                  {loc.address && <p className="text-xs text-gray-400 mt-1">{loc.address}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}