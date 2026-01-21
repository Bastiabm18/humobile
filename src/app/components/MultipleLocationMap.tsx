// components/LugareCercanosMap.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react'; // Añadir useState
import { MapContainer, TileLayer, Marker, Popup, useMap,Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaEye, FaMapMarkerAlt, FaMarker, FaRedo } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Añadir import de la acción
import { obtenerLugaresCercanos} from '../actions/actions'
// Fix del ícono por defecto de Leaflet
import L from 'leaflet';
import { useUbicacion } from '../hooks/useUbicacion';
import { lugarMapa } from '@/types/mapa';
import { FaRulerCombined, FaSpinner } from 'react-icons/fa6';
import { CiLocationOn } from 'react-icons/ci';
import { BsEye } from 'react-icons/bs';
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

function FitBounds({ 
  userLocation, 
  radiusKm 
}: { 
  userLocation: {lat: number, lng: number} | null,
  radiusKm: number
}) {
  const map = useMap();
  
  useEffect(() => {
    if (!userLocation) {
      console.log(' No hay ubicación del usuario');
      return;
    }
    
    console.log(' Ajustando vista con:', { userLocation, radiusKm });
    
    // 1 grado ≈ 111 km (aproximación)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(userLocation.lat * Math.PI / 180));
    
    const bounds = L.latLngBounds([
      [userLocation.lat - latDelta, userLocation.lng - lngDelta],
      [userLocation.lat + latDelta, userLocation.lng + lngDelta]
    ]);
    
    console.log(' Bounds calculados:', bounds);
    
    // Ajustar vista
    map.fitBounds(bounds, { 
      padding: [30, 30],
      maxZoom: 15,
      animate: true
    });
    
  }, [userLocation?.lat, userLocation?.lng, radiusKm]); // Se ejecuta cuando estos cambian
  
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
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false); 
  const [radioKm, setRadioKm] = useState<number>(10); //  Radio en km
  const [mostrarRadio, setMostrarRadio] = useState<boolean>(true); //Controlar visibilidad
  const [sliderAbierto, setSliderAbierto] = useState<boolean>(false); // Controlar slider
  
  
  // Obtener lugares reales cuando tenemos ubicación
  useEffect(() => {
    if (!ubicacion?.latitud || !ubicacion?.longitud) return;
    
    const cargarLugares = async () => {
      setCargando(true);
      try {
        const lugares = await obtenerLugaresCercanos(
          ubicacion.latitud,
          ubicacion.longitud,
          radioKm
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
  }, [ubicacion,radioKm]);
  
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
 // Función para cambiar el radio
  const cambiarRadio = (nuevoRadio: number) => {
    setRadioKm(nuevoRadio);
    console.log(`Radio cambiado a: ${nuevoRadio}km`);
  };

  // Función para formatear el radio para display
  const formatearRadio = (km: number) => {
    if (km >= 100) return `${km}km`;
    if (km >= 10) return `${km}km`;
    return `${km}km`;
  };


  const actualizarUbicacion = () => {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }
  
  setCargandoUbicacion(true);
  
  const opciones = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };
  
  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      setCargandoUbicacion(false);
      
      const nuevaUbicacion = {
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude
      };
      
      console.log('📍 Nueva ubicación obtenida:', nuevaUbicacion);
      
      // Guardar en localStorage
      localStorage.setItem('ubicacionUsuario', JSON.stringify(nuevaUbicacion));
      
      // Forzar actualización del hook useUbicacion
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'ubicacionUsuario',
        newValue: JSON.stringify(nuevaUbicacion),
        oldValue: localStorage.getItem('ubicacionUsuario'),
        storageArea: localStorage
      }));
      
      
    },
    (error) => {
      setCargandoUbicacion(false);
      console.error('Error actualizando ubicación:', error);
      
      let mensaje = 'No se pudo obtener la nueva ubicación';
      if (error.code === 1) {
        mensaje = 'Permiso denegado. Debes permitir la ubicación en tu navegador.';
      } else if (error.code === 2) {
        mensaje = 'Ubicación no disponible. Verifica tu conexión o GPS.';
      } else if (error.code === 3) {
        mensaje = 'Tiempo de espera agotado. Intenta nuevamente.';
      }
      
      alert(mensaje);
    },
    opciones
  );
};
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
          zoom={16}
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

          <FitBounds  userLocation={ubicacion ? {lat: ubicacion.latitud, lng: ubicacion.longitud} : null}
                       radiusKm={radioKm} />
          <ResetLeafletZIndex />

             {/* 👇 CÍRCULO DEL RADIO - AGREGAR AQUÍ */}
    {ubicacion?.latitud && ubicacion?.longitud && mostrarRadio && (
      <Circle
        center={[ubicacion.latitud, ubicacion.longitud]}
        radius={radioKm * 1000} // Convertir km a metros
        pathOptions={{
          color: '#3b82f6', // azul-500
          fillColor: '#1d4ed8', // azul-700
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '5, 10'
        }}
      >
        <Popup>
          <div className="text-center">
            <p className="font-bold text-blue-600">Radio de búsqueda</p>
            <p className="text-sm">{radioKm} km alrededor de tu ubicación</p>
          </div>
        </Popup>
      </Circle>
    )}


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
                    <p className="text-xs text-green-600 mt-2 flex flex-row w-full items-center justify-center">
                      <CiLocationOn/> A {(loc as any).distancia_km.toFixed(1)} km
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

     <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end gap-2">
      {/* Slider expandible */}
      {sliderAbierto && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className="bg-neutral-800/50 backdrop-blur-sm p-4 bottom-0 absolute rounded-lg shadow-2xl border border-neutral-400/70 w-64 md:w-82"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-white">Radio de búsqueda</h3>
            <button
              onClick={() => setMostrarRadio(!mostrarRadio)}
              className={`p-1 rounded ${mostrarRadio ? 'bg-blue-500' : 'bg-neutral-600'}`}
              title={mostrarRadio ? "Ocultar radio" : "Mostrar radio"}
            >
              {mostrarRadio ? <FaEye/> : <BsEye/>}
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-neutral-300 text-sm">Radio actual:</span>
              <span className="text-blue-400 font-bold">{formatearRadio(radioKm)}</span>
            </div>
            
            {/* Slider */}
            <input
              type="range"
              min="5"
              max="300"
              step="5"
              value={radioKm}
              onChange={(e) => cambiarRadio(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
            
            {/* Marcas del slider */}
            <div className="flex justify-between text-xs text-neutral-400 mt-1">
              <span>5km</span>
              <span>50km</span>
              <span>150km</span>
              <span>300km</span>
            </div>
          </div>
          
          {/* Botones de radio rápido */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[10, 25, 50, 75, 100, 150].map((km) => (
              <button
                key={km}
                onClick={() => cambiarRadio(km)}
                className={`py-2 rounded text-sm transition-colors ${
                  radioKm === km 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                }`}
              >
                {km}km
              </button>
            ))}
          </div>
          
          {/* Información */}
          <div className="text-xs text-neutral-400 border-t border-neutral-700 pt-3">
            <p className='flex flex-row items-center justify-center gap-2'> <FaMarker/> Buscando lugares en un radio de {radioKm}km</p>
            <p className='flex flex-row items-center justify-center gap-2'> <FaRulerCombined/> Diámetro: {radioKm * 2}km</p>
          </div>
        </motion.div>
      )}
      
      {/* Botón principal flotante */}
      <button
        onClick={() => setSliderAbierto(!sliderAbierto)}
        className="flex z-50 items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 border border-blue-400"
      >
        {sliderAbierto ? (
          <>
            <span>✕ Cerrar</span>
          </>
        ) : (
          <>
            <FaRulerCombined /> {/* 👈 Necesitarás importar este ícono */}
            <span>Ajustar radio ({radioKm}km)</span>
          </>
        )}
      </button>
    </div>
    
    {/* Botón de actualizar ubicación (mantener el anterior pero más arriba) */}
    <div className="absolute top-36 right-6 z-[1000]">
      <button
        onClick={actualizarUbicacion}
        disabled={cargandoUbicacion}
        className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-green-400"
      >
        {cargandoUbicacion ? (
          <>
            <FaSpinner className="animate-spin" />
            <span>Obteniendo...</span>
          </>
        ) : (
          <>
            <FaRedo />
            <span>Actualizar ubicación</span>
          </>
        )}
      </button>
    </div>
    </div>
  );
}