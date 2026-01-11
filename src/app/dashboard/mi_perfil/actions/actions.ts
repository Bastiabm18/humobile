'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, Perfil } from '@/types/profile'; 
import { InvitacionData } from '@/types/profile';

// ===========================================
// 1. CARGA DE DATOS GEOGRÁFICOS (PAÍS, REGIÓN, COMUNA)
// ===========================================
/**
 * Carga TODA la data geográfica de Supabase (Paises, Regiones, Comunas) 
 * para usarla en los selectores en cascada.
 */
export async function getGeoData(): Promise<GeoData> {
    const supabaseAdmin = getSupabaseAdmin(); 
    
    // Consulta los tres conjuntos de datos de forma concurrente para mayor velocidad
    const [paisesRes, regionesRes, comunasRes] = await Promise.all([
        supabaseAdmin.from('Pais').select('id_pais, nombre_pais'),
        // Asumiendo que Regiones tiene un campo 'id_pais' para el padre
        supabaseAdmin.from('Region').select('id_region, nombre_region, id_pais'), 
        // Asumiendo que Comunas tiene un campo 'id_region' para el padre
        supabaseAdmin.from('Comuna').select('id_comuna, nombre_comuna, id_region'), 
    ]);

    if (paisesRes.error || regionesRes.error || comunasRes.error) {
        console.error("Error cargando GEO DATA:", paisesRes.error || regionesRes.error || comunasRes.error);
        throw new Error("No se pudo cargar la data geográfica de la base de datos.");
    }

    // Mapeamos los resultados para ajustarlos al tipo GeoItem esperado
    return {
        paises: paisesRes.data.map(p => ({ id: p.id_pais, name: p.nombre_pais })),
        // Usamos 'id_pais' y 'id_region' para enlazar los padres
        regiones: regionesRes.data.map(r => ({ id: r.id_region, name: r.nombre_region, parentId: r.id_pais })),
        comunas: comunasRes.data.map(c => ({ id: c.id_comuna, name: c.nombre_comuna, parentId: c.id_region })),
    };
}


// ===========================================
// 2. FUNCIONES GENERALES DE LECTURA/ELIMINACIÓN
// ===========================================


// ===========================================
// 3. FUNCIONES DE CREACIÓN ESPECÍFICAS
// ===========================================

export async function createArtistProfile(userId: string, data: ArtistData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        usuario_id: userId,
        tipo_perfil: 'artista',
        nombre: data.name,
        email: data.email, 
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.image_url,
        perfil_visible: data.perfil_visible,
        artista_data: {}  // JSONB vacío para datos específicos
    };
    
    const { error } = await supabaseAdmin.from('perfil').insert([mappedData]);
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Artista creado para ${userId}`);
}

/**
 * Crea un perfil de Banda.
 */
export async function createBandProfile(userId: string, data: BandData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        usuario_id: userId,
        tipo_perfil: 'banda',
        nombre: data.band_name,
        email: data.email,
        telefono_contacto: data.contact_phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.photo_url,
        video_url: data.video_url,
        banda_data: {
            estilo_banda: data.style,
            tipo_musica: data.music_type,
            es_tributo: data.is_tribute,
            integrantes: data.integrante || []
        }
    };
    
    const { error } = await supabaseAdmin.from('perfil').insert([mappedData]);
    if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Banda creado para ${userId}`);
}

/**
 * Crea un perfil de Local.
 */
export async function createPlaceProfile(userId: string, data: PlaceData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        usuario_id: userId,
        tipo_perfil: 'local',
        nombre: data.place_name,
        email: data.email,
        direccion: data.address,
        lat: data.lat,
        lon: data.lng,
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.photo_url,
        video_url: data.video_url,
        local_data: {
            tipo_establecimiento: data.place_type,
            telefono_local: data.phone
        }
    };

    const { error } = await supabaseAdmin.from('perfil').insert([mappedData]);
    if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Local creado para ${userId}`);

    // OPCIONAL: Insertar intereses si los tienes en data
    // await insertPlaceIntereses(profileId, data);
}

/**
 * Crea un perfil de Productor.
 */
export async function createProducerProfile(userId: string, data: any) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        usuario_id: userId,
        tipo_perfil: 'productor',
        nombre: data.name,
        email: data.email,
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.image_url,
        productor_data: data.productorData || {}
    };
    
    const { error } = await supabaseAdmin.from('perfil').insert([mappedData]);
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Productor creado para ${userId}`);
}

/**
 * Crea un perfil de Representante.
 */
