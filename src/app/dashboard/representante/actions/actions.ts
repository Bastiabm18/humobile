
'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, BlockDateRangeParams, evento, CalendarEvent, eventoCompleto } from '@/types/profile'; 
import { revalidatePath } from 'next/cache';



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
export const getPerfilRepresentante = async (userId: string): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // 1. Primero obtener el ID del perfil del representante
  const { data: perfilRepresentante, error: errorPerfil } = await supabaseAdmin
    .from('perfil')
    .select('id_perfil')
    .eq('usuario_id', userId)
    .eq('tipo_perfil', 'representante')
    .limit(1)
    .single();

  if (errorPerfil || !perfilRepresentante) {
    console.error("Error o no se encontró perfil representante:", errorPerfil);
    return [];
  }

  // 2. Obtener los representados del representante
  const { data: representados, error: errorRepresentados } = await supabaseAdmin
    .from('representado')
    .select('id_representado')
    .eq('id_representante', perfilRepresentante.id_perfil)
    .eq('estado_representacion', 'activo');

  if (errorRepresentados) {
    console.error("Error fetching representados:", errorRepresentados);
    throw new Error(`Fallo al obtener representados: ${errorRepresentados.message}`);
  }

  if (!representados || representados.length === 0) {
    return [];
  }

  // 3. Extraer los IDs de los representados
  const idsRepresentados = representados.map(r => r.id_representado);

  // 4. Obtener los perfiles completos de los representados
  const { data: perfilesRepresentados, error: errorPerfiles } = await supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais(nombre_pais),
      Region(nombre_region),
      Comuna(nombre_comuna)
    `)
    .in('id_perfil', idsRepresentados)
    .order('creado_en', { ascending: false });

  if (errorPerfiles) {
    console.error("Error fetching profiles:", errorPerfiles);
    throw new Error(`Fallo al obtener perfiles: ${errorPerfiles.message}`);
  }

  if (!perfilesRepresentados) return [];

    // 3. Mapear cada perfil según su tipo
   const perfilesVisibles: Profile[] = (perfilesRepresentados || []).map(p => ({
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