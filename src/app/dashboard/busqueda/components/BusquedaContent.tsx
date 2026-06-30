// app/busqueda/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Buscador from './Buscador';
import NeonSign from '@/app/components/NeonSign';
import { EventoCalendario, FiltrosEventos, FiltrosPerfiles, Profile } from '@/types/profile';
import { obtenerComunasBusqueda, obtenerEventosBusqueda, obtenerEventosRSS, obtenerPerfilesBusqueda } from '../actions/actions'
import CarruselBase from '@/app/components/CarruselBase';
import CarruselEvento from '@/app/components/CarruselEvento';
import CarruselEventosBase from '@/app/components/CarruselEventosBase';
import GridEventosBase from './GridEventosBase';
import GridPerfil from './GridPerfil';

interface BusquedaContentProps {
  initialProfiles: Profile[];
  userId: string;
  userName?: string;   
}


// ═══════════════════════════════════════════════════════════════
// FÓRMULA DE HAVERSINE (Calcula distancia en km entre 2 puntos) 
// ═══════════════════════════════════════════════════════════════
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function BusquedaContent({ 
  initialProfiles, 
  userId, 
  userName 
}: BusquedaContentProps) {
  // STATE 1: Controla si estamos buscando eventos o perfiles
  const [tipo, setTipo] = useState<'eventos' | 'perfiles'>('eventos');
  // states para eventosn 
    const [todosEventos, setTodosEventos] = useState<EventoCalendario[]>([]);
    const [todosPerfiles, setTodosPerfiles] = useState<Profile[]>([]);
    const [perfilesFiltrados, setPerfilesFiltrados] = useState<Profile[]>([]);
    const [eventosFiltrados, setEventosFiltrados]= useState<EventoCalendario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

       const [comunas, setComunas] = useState([]); // Array para el buscador desplegable
    
useEffect(() => {
  const cargarEventos = async () => {
    try {
      setLoading(true);
      
      //  CARGAR AMBAS FUENTES EN PARALELO
      const [eventosDB, eventosRSS] = await Promise.all([
        obtenerEventosBusqueda(),
        obtenerEventosRSS()
      ]);
      
      console.log(` Eventos DB: ${eventosDB.length} | Eventos RSS: ${eventosRSS.length}`);
      
      //  MEZCLAR Y ORDENAR POR FECHA
      const todosLosEventos = [...eventosDB, ...eventosRSS]
        .sort((a, b) => {
          const fechaA = new Date(a.inicio).getTime();
          const fechaB = new Date(b.inicio).getTime();
          return fechaA - fechaB; // Más cercanos primero
        });
      
      setTodosEventos(todosLosEventos);
      setEventosFiltrados(todosLosEventos);
      setError(null);
      
    } catch (err: any) {
      console.error('Error cargando eventos:', err);
      setError(err.message || 'Error al cargar eventos');
      setTodosEventos([]);
    } finally {
      setLoading(false);
    }
  };

  cargarEventos();
}, []);
    useEffect(() => {
            const cargarPerfiles = async () => {
              try {
                setLoading(true);
                const perfiles = await obtenerPerfilesBusqueda();
                setTodosPerfiles(perfiles);
                setPerfilesFiltrados(perfiles);
                setError(null);
              } catch (err: any) {
                console.error('Error cargando eventos:', err);
                setError(err.message || 'Error al cargar eventos');
                setTodosPerfiles([]);
              } finally {
                setLoading(false);
              }
            };

          cargarPerfiles();
        }, []);
   useEffect(() => {
    const cargarComunas = async () => {
      try {
        const data = await obtenerComunasBusqueda();
        setComunas(data);
      } catch (err: any) {
        console.error('Error cargando comunas:', err);
      }
    };
    cargarComunas();
  }, []);

      
 // console.log(todosPerfiles)
  // FUNCIÓN PRINCIPAL: Recibe la búsqueda del componente Buscador
  const handleBuscar = async (query: string, filtros: FiltrosEventos | FiltrosPerfiles) => {
    console.log('=== INFORMACIÓN RECIBIDA DEL BUSCADOR ===');
    console.log('1. Query (texto buscado):', query);
    console.log('2. Tipo de búsqueda:', tipo);
    console.log('3. Filtros aplicados:', filtros);
    
     // ═══════════════════════════════════════════════════════════════
      if (tipo === 'eventos') {
         const filtrosEventos = filtros as FiltrosEventos;
         
         // Variable para decidir qué data filtrar (la local o la nueva de la RPC)
         let dataParaFiltrar = todosEventos;
   
         // SI HAY LAT Y LON: Llamamos a la RPC con parámetros
         if (filtrosEventos.lat && filtrosEventos.lon) {
           try {
             setLoading(true);
             // Llamamos acción con los parámetros de ubicación
             const eventosCercanos = await obtenerEventosBusqueda(filtrosEventos.lat, filtrosEventos.lon,filtrosEventos.radio);
            
              // 2️ FILTRAR EVENTOS RSS CERCANOS (desde memoria usando Haversine)
             const eventosRssCercanos = todosEventos
               .filter(e => 
                 e.id.startsWith('rss_') && 
                 e.lat_lugar && 
                 e.lon_lugar
               )
               .filter(e => {
                 const distancia = calcularDistanciaKm(
                   filtrosEventos.lat!,
                   filtrosEventos.lon!,
                   parseFloat(e.lat_lugar!),
                   parseFloat(e.lon_lugar!)
                 );
                 
                 // Guardamos la distancia por si la quieres mostrar después
                 e.distancia = Math.round(distancia * 10) / 10; 
                 
                 return distancia <= (filtrosEventos.radio || 50);
               });
            
                     dataParaFiltrar = [...eventosCercanos, ...eventosRssCercanos];
          
           //  dataParaFiltrar = eventosCercanos;
           } catch (err) {
             console.error('Error filtrando por ubicación:', err);
           } finally {
             setLoading(false);
           }
         }
   
         if (!query.trim() && 
             !filtrosEventos.fechaDesde && 
             !filtrosEventos.fechaHasta && 
             !filtrosEventos.tipoEvento && 
             !filtrosEventos.artista &&
             !filtrosEventos.lat) { 
           
           setEventosFiltrados(todosEventos);
           return;
         }
   
         const eventosFiltrados = dataParaFiltrar.filter(evento => {
           let cumple = true;
   
           // A. Filtrar por texto (query)
           if (query) {
             cumple = cumple && (
               evento.titulo.toLowerCase().includes(query.toLowerCase()) ||
               evento.descripcion.toLowerCase().includes(query.toLowerCase())
             );
           }
           
           // B. Filtrar por fecha desde
           if (filtrosEventos.fechaDesde) {
             cumple = cumple && new Date(evento.inicio) >= new Date(filtrosEventos.fechaDesde);
           }
           
           // C. Filtrar por fecha hasta
           if (filtrosEventos.fechaHasta) {
             cumple = cumple && new Date(evento.fin) <= new Date(filtrosEventos.fechaHasta);
           }
           
           // D. Filtrar por tipo de evento
           if (filtrosEventos.tipoEvento) {
             cumple = cumple && evento.nombre_categoria === filtrosEventos.tipoEvento;
           }
           
           // E. Filtrar por artista
           if (filtrosEventos.artista) {
             cumple = cumple && evento.nombre_creador?.toLowerCase().includes(filtrosEventos.artista.toLowerCase());
           }
           
           return cumple;
         });
   
         setEventosFiltrados(eventosFiltrados);
         console.log('filtrados: ', eventosFiltrados);
      
    } else {
   const filtrosPerfiles = filtros as FiltrosPerfiles;
  
  const perfilesFiltrados = todosPerfiles.filter(perfil => {
    let cumple = true;
    
    // A. Filtrar por texto
    if (query) {
      cumple = cumple && perfil.nombre.toLowerCase().includes(query.toLowerCase());
    }
    
    // B. Filtrar por tipos (Solo filtra si alguno está en true)
    // Si todos están en false o todos en true, no filtramos por tipo
    const hayTipoFiltro = filtrosPerfiles.artista || filtrosPerfiles.banda || filtrosPerfiles.lugar;
    if (hayTipoFiltro) {
      if (perfil.tipo === 'artista' && !filtrosPerfiles.artista) cumple = false;
      if (perfil.tipo === 'banda' && !filtrosPerfiles.banda) cumple = false;
      if (perfil.tipo === 'lugar' && !filtrosPerfiles.lugar) cumple = false;
    }

    // C. NUEVO: Filtrar por categoríasIds (basado en el array que devuelve el buscador)
    if (filtrosPerfiles.categoriasIds && filtrosPerfiles.categoriasIds.length > 0) {
      // Verificamos si el perfil tiene la categoría seleccionada
    
      cumple = cumple && filtrosPerfiles.categoriasIds.includes(perfil.id_categoria as unknown as number || 0);
    }
    
    return cumple;
  });
  
  setPerfilesFiltrados(perfilesFiltrados);
    }
  };

  return (
    <div className="min-h-screen flex  items-center justify-center p-4 mt-25">
      <div className="w-[80vw] mx-auto">
        {/* ========== HEADER DE LA PÁGINA ========== */}
        <div className="mb-10  text-center">
        <NeonSign/>
          <p className="text-lg text-neutral-400">
            Encuentra exactamente lo que necesitas
          </p>
        </div>
        
        {/* ========== COMPONENTE BUSCADOR ========== */}
        {/* Este componente SOLO recolecta información, NO filtra */}
        <Buscador 
          onBuscar={handleBuscar}      // Función que recibe los datos
          tipo={tipo}                   // Tipo actual (eventos/perfiles)
          onTipoChange={setTipo}        // Función para cambiar el tipo
             comunas={comunas}
        />
        
        {/* ========== ÁREA DE RESULTADOS ========== */}
        <div className="flex w-[80vw] items-center justify-center mt-8">
           {tipo === 'eventos' && (
                
                  <>

                       <GridEventosBase
                         eventos={eventosFiltrados}
                       />
                 </>

             )}


           {tipo === 'perfiles' && (
                 <>
                 <GridPerfil
                 items={perfilesFiltrados}
                 />
                 </>
             )}
          {/* Mensaje de ejemplo */}
        </div>



          <div className="text-center py-12 text-neutral-500">
            <p>Los resultados aparecerán aquí después de buscar</p>
            <p className="text-sm mt-2">
              Tipo seleccionado: <span className="text-white">{tipo}</span>
            </p>
          </div>
      </div>
    </div>
  );
}