export async function createRepresentativeProfile(userId: string, data: any) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        usuario_id: userId,
        tipo_perfil: 'representante',
        nombre: data.name,
        email: data.email,
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.image_url,
        representante_data: data.representativeData || {}
    };
    
    const { error } = await supabaseAdmin.from('perfil').insert([mappedData]);
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Representante creado para ${userId}`);
}

// ===========================================
// FUNCIÓN PRINCIPAL DE CREACIÓN (Router)
// ===========================================

/**
 * Función router para dirigir la creación de perfiles al tipo correcto.
 */
export const createProfile = async (userId: string, type: ProfileType, data: any) => {
    switch (type) {
        case 'artist':
            await createArtistProfile(userId, data as ArtistData);
            break; 
        case 'band':
            await createBandProfile(userId, data as BandData);
            break; 
        case 'place':
            await createPlaceProfile(userId, data as PlaceData);
            break;
        case 'producer':
            await createProducerProfile(userId, data);
            break;
        case 'representative':
            await createRepresentativeProfile(userId, data);
            break; 
        default:
            throw new Error(`Tipo de perfil no soportado: ${type}`);
    }
};

export const deleteProfile = async (profileId: string, type: ProfileType) => {
    const supabaseAdmin = getSupabaseAdmin(); 
    
    // Mapear ProfileType a tipo_perfil
    const tipoPerfilMap: Record<ProfileType, string> = {
        'artist': 'artista',
        'band': 'banda',
        'place': 'local',
        'producer': 'productor',
        'representative': 'representante'
    };
    
    const tipoPerfil = tipoPerfilMap[type];
    
    if (!tipoPerfil) {
        throw new Error(`Tipo de perfil no soportado: ${type}`);
    }
    
    const { error } = await supabaseAdmin
        .from('perfil')
        .delete()
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', tipoPerfil);
    
    if (error) {
        console.error(`DELETE ${type.toUpperCase()} PROFILE ERROR:`, error);
        throw new Error(`Fallo al eliminar el perfil de ${type}: ${error.message}`);
    }
    
    console.log(`[DB OPERATION] Perfil ${type} eliminado: ${profileId}`);
};

export const updateProfile = async (profileId: string, type: ProfileType, data: any) => {
    switch (type) {
        case 'artist':
            await updateArtistProfile(profileId, data as ArtistData);
            break; 
        case 'band':
            await updateBandProfile(profileId, data as BandData);
            break; 
        case 'place':
            await updatePlaceProfile(profileId, data as PlaceData);
            break;
        case 'producer':
            await updateProducerProfile(profileId, data);
            break;
        case 'representative':
            await updateRepresentativeProfile(profileId, data);
            break; 
        default:
            throw new Error(`Tipo de perfil no soportado: ${type}`);
    }
};

// ===========================================
// FUNCIONES DE ACTUALIZACIÓN ESPECÍFICAS
// ===========================================

/**
 * Actualiza un perfil de Artista.
 */
export async function updateArtistProfile(profileId: string, data: ArtistData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el perfil existe
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('perfil')
        .select('id_perfil')
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'artista')
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil de artista no encontrado');
    }

    const mappedData = {
        nombre: data.name,
        email: data.email, 
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.image_url,
        perfil_visible: data.perfil_visible,
        actualizado_en: new Date().toISOString(),
        artista_data: {}  // Aquí puedes agregar datos específicos si los tienes
    };
    
    const { error } = await supabaseAdmin
        .from('perfil')
        .update(mappedData)
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'artista');
    
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Artista actualizado: ${profileId}`);
}

/**
 * Actualiza un perfil de Banda.
 */
export async function updateBandProfile(profileId: string, data: BandData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el perfil existe
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('perfil')
        .select('id_perfil')
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'banda')
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil de banda no encontrado');
    }

    const mappedData = {
        nombre: data.band_name,
        email: data.email,
        telefono_contacto: data.contact_phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.photo_url,
        video_url: data.video_url,
        actualizado_en: data.updateAt,
        banda_data: {
            estilo_banda: data.style,
            tipo_musica: data.music_type,
            es_tributo: data.is_tribute,
            integrantes: data.integrante || []
        }
    };
    
    const { error } = await supabaseAdmin
        .from('perfil')
        .update(mappedData)
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'banda');
    
    if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Banda actualizado: ${profileId}`);
}

/**
 * Actualiza un perfil de Local.
 */
export async function updatePlaceProfile(profileId: string, data: PlaceData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el perfil existe
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('perfil')
        .select('id_perfil')
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'local')
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil de local no encontrado');
    }

    const mappedData = {
        nombre: data.place_name,
        email: data.email,
        direccion: data.address,
        lat: data.lat,
        lon: data.lng,
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.photo_url,
        video_url: data.video_url,
        perfil_visible: data.perfil_visible,
        actualizado_en: data.updateAt,
        local_data: {
            tipo_establecimiento: data.place_type,
            telefono_local: data.phone
        }
    };

    const { error } = await supabaseAdmin
        .from('perfil')
        .update(mappedData)
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'local');
    
    if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Local actualizado: ${profileId}`);

    // OPCIONAL: Actualizar intereses si los implementas
    // await updatePlaceIntereses(profileId, data);
}

/**
 * Actualiza un perfil de Productor.
 */
