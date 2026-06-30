"use server"

import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { categoria_perfil, EventoCalendario, IntegranteBandaEvento, Profile } from "@/types/profile";
import Parser from 'rss-parser';

const parserRSS = new Parser({
  customFields: {
    item: [
      ['event_id', 'event_id'],
      ['ticketLink', 'ticketLink'],
      ['minPrice', 'minPrice'],
      ['currency', 'currency'],
      ['city', 'city'],
      ['region', 'region'],
      ['venue', 'venue'],
      ['address', 'address'],
      ['dateTime', 'dateTime'],
      ['artist', 'artist'],
      ['imgUrl', 'imgUrl']
    ],
  }
});

// app/actions/actions.ts
export async function obtenerEventosBusqueda(lat?: number | null, lon?: number | null,radio: number = 50): Promise<EventoCalendario[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Llamar a la función PostgreSQL que creamos
    const { data: eventosDB, error } = await supabaseAdmin
     .rpc('obtener_eventos_buscador_geo', {
        user_lat: lat || null,
        user_lon: lon || null,
        radio_metros: radio * 1000
      });

    if (error) {
      console.error(' Error al llamar a obtener_eventos_buscador:', error);
      console.error('Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }

    if (!eventosDB || eventosDB.length === 0) {
      return [];
    }

    return eventosDB

  } catch (error: any) {
    console.error('Error en obtenerEventosBusqueda:', error);
    throw error;
  }
}

export const obtenerPerfilesBusqueda = async (): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais(nombre_pais),
      Region(nombre_region),
      Comuna(nombre_comuna),
      categoria_perfil (
        id_categoria,
        categoria,
        tipo,
        estado
      )
    `)
    .eq('perfil_visible', true)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error("Error fetching public profiles:", error);
    throw new Error(`Fallo al obtener perfiles: ${error.message}`);
  }

  return (data || []).map(p => ({
    id: p.id_perfil,
    tipo: p.tipo_perfil,
    nombre: p.nombre,
    email: p.email,
    imagen_url: p.imagen_url,
    video_url: p.video_url,
    created_at: p.creado_en,
    region_id: p.Region?.nombre_region,
    pais_id: p.Pais?.nombre_pais,
    ciudad_id: p.Comuna?.nombre_comuna,
    // convertir null a undefined para satisfacer Profile.id_categoria
    id_categoria: p.categoria_perfil
      ? String(p.categoria_perfil.id_categoria)
      : undefined,
    nombre_categoria_perfil: p.categoria_perfil?.categoria || 'Sin categoría',
    lat: p.lat,
    lon: p.lon
  }));
};
export async function obtenerComunasBusqueda() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    
    const { data: comunasDB, error } = await supabaseAdmin
      .rpc('obtener_comunas_buscador');

    if (error) {
      console.error('Error al llamar a obtener_comunas_buscador:', error);
      throw new Error(`Error al obtener comunas: ${error.message}`);
    }

    if (!comunasDB || comunasDB.length === 0) {
      return [];
    }

    
    return comunasDB;

  } catch (error: any) {
    console.error('Error en obtenerComunasBusqueda:', error);
    throw error;
  }
}

export const obtenerCategoriasPerfiles = async (): Promise<categoria_perfil[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin
    .from('categoria_perfil')
    .select(`
      id_categoria,
      categoria, 
      tipo,
      estado,
      createdAt,
      updatedAt
    `)
    .eq('estado', true);

  if (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }

  // Mapeamos para que coincida con tu interfaz 'categoria_perfil'
  return (data || []).map(cat => ({
    id_categoria: String(cat.id_categoria), 
    nombre_categoria: cat.categoria,        
    tipo_perfil: cat.tipo,                 
    estado: String(cat.estado),             
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt
  }));
};

export const getProfiles = async (userId: string): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // 1. Consulta única a la tabla perfil
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais(nombre_pais),
      Region(nombre_region),
      Comuna(nombre_comuna)
    `)
    .eq('usuario_id', userId)
    .order('creado_en', { ascending: false });

  // 2. Manejo de errores
  if (error) {
    console.error("Error fetching profiles:", error);
    throw new Error(`Fallo al obtener perfiles: ${error.message}`);
  }

  if (!data) return [];

  // 3. Mapear cada perfil según su tipo
  const allProfiles: Profile[] = data.map((p: any) => {
    // Datos base comunes
    return {
      id: p.id_perfil, 
      tipo: p.tipo_perfil,
      nombre: p.nombre,
      email: p.email,
      imagen_url: p.imagen_url,
      video_url: p.video_url,
      created_at: p.creado_en,
      region_id: p.Region?.nombre_region,
      pais_id: p.Pais?.nombre_pais,
      ciudad_id: p.Comuna?.nombre_comuna,
      perfil_visible: p.perfil_visible,
    };
  });

  return allProfiles;
};

