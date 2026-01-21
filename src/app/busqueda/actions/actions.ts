"use server"

import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { EventoCalendario, IntegranteBandaEvento, Profile } from "@/types/profile";

// app/actions/actions.ts
export async function obtenerEventosBusqueda(): Promise<EventoCalendario[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Llamar a la función PostgreSQL que creamos
    const { data: eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_buscador');

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
  
  // 1. Consulta única a la tabla perfil
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais(nombre_pais),
      Region(nombre_region),
      Comuna(nombre_comuna)
    `)
    .in('tipo_perfil', ['artista', 'banda', 'lugar'])
    .order('creado_en', { ascending: false });

  // 2. Manejo de errores
  if (error) {
    console.error("Error fetching public profiles:", error);
    throw new Error(`Fallo al obtener perfiles públicos: ${error.message}`);
  }

  if (!data) return [];

  // 3. Mapear cada perfil según su tipo
   const perfilesVisibles: Profile[] = (data || []).map(p => ({
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
   
  }));
  return perfilesVisibles;
};