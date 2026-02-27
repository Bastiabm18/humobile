"use server"

import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { categoria_perfil, EventoCalendario, IntegranteBandaEvento, Profile } from "@/types/profile";

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