export async function updateProducerProfile(profileId: string, data: any) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('perfil')
        .select('id_perfil')
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'productor')
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil de productor no encontrado');
    }

    const mappedData = {
        nombre: data.name,
        email: data.email,
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.image_url,
        actualizado_en: new Date().toISOString(),
        productor_data: data.productorData || {}
    };
    
    const { error } = await supabaseAdmin
        .from('perfil')
        .update(mappedData)
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'productor');
    
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Productor actualizado: ${profileId}`);
}

/**
 * Actualiza un perfil de Representante.
 */
export async function updateRepresentativeProfile(profileId: string, data: any) {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('perfil')
        .select('id_perfil')
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'representante')
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil de representante no encontrado');
    }

    const mappedData = {
        nombre: data.name,
        email: data.email,
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        imagen_url: data.image_url,
        actualizado_en: new Date().toISOString(),
        representante_data: data.representativeData || {}
    };
    
    const { error } = await supabaseAdmin
        .from('perfil')
        .update(mappedData)
        .eq('id_perfil', profileId)
        .eq('tipo_perfil', 'representante');
    
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Representante actualizado: ${profileId}`);
}

// ===========================================
// 2. FUNCIÓN DE LECTURA (COMBINADA)
// ===========================================

/**
 * Obtiene todos los perfiles (Artist, Band, Place) asociados al usuario logueado, 
 * combinando las consultas de las tres tablas.
 * @param userId ID del usuario logueado.
 * @returns Array combinado de todos los perfiles del usuario.
 */
export const getProfiles = async (userId: string): Promise<Perfil[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Consulta a la tabla perfil con joins para ubicación
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais: id_pais (id_pais, nombre_pais),
      Region: id_region (id_region, nombre_region),
      Comuna: id_comuna (id_comuna, nombre_comuna)
    `)
    .eq('usuario_id', userId)
    .order('creado_en', { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    throw new Error(`Fallo al obtener perfiles: ${error.message}`);
  }

  if (!data) return [];

  // Mapear los datos al formato Perfil
  const perfiles: Perfil[] = data.map((p: any) => ({
    id_perfil: p.id_perfil,
    usuario_id: p.usuario_id,
    tipo_perfil: p.tipo_perfil,
    nombre: p.nombre,
    email: p.email,
    direccion: p.direccion,
    lat: p.lat,
    lon: p.lon,
    telefono_contacto: p.telefono_contacto,
    imagen_url: p.imagen_url,
    video_url: p.video_url,
    perfil_visible: p.perfil_visible,
    id_comuna: p.id_comuna,
    id_region: p.id_region,
    id_pais: p.id_pais,
    creado_en: p.creado_en,
    actualizado_en: p.actualizado_en,
    artista_data: p.artista_data || {},
    banda_data: p.banda_data || {},
    local_data: p.local_data || {},
    productor_data: p.productor_data || {},
    representante_data: p.representante_data || {},
    // Agregar datos de ubicación para fácil acceso
    ubicacion: {
      comuna: p.Comuna?.nombre_comuna || '',
      region: p.Region?.nombre_region || '',
      pais: p.Pais?.nombre_pais || ''
    }
  }));

  return perfiles;
};


/**PERFILES VISIBLES  */


export const getPerfilesVisibles = async (): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Consulta única a tabla perfil filtrando por tipo y visibilidad
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais(nombre_pais),
      Region(nombre_region),
      Comuna(nombre_comuna)
    `)
    .eq('tipo_perfil', 'artista')
    .eq('perfil_visible', true)
    .order('nombre');

  // Manejo de errores
  if (error) {
    console.error("Error fetching visible profiles:", error);
    throw new Error(`Fallo al obtener perfiles visibles: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Mapeo de artistas visibles
  const perfilesVisibles: Profile[] = data.map(p => ({
    id: p.id_perfil,
    type: 'artist' as ProfileType,
    created_at: p.creado_en,
    data: {
      name: p.nombre,
      phone: p.telefono_contacto || '',
      email: p.email || '',
      countryId: p.Pais?.nombre_pais || '',
      regionId: p.Region?.nombre_region || '',
      cityId: p.Comuna?.nombre_comuna || '',
      image_url: p.imagen_url || '',
      perfil_visible: p.perfil_visible,
      tipo_perfil: p.tipo_perfil,
      updateAt: p.actualizado_en
    } as ArtistData
  }));

  return perfilesVisibles;
};

// En actions.ts - Agregar esta función
export async function enviarSolicitud(data: InvitacionData) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data: result, error } = await supabaseAdmin
      .from('solicitud') 
      .insert({
        id_perfil: data.id_perfil,
        id_banda: data.id_banda,
        fecha_invitacion: data.fecha_invitacion,
        fecha_vencimiento: data.fecha_vencimiento,
        nombre_banda: data.nombre_banda,
        tipo_invitacion: data.invitacion,
        descripcion: data.descripcion,
        estado: 'pendiente', 
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error guardando solicitud:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: result };
    
  } catch (error: any) {
    console.error('Error en enviarSolicitud:', error);
    return { success: false, error: error.message };
  }
}