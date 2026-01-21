// app/components/PermisoUbicacion.tsx - VERSIÓN CORREGIDA
'use client';

import { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaTimes, 
  FaCheck, 
  FaCalendarAlt, 
  FaUsers, 
  FaExclamationTriangle,
  FaMusic,
  FaGlassCheers,
  FaMapPin,
  FaLocationArrow
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function PermisoUbicacion() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [estadoPermiso, setEstadoPermiso] = useState<'pendiente' | 'otorgado' | 'denegado'>('pendiente');
  const [ubicacionObtenida, setUbicacionObtenida] = useState<{latitud: number, longitud: number} | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);

  // Verificar si ya se tomó una decisión anteriormente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const permiso = localStorage.getItem('permisoUbicacion');
    
    if (permiso === 'otorgado') {
      setEstadoPermiso('otorgado');
      
      const ubicacion = localStorage.getItem('ubicacionUsuario');
      if (ubicacion) {
        try {
          const datos = JSON.parse(ubicacion);
          setUbicacionObtenida(datos);
          imprimirUbicacion(datos);
        } catch (error) {
          console.error('Error al parsear ubicación:', error);
        }
      }
      return;
    }
    
    if (permiso === 'denegado') {
      setEstadoPermiso('denegado');
      return;
    }

    // Solo mostrar si no ha decidido
    const timer = setTimeout(() => {
      setMostrarModal(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const imprimirUbicacion = (ubicacion: {latitud: number, longitud: number}) => {
    console.log('📍 === UBICACIÓN OBTENIDA ===');
    console.log('📱 Latitud:', ubicacion.latitud);
    console.log('📱 Longitud:', ubicacion.longitud);
    console.log('📍 Coordenadas:', ubicacion);
    console.log('✅ Permiso de ubicación: OTORGADO');
  };

  const solicitarUbicacion = async () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setCargando(true);
    setErrorUbicacion(null);

    console.log('📍 Solicitando permiso de ubicación...');

    // PRIMERO: Verificar si podemos acceder a la API de permisos
    if (navigator.permissions) {
      try {
        const resultado = await navigator.permissions.query({ name: 'geolocation' });
        console.log('🔍 Estado del permiso:', resultado.state);
        
        if (resultado.state === 'denied') {
          setCargando(false);
          setErrorUbicacion('Ya has denegado el permiso de ubicación. Debes habilitarlo manualmente en la configuración de tu navegador.');
          setMostrarInstrucciones(true);
          return;
        }
      } catch (error) {
        console.log('⚠️ No se pudo verificar el estado del permiso:', error);
      }
    }

    // SEGUNDO: Intentar obtener la ubicación
    const opciones = {
      enableHighAccuracy: true,
      timeout: 25000,
      maximumAge: 0  // No usar caché para forzar nueva solicitud
    };

    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setCargando(false);
        console.log('✅ Ubicación obtenida exitosamente');
        
        const ubicacion = {
          latitud: posicion.coords.latitude,
          longitud: posicion.coords.longitude
        };
        
        setEstadoPermiso('otorgado');
        setUbicacionObtenida(ubicacion);
        setMostrarModal(false);
        
             // 🔥 AQUÍ EL CAMBIO CRÍTICO:
      // Guardar en localStorage
      localStorage.setItem('permisoUbicacion', 'otorgado');
      localStorage.setItem('ubicacionUsuario', JSON.stringify(ubicacion));
      
      // 🔥 IMPORTANTE: Disparar evento personalizado
      const event = new CustomEvent('storage-local', {
        detail: { ubicacion }
      });
      window.dispatchEvent(event);
      
      // También disparar el evento storage nativo (como fallback)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'ubicacionUsuario',
        newValue: JSON.stringify(ubicacion),
        oldValue: localStorage.getItem('ubicacionUsuario'),
        storageArea: localStorage
      }));
      
        
        // Imprimir en consola
        imprimirUbicacion(ubicacion);
        
        // Emitir evento para otros componentes
        window.dispatchEvent(new CustomEvent('ubicacionObtenida', { detail: ubicacion }));
      },
      (error) => {
        setCargando(false);
        console.error("❌ Error obteniendo ubicación:", error);
        
        let mensajeError = 'No se pudo obtener la ubicación';
        
        switch(error.code) {
          case 1: // PERMISSION_DENIED
            mensajeError = 'Has denegado el permiso de ubicación. El navegador debe haber mostrado una ventana de solicitud.';
            setEstadoPermiso('denegado');
            localStorage.setItem('permisoUbicacion', 'denegado');
            setErrorUbicacion(mensajeError);
            setMostrarInstrucciones(true);
            console.log('❌ Permiso DENEGADO por el usuario');
            break;
            
          case 2: // POSITION_UNAVAILABLE
            mensajeError = 'Información de ubicación no disponible. Verifica que el GPS esté activado.';
            setErrorUbicacion(mensajeError);
            setMostrarInstrucciones(true);
            break;
            
          case 3: // TIMEOUT
            mensajeError = 'Tiempo de espera agotado. Verifica tu conexión a internet y que el GPS esté activado.';
            setErrorUbicacion(mensajeError);
            break;
            
          default:
            mensajeError = 'Error al obtener la ubicación. Intenta nuevamente.';
            setErrorUbicacion(mensajeError);
        }
        
        console.log(`❌ Error de ubicación:`, mensajeError);
      },
      opciones
    );
  };

  const manejarDenegar = () => {
    setEstadoPermiso('denegado');
    setMostrarModal(false);
    localStorage.setItem('permisoUbicacion', 'denegado');
    console.log('❌ Permiso de ubicación: DENEGADO manualmente');
  };

  const manejarMasTarde = () => {
    setMostrarModal(false);
    console.log('⏰ Permiso de ubicación: POSPUESTO');
  };

  const reintentarUbicacion = () => {
    setErrorUbicacion(null);
    setMostrarInstrucciones(false);
    solicitarUbicacion();
  };

  const abrirConfiguracionNavegador = () => {
    // Instrucciones para el usuario
    alert(
      'Para activar la ubicación:\n\n' +
      '1. Haz clic en el ícono de candado 🔒 en la barra de direcciones\n' +
      '2. Busca "Ubicación" o "Location"\n' +
      '3. Cambia a "Permitir" o "Allow"\n' +
      '4. Actualiza la página y prueba de nuevo'
    );
  };

  return (
    <AnimatePresence>
      {mostrarModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-neutral-700 rounded-2xl p-6 max-w-md w-full border border-neutral-600 shadow-2xl"
          >
            {/* Encabezado */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-neutral-600 rounded-xl">
                <FaMapMarkerAlt className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Permiso de Ubicación</h3>
                <p className="text-neutral-300 text-sm">Tu navegador solicitará acceso a tu ubicación</p>
              </div>
            </div>

            {/* Contenido */}
            <div className="mb-6">
              {/* Mostrar instrucciones si es necesario */}
              {mostrarInstrucciones && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-medium mb-2">Permiso necesario</p>
                      <p className="text-yellow-400/80 text-sm mb-3">
                        Debes permitir el acceso a tu ubicación en la configuración de tu navegador.
                      </p>
                      <div className="space-y-2 text-xs text-yellow-300/80">
                        <p>🔹 Haz clic en el ícono de candado (🔒) en la barra de direcciones</p>
                        <p>🔹 Busca "Ubicación" o "Location"</p>
                        <p>🔹 Selecciona "Permitir" o "Allow"</p>
                        <p>🔹 Actualiza la página después de cambiar</p>
                      </div>
                      <button
                        onClick={abrirConfiguracionNavegador}
                        className="mt-3 text-sm bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Ver instrucciones detalladas
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Mostrar error si existe */}
              {errorUbicacion && !mostrarInstrucciones && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium mb-1">Error</p>
                      <p className="text-red-400/80 text-sm mb-3">{errorUbicacion}</p>
                      <button
                        onClick={reintentarUbicacion}
                        className="text-sm bg-red-700 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition-colors"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Estado de carga */}
              {cargando && (
                <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                    <p className="text-blue-300 font-medium">Esperando tu respuesta...</p>
                  </div>
                  <p className="text-blue-400/80 text-sm">
                    Tu navegador está mostrando una ventana para permitir o denegar la ubicación.
                    <br />
                    <span className="text-blue-300">✓ Busca la ventana emergente del navegador</span>
                  </p>
                  <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-800/50">
                    <p className="text-blue-300 text-xs font-medium mb-1">📱 En móviles:</p>
                    <p className="text-blue-400/70 text-xs">La solicitud puede aparecer en la parte superior o inferior de la pantalla</p>
                  </div>
                </div>
              )}

              {/* Mostrar beneficios si no hay error, instrucciones ni carga */}
              {!errorUbicacion && !mostrarInstrucciones && !cargando && (
                <>
                  <div className="mb-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FaLocationArrow className="w-4 h-4 text-blue-400" />
                      <p className="text-blue-300 font-medium">Tu navegador mostrará una ventana emergente</p>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      Después de hacer clic en "Permitir", tu navegador mostrará una ventana preguntando si quieres compartir tu ubicación.
                    </p>
                  </div>

                  <p className="text-neutral-300 mb-3">
                    Con tu ubicación podrás encontrar:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-neutral-600/50 rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <FaMusic className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Eventos cercanos</p>
                        <p className="text-neutral-400 text-sm">Encuentra conciertos y fiestas cerca de ti</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-neutral-600/50 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FaUsers className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Artistas locales</p>
                        <p className="text-neutral-400 text-sm">Descubre talento en tu zona</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-neutral-600/50 rounded-lg">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <FaCalendarAlt className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Calendario personalizado</p>
                        <p className="text-neutral-400 text-sm">Eventos relevantes para ti</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-neutral-600/50 rounded-lg">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <FaGlassCheers className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Lugares de entretenimiento</p>
                        <p className="text-neutral-400 text-sm">Bares, discotecas y más cerca</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Información de privacidad */}
              <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
                <p className="text-xs text-neutral-400 flex items-center gap-2">
                  <FaMapPin className="w-3 h-3" />
                  Tu ubicación solo se usa para mostrarte contenido relevante y no se comparte con terceros.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <button
                onClick={manejarDenegar}
                disabled={cargando}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  cargando 
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                    : 'bg-neutral-600 hover:bg-neutral-500 text-neutral-200'
                }`}
              >
                <FaTimes className="w-4 h-4" />
                Denegar
              </button>
              
              <button
                onClick={manejarMasTarde}
                disabled={cargando}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  cargando 
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed' 
                    : 'bg-neutral-600 hover:bg-neutral-500 text-white'
                }`}
              >
                Más tarde
              </button>
              
              <button
                onClick={solicitarUbicacion}
                disabled={cargando}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  cargando 
                    ? 'bg-blue-700 text-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {cargando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Esperando...
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4" />
                    Permitir
                  </>
                )}
              </button>
            </div>

            {/* Nota adicional */}
            <div className="mt-4 pt-3 border-t border-neutral-600/50">
              <p className="text-xs text-neutral-500 text-center">
                ⚠️ Si no ves una ventana emergente del navegador, puede que ya hayas denegado el permiso anteriormente.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}