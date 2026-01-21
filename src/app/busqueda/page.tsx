// app/busqueda/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Buscador from './components/Buscador';
import NeonSign from '../components/NeonSign';
import { EventoCalendario } from '@/types/profile';
import { obtenerEventosBusqueda } from './actions/actions';
import CarruselBase from '../components/CarruselBase';
import CarruselEvento from '../components/CarruselEvento';
import CarruselEventosBase from '../components/CarruselEventosBase';

// INTERFACES (deberían estar en tu archivo de tipos)
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

export default function BusquedaPage() {
  // STATE 1: Controla si estamos buscando eventos o perfiles
  const [tipo, setTipo] = useState<'eventos' | 'perfiles'>('eventos');
  // states para eventosn 
    const [todosEventos, setTodosEventos] = useState<EventoCalendario[]>([]);
    const [eventosFiltrados, setEventosFiltrados]= useState<EventoCalendario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
            const cargarEventos = async () => {
              try {
                setLoading(true);
                const eventos = await obtenerEventosBusqueda();
                setTodosEventos(eventos);
                setEventosFiltrados(eventos);
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

      
  
  // FUNCIÓN PRINCIPAL: Recibe la búsqueda del componente Buscador
  const handleBuscar = (query: string, filtros: FiltrosEventos | FiltrosPerfiles) => {
    console.log('=== INFORMACIÓN RECIBIDA DEL BUSCADOR ===');
    console.log('1. Query (texto buscado):', query);
    console.log('2. Tipo de búsqueda:', tipo);
    console.log('3. Filtros aplicados:', filtros);
    
    // ═══════════════════════════════════════════════════════════════
    // AQUÍ ES DONDE TÚ APLICARÍAS LOS FILTROS A TU DATA YA CARGADA
    // ═══════════════════════════════════════════════════════════════
    
    // EJEMPLO DE LÓGICA DE FILTRADO:
    if (tipo === 'eventos') {
      // 1. Convertir filtros a variables tipadas
      const filtrosEventos = filtros as FiltrosEventos;
      if (!query.trim() && 
        !filtrosEventos.fechaDesde && 
        !filtrosEventos.fechaHasta && 
        !filtrosEventos.tipoEvento && 
        !filtrosEventos.artista) {
      
      // Recargar todos los eventos desde el backend o restaurar estado inicial
            setEventosFiltrados(todosEventos)
      return;
    }
      // 2. Filtrar tu array de eventosData
       const eventosFiltrados = todosEventos.filter(evento => {
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
      // 
      // 3. Actualizar state con resultados filtrados
       setEventosFiltrados(eventosFiltrados);
       console.log('filtrados: ',eventosFiltrados)
      
    } else {
      // 1. Convertir filtros a variables tipadas
      const filtrosPerfiles = filtros as FiltrosPerfiles;
      
      // 2. Filtrar tu array de perfilesData
      // const perfilesFiltrados = perfilesData.filter(perfil => {
      //   let cumple = true;
      //   
      //   // A. Filtrar por texto (query)
      //   if (query) {
      //     cumple = cumple && perfil.nombre.toLowerCase().includes(query.toLowerCase());
      //   }
      //   
      //   // B. Filtrar por tipos de perfil seleccionados
      //   if (perfil.tipo_perfil === 'artista' && !filtrosPerfiles.artista) cumple = false;
      //   if (perfil.tipo_perfil === 'banda' && !filtrosPerfiles.banda) cumple = false;
      //   if (perfil.tipo_perfil === 'local' && !filtrosPerfiles.local) cumple = false;
      //   if (perfil.tipo_perfil === 'lugar' && !filtrosPerfiles.lugar) cumple = false;
      //   if (perfil.tipo_perfil === 'productor' && !filtrosPerfiles.productor) cumple = false;
      //   if (perfil.tipo_perfil === 'representante' && !filtrosPerfiles.representante) cumple = false;
      //   
      //   return cumple;
      // });
      // 
      // 3. Actualizar state con resultados filtrados
      // setPerfilesFiltrados(perfilesFiltrados);
    }
  };

  return (
    <div className="min-h-screen p-4 mt-25">
      <div className="max-w-7xl mx-auto">
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
        />
        
        {/* ========== ÁREA DE RESULTADOS ========== */}
        <div className="mt-8">
           {tipo === 'eventos' && (
                
                  <>

                       <CarruselEventosBase
                         eventos={eventosFiltrados}
                       />
                 </>

             )}


           {tipo === 'perfiles' && (
                 <>
                 </>
             )}
          {/* Mensaje de ejemplo */}
          <div className="text-center py-12 text-neutral-500">
            <p>Los resultados aparecerán aquí después de buscar</p>
            <p className="text-sm mt-2">
              Tipo seleccionado: <span className="text-white">{tipo}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}