// ═══════════════════════════════════════════════════════════════
// OBTENER TODAS LAS COMUNAS COMO MAPA (para geolocalizar RSS asociamos la comuna con el tag <city> de la rss)
// ═══════════════════════════════════════════════════════════════
export async function obtenerMapaComunas(): Promise<Map<string, {lat: string, lon: string}>> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from('Comuna')
      .select('nombre_comuna, lat, lon');
    
    if (error || !data) {
      console.error('Error obteniendo mapa de comunas:', error);
      return new Map();
    }
    
    // Crear mapa con key en minúsculas para búsqueda case-insensitive
    const mapa = new Map<string, {lat: string, lon: string}>();
    data.forEach(c => {
      mapa.set(c.nombre_comuna.toLowerCase().trim(), { 
        lat: c.lat, 
        lon: c.lon 
      });
    });
    
    console.log(`Mapa de comunas cargado: ${mapa.size} comunas`);
    return mapa;
    
  } catch (error) {
    console.error('Error en obtenerMapaComunas:', error);
    return new Map();
  }
}

function transformarEventoRSS(item: any, mapaComunas: Map<string, {lat: string, lon: string}>): EventoCalendario {
  // Limpiar HTML de la descripción
  const descripcionLimpia = item.description?.replace(/<[^>]*>?/gm, '') || '';
  
  // Parsear la fecha
  const fechaInicio = item.dateTime 
    ? new Date(item.dateTime.replace(' ', 'T')) 
    : new Date();
  
  // 🗺️ BUSCAR LAT/LON POR NOMBRE DE COMUNA
  const nombreCity = item.city?.toLowerCase().trim() || '';
  const coordsComuna = mapaComunas.get(nombreCity);
  
  if (coordsComuna) {
   // console.log(` Comuna encontrada: ${item.city} → lat: ${coordsComuna.lat}, lon: ${coordsComuna.lon}`);
  } else {
   // console.log(` Comuna NO encontrada: ${item.city}`);
  }

  return {
    id: `rss_${item.event_id}`,
    titulo: item.title || 'Sin título',
    descripcion: descripcionLimpia,
    inicio: fechaInicio,
    fin: fechaInicio,
    id_categoria: '',
    nombre_categoria: 'Externo',
    flyer_url: item.imgUrl || null,
    video_url: '',
    id_creador: '',
    nombre_creador: item.artist || 'Artista externo',
    tipo_perfil_creador: 'externo',
    id_lugar: '',
    nombre_lugar: item.venue || 'Lugar por confirmar',
    direccion_lugar: item.address || '',
    
    
    lat_lugar: coordsComuna?.lat || '',
    lon_lugar: coordsComuna?.lon || '',
    
    id_productor: '',
    nombre_productor: item.region || null,
    
    // 
    tickets_evento: item.ticketLink || '',
    
    es_publico: true,
    es_bloqueo: false,
    motivo_bloqueo: '',
    created_at: fechaInicio,
    updated_at: fechaInicio,
    participantes: [],
    total_participantes: 1,
    pendientes: 0,
    confirmados: 1,
    rechazados: 0,
    porcentaje_aprobacion: 100,
    estado_participacion: '',
    es_evento_integrante: false,
    es_evento_banda: false,
    distancia: 0,
  };
}

export async function obtenerEventosRSS(): Promise<EventoCalendario[]> {
  try {
    //  PASO 1: Obtener mapa de comunas para geolocalizar
    const mapaComunas = await obtenerMapaComunas();
    
    //  PASO 2: Parsear RSS
    const RSS_URL = 'https://www.portaldisc.com/humobile';
    const feed = await parserRSS.parseURL(RSS_URL);
    
    if (!feed.items || feed.items.length === 0) {
      console.log('RSS sin items');
      return [];
    }

    //  PASO 3: Transformar con geolocalización
    const eventosTransformados = feed.items.map(item => 
      transformarEventoRSS(item, mapaComunas)
    );
    
    //  ESTADÍSTICAS
    const conCoords = eventosTransformados.filter(e => e.lat_lugar && e.lon_lugar).length;
    console.log(` ${eventosTransformados.length} eventos RSS | ${conCoords} con coordenadas`);
    
    return eventosTransformados;
    
  } catch (error: any) {
    console.error(' Error obteniendo eventos RSS:', error);
    return [];
  }
}
