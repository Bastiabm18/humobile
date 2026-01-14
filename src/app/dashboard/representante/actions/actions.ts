
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
  const allProfiles: Profile[] = data.map((p: any) => {
    // Datos base comunes
    const baseData = {
      countryId: p.Pais?.nombre_pais || '',
      regionId: p.Region?.nombre_region || '',
      cityId: p.Comuna?.nombre_comuna || '',
      perfil_visible: p.perfil_visible || true,
      email: p.email || '',
      updateAt: p.actualizado_en || p.creado_en
    };

    // Según el tipo de perfil, construir la data específica
    switch (p.tipo_perfil) {
      case 'artista':
        return {
          id: p.id_perfil,
          type: 'Artista' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...p.artista_data  // Merge con datos específicos del artista
          } as ArtistData
        };

      case 'banda':
        return {
          id: p.id_perfil,
          type: 'Banda' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            band_name: p.nombre,
            style: p.banda_data?.estilo_banda || '',
            music_type: p.banda_data?.tipo_musica || '',
            is_tribute: p.banda_data?.es_tributo || false,
            contact_phone: p.telefono_contacto || '',
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            integrante: p.banda_data?.integrantes || [],
            tipo_perfil: p.tipo_perfil,
            ...p.banda_data  // Mantener otros datos de banda_data
          } as BandData
        };

      case 'local':
        // Para los booleanos, necesitamos consultar la tabla de intereses
        // Por ahora los dejamos como false (después los implementarás)
        return {
          id: p.id_perfil,
          type: 'Local' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            place_name: p.nombre,
            address: p.direccion || '',
            phone: p.telefono_contacto || '',
            place_type: p.local_data?.tipo_establecimiento as any || 'other',
            lat: p.lat || 0,
            lng: p.lon || 0,
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            singer: false,  // Por defecto false (luego con intereses)
            band: false,
            actor: false,
            comedian: false,
            impersonator: false,
            tribute: false,
            tipo_perfil: p.tipo_perfil,
            ...p.local_data  // Mantener otros datos de local_data
          } as PlaceData
        };

      case 'productor':
      case 'representante':
        // Para los nuevos tipos, por ahora los mapeamos como artistas
        // o puedes crear nuevas interfaces después
        return {
          id: p.id_perfil,
          type: 'Representante' as ProfileType, // Temporal
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...(p.tipo_perfil === 'productor' ? p.productor_data : p.representante_data)
          } as ArtistData
        };

      default:
        // Tipo desconocido, usar datos mínimos
        return {
          id: p.id_perfil,
          type: 'Usuario' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil || 'artista'
          } as ArtistData
        };
    }
  });

  return allProfiles;
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

  // 5. Mapear cada perfil según su tipo (EXACTAMENTE igual que en getProfiles)
  const allProfiles: Profile[] = perfilesRepresentados.map((p: any) => {
    // Datos base comunes
    const baseData = {
      countryId: p.Pais?.nombre_pais || '',
      regionId: p.Region?.nombre_region || '',
      cityId: p.Comuna?.nombre_comuna || '',
      perfil_visible: p.perfil_visible || true,
      email: p.email || '',
      updateAt: p.actualizado_en || p.creado_en
    };

    // Según el tipo de perfil, construir la data específica
    switch (p.tipo_perfil) {
      case 'artista':
        return {
          id: p.id_perfil,
          type: 'Artista' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...p.artista_data  // Merge con datos específicos del artista
          } as ArtistData
        };

      case 'banda':
        return {
          id: p.id_perfil,
          type: 'Banda' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            band_name: p.nombre,
            style: p.banda_data?.estilo_banda || '',
            music_type: p.banda_data?.tipo_musica || '',
            is_tribute: p.banda_data?.es_tributo || false,
            contact_phone: p.telefono_contacto || '',
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            integrante: p.banda_data?.integrantes || [],
            tipo_perfil: p.tipo_perfil,
            ...p.banda_data  // Mantener otros datos de banda_data
          } as BandData
        };

      case 'local':
        // Para los booleanos, necesitamos consultar la tabla de intereses
        // Por ahora los dejamos como false (después los implementarás)
        return {
          id: p.id_perfil,
          type: 'Local' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            place_name: p.nombre,
            address: p.direccion || '',
            phone: p.telefono_contacto || '',
            place_type: p.local_data?.tipo_establecimiento as any || 'other',
            lat: p.lat || 0,
            lng: p.lon || 0,
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            singer: false,  // Por defecto false (luego con intereses)
            band: false,
            actor: false,
            comedian: false,
            impersonator: false,
            tribute: false,
            tipo_perfil: p.tipo_perfil,
            ...p.local_data  // Mantener otros datos de local_data
          } as PlaceData
        };

      case 'productor':
      case 'representante':
        // Para los nuevos tipos, por ahora los mapeamos como artistas
        // o puedes crear nuevas interfaces después
        return {
          id: p.id_perfil,
          type: 'Representante' as ProfileType, // Temporal
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...(p.tipo_perfil === 'productor' ? p.productor_data : p.representante_data)
          } as ArtistData
        };

      default:
        // Tipo desconocido, usar datos mínimos
        return {
          id: p.id_perfil,
          type: 'Usuario' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil || 'artista'
          } as ArtistData
        };
    }
  });

  return allProfiles;
};