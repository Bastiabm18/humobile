'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile,Perfil, PerfilConIntegrantes } from '@/types/profile'; 
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
        case 'artista':
            await createArtistProfile(userId, data as ArtistData);
            break; 
        case 'banda':
            await createBandProfile(userId, data as BandData);
            break; 
        case 'lugar':
            await createPlaceProfile(userId, data as PlaceData);
            break;
        case 'productor':
            await createProducerProfile(userId, data);
            break;
        case 'representante':
            await createRepresentativeProfile(userId, data);
            break; 
        default:
            throw new Error(`Tipo de perfil no soportado: ${type}`);
    }
};

export const BorrarPerfil = async (profileId: string) => {
    const supabaseAdmin = getSupabaseAdmin(); 
    
 
    
    const { error } = await supabaseAdmin
        .from('perfil')
        .delete()
        .eq('id_perfil', profileId);

    if (error) {
        console.error(`DELETE  PROFILE ERROR:`, error);
        throw new Error(`Fallo al eliminar el perfil : ${error.message}`);
    }
    
    console.log(`[DB OPERATION] Perfil  eliminado: ${profileId}`);
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
export const getProfiles = async (userId: string): Promise<PerfilConIntegrantes[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { data, error } = await supabaseAdmin.rpc('get_perfiles_con_integrantes', {
    p_user_id: userId
  });

  if (error) {
    console.error("Error fetching profiles:", error);
    throw new Error(`Fallo al obtener perfiles: ${error.message}`);
  }

  if (!data) return [];

  const perfiles: PerfilConIntegrantes[] = data.map((p: any) => ({
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
    integrantes_perfil: p.integrantes_ids || [],
    representados_perfil: p.representados_ids || [],
    nombre_integrantes: p.integrantes_nombres || [],
    nombre_representados: p.representados_nombres || [],
    representantes_perfil:p.representante_ids || [],
    representantes_nombres:p.representante_nombres || [],
    bandas_ids:p.bandas_ids || [],
    bandas_nombres:p.bandas_nombres || []
  }));

  return perfiles;
};


/**PERFILES VISIBLES  */





export const getPerfilesArtistaVisibles = async (): Promise<Perfil[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Consulta única a tabla perfil filtrando por tipo y visibilidad
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      id_perfil,
      usuario_id,
      tipo_perfil,
      nombre,
      email,
      direccion,
      lat,
      lon,
      telefono_contacto,
      imagen_url,
      video_url,
      perfil_visible,
      id_comuna,
      id_region,
      id_pais,
      creado_en,
      actualizado_en,
      artista_data,
      banda_data,
      local_data,
      productor_data,
      representante_data,
      integrantes_perfil,
      representados_perfil
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

  // Mapeo de artistas visibles directamente a la interfaz Perfil
  const perfilesVisibles: Perfil[] = data.map(p => ({
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
    integrantes_perfil: p.integrantes_perfil || [],
    representados_perfil: p.representados_perfil || []
  }));

  return perfilesVisibles;
};
export const getPerfilesTodoUso = async (): Promise<Perfil[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Consulta única a tabla perfil filtrando por tipo y visibilidad
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      id_perfil,
      usuario_id,
      tipo_perfil,
      nombre,
      email,
      direccion,
      lat,
      lon,
      telefono_contacto,
      imagen_url,
      video_url,
      perfil_visible,
      id_comuna,
      id_region,
      id_pais,
      creado_en,
      actualizado_en,
      artista_data,
      banda_data,
      local_data,
      productor_data,
      representante_data,
      integrantes_perfil,
      representados_perfil
    `)
    .order('nombre');

  // Manejo de errores
  if (error) {
    console.error("Error fetching visible profiles:", error);
    throw new Error(`Fallo al obtener perfiles visibles: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Mapeo de artistas visibles directamente a la interfaz Perfil
  const perfilesVisibles: Perfil[] = data.map(p => ({
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
    integrantes_perfil: p.integrantes_perfil || [],
    representados_perfil: p.representados_perfil || []
  }));

  return perfilesVisibles;
};
export const getPerfilesRepresentanteVisibles = async (): Promise<Perfil[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Consulta única a tabla perfil filtrando por tipo y visibilidad
  const { data, error } = await supabaseAdmin
    .from('perfil')
    .select(`
      id_perfil,
      usuario_id,
      tipo_perfil,
      nombre,
      email,
      direccion,
      lat,
      lon,
      telefono_contacto,
      imagen_url,
      video_url,
      perfil_visible,
      id_comuna,
      id_region,
      id_pais,
      creado_en,
      actualizado_en,
      artista_data,
      banda_data,
      local_data,
      productor_data,
      representante_data,
      integrantes_perfil,
      representados_perfil
    `)
    .in('tipo_perfil', ['banda','artista'])
    .eq('perfil_visible', true)
    .order('tipo_perfil')
    .order('nombre');

  // Manejo de errores
  if (error) {
    console.error("Error fetching visible profiles:", error);
    throw new Error(`Fallo al obtener perfiles visibles: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Mapeo de artistas visibles directamente a la interfaz Perfil
  const perfilesVisibles: Perfil[] = data.map(p => ({
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
    integrantes_perfil: p.integrantes_perfil || [],
    representados_perfil: p.representados_perfil || []
  }));

  return perfilesVisibles;
};


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


// FUNCIÓN AUXILIAR PARA BUSCAR SOLICITUD
async function buscarSolicitud(
  supabaseAdmin: any,
  idCreador: string, 
  idInvitado: string, 
  tipoSolicitud: 'unirse_banda' | 'ser_representado'
) {
  try {
    const { data } = await supabaseAdmin
      .from('solicitud')
      .select(`
        id,
        tipo_solicitud:tipo_solicitud_id (
          codigo
        )
      `)
      .eq('id_creador', idCreador)
      .eq('id_invitado', idInvitado)
      .eq('estado', 'pendiente')
      .eq('tipo_solicitud.codigo', tipoSolicitud)
      .single();

    return data;
  } catch (error: any) {
    if (error.code !== 'PGRST116') {
      console.error(`Error buscando solicitud: ${error.message}`);
    }
    return null;
  }
}

// FUNCIÓN AUXILIAR PARA ELIMINAR SOLICITUD
async function eliminarSolicitudSiExiste(
  supabaseAdmin: any,
  idCreador: string, 
  idInvitado: string, 
  tipoSolicitud: 'unirse_banda' | 'ser_representado'
) {
  const solicitudExistente = await buscarSolicitud(supabaseAdmin, idCreador, idInvitado, tipoSolicitud);
  
  if (solicitudExistente) {
    await supabaseAdmin
      .from('solicitud')
      .delete()
      .eq('id', solicitudExistente.id);
    return true;
  }
  
  return false;
}

export const actualizarPerfil = async (
  perfil: Perfil, 
  integrantes_perfil?: string[], 
  representados_perfil?: string[],
  integrantes_eliminar?: string[], 
  representados_eliminar?: string[]
): Promise<{
  exito: boolean; 
  mensaje: string; 
  datos?: Perfil;
  resultadosIntegrantes?: any[];
  resultadosRepresentados?: any[];
  resultadosEliminacionIntegrantes?: any[];
  resultadosEliminacionRepresentados?: any[];
}> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Extraer arrays de integrantes y representados si existen
    const integrantesIds = Array.isArray(integrantes_perfil) ? integrantes_perfil : [];
    const representadosIds = Array.isArray(representados_perfil) ? representados_perfil : [];
    const integrantesEliminarIds = Array.isArray(integrantes_eliminar) ? integrantes_eliminar : [];
    const representadosEliminarIds = Array.isArray(representados_eliminar) ? representados_eliminar : [];

    // Preparar datos para la actualización del perfil base
    const datosActualizacion: any = {
      nombre: perfil.nombre,
      email: perfil.email,
      direccion: perfil.direccion,
      lat: perfil.lat,
      lon: perfil.lon,
      telefono_contacto: perfil.telefono_contacto,
      imagen_url: perfil.imagen_url,
      video_url: perfil.video_url,
      perfil_visible: perfil.perfil_visible,
      id_comuna: perfil.id_comuna,
      id_region: perfil.id_region,
      id_pais: perfil.id_pais,
      actualizado_en: new Date().toISOString()
    };

    // Agregar datos específicos según tipo de perfil
    switch (perfil.tipo_perfil) {
      case 'artista':
        datosActualizacion.artista_data = perfil.artista_data;
        break;
      case 'banda':
        datosActualizacion.banda_data = perfil.banda_data;
        break;
      case 'local':
        datosActualizacion.local_data = perfil.local_data;
        break;
      case 'productor':
        datosActualizacion.productor_data = perfil.productor_data;
        break;
      case 'representante':
        datosActualizacion.representante_data = perfil.representante_data;
        break;
    }

    // Realizar la actualización en la base de datos
    const { data, error } = await supabaseAdmin
      .from('perfil')
      .update(datosActualizacion)
      .eq('id_perfil', perfil.id_perfil)
      .select(`
        *,
        Pais: id_pais (id_pais, nombre_pais),
        Region: id_region (id_region, nombre_region),
        Comuna: id_comuna (id_comuna, nombre_comuna)
      `)
      .single();

    if (error) {
      console.error("Error actualizando perfil:", error);
      return {
        exito: false,
        mensaje: `Error al actualizar perfil: ${error.message}`
      };
    }

    // Mapear la respuesta al formato Perfil
    const perfilActualizado: Perfil = {
      id_perfil: data.id_perfil,
      usuario_id: data.usuario_id,
      tipo_perfil: data.tipo_perfil,
      nombre: data.nombre,
      email: data.email,
      direccion: data.direccion,
      lat: data.lat,
      lon: data.lon,
      telefono_contacto: data.telefono_contacto,
      imagen_url: data.imagen_url,
      video_url: data.video_url,
      perfil_visible: data.perfil_visible,
      id_comuna: data.id_comuna,
      id_region: data.id_region,
      id_pais: data.id_pais,
      creado_en: data.creado_en,
      actualizado_en: data.actualizado_en,
      artista_data: data.artista_data || {},
      banda_data: data.banda_data || {},
      local_data: data.local_data || {},
      productor_data: data.productor_data || {},
      representante_data: data.representante_data || {},
    };

    // Procesar integrantes y representados según el tipo de perfil
    let resultadosIntegrantes: any[] = [];
    let resultadosRepresentados: any[] = [];
    let resultadosEliminacionIntegrantes: any[] = [];
    let resultadosEliminacionRepresentados: any[] = [];

    // 1. PRIMERO: ELIMINAR INTEGRANTES/REPRESENTACIONES ESPECÍFICOS

    // eliminar representacion 
    if((perfil.tipo_perfil === 'artista' || perfil.tipo_perfil ==='banda') && representadosEliminarIds.length > 0){
         for (const idRepresentadoEliminar of representadosEliminarIds) {
        try {
          // Eliminar de la tabla representado
          const { error: errorEliminarRepresentado } = await supabaseAdmin
            .from('representado')
            .delete()
            .eq('id_representado', perfil.id_perfil)
            .eq('id_representante', idRepresentadoEliminar);

          if (errorEliminarRepresentado) {
            resultadosEliminacionRepresentados.push({
              exito: false,
              idRepresentado: idRepresentadoEliminar,
              mensaje: `Error eliminando representado: ${errorEliminarRepresentado.message}`,
              tipo: 'representado'
            });
          } else {
            resultadosEliminacionRepresentados.push({
              exito: true,
              idRepresentado: idRepresentadoEliminar,
              mensaje: 'Representado eliminado exitosamente',
              tipo: 'representado'
            });
          }

          // También eliminar solicitud pendiente asociada (si existe)
          await eliminarSolicitudSiExiste(
            supabaseAdmin,
            perfil.id_perfil,
            idRepresentadoEliminar,
            'ser_representado'
          );

        } catch (error: any) {
          resultadosEliminacionRepresentados.push({
            exito: false,
            idRepresentado: idRepresentadoEliminar,
            mensaje: `Error: ${error.message}`,
            tipo: 'representado'
          });
        }
      }
      }
      // Eliminar participacion en la banda 
    if (perfil.tipo_perfil === 'artista' && integrantesEliminarIds.length > 0) {
          for (const idArtistaEliminar of integrantesEliminarIds) {
        try {
          // Eliminar de la tabla integrante
          const { error: errorEliminarIntegrante } = await supabaseAdmin
            .from('integrante')
            .delete()
            .eq('id_artista', perfil.id_perfil)
            .eq('id_banda', idArtistaEliminar);

          if (errorEliminarIntegrante) {
            resultadosEliminacionIntegrantes.push({
              exito: false,
              idArtista: idArtistaEliminar,
              mensaje: `Error eliminando participacion en la banda: ${errorEliminarIntegrante.message}`,
              tipo: 'integrante'
            });
          } else {
            resultadosEliminacionIntegrantes.push({
              exito: true,
              idArtista: idArtistaEliminar,
              mensaje: 'Participacion en la banda eliminada exitosamente',
              tipo: 'integrante'
            });
          }

          // También eliminar solicitud pendiente asociada (si existe)
          await eliminarSolicitudSiExiste(
            supabaseAdmin,
            perfil.id_perfil,
            idArtistaEliminar,
            'unirse_banda'
          );

        } catch (error: any) {
          resultadosEliminacionIntegrantes.push({
            exito: false,
            idArtista: idArtistaEliminar,
            mensaje: `Error: ${error.message}`,
            tipo: 'integrante'
          });
        }
      }
    }
    // Eliminar integrantes específicos (para bandas)
    if (perfil.tipo_perfil === 'banda' && integrantesEliminarIds.length > 0) {
      for (const idArtistaEliminar of integrantesEliminarIds) {
        try {
          // Eliminar de la tabla integrante
          const { error: errorEliminarIntegrante } = await supabaseAdmin
            .from('integrante')
            .delete()
            .eq('id_banda', perfil.id_perfil)
            .eq('id_artista', idArtistaEliminar);

          if (errorEliminarIntegrante) {
            resultadosEliminacionIntegrantes.push({
              exito: false,
              idArtista: idArtistaEliminar,
              mensaje: `Error eliminando integrante: ${errorEliminarIntegrante.message}`,
              tipo: 'integrante'
            });
          } else {
            resultadosEliminacionIntegrantes.push({
              exito: true,
              idArtista: idArtistaEliminar,
              mensaje: 'Integrante eliminado exitosamente',
              tipo: 'integrante'
            });
          }

          // También eliminar solicitud pendiente asociada (si existe)
          await eliminarSolicitudSiExiste(
            supabaseAdmin,
            perfil.id_perfil,
            idArtistaEliminar,
            'unirse_banda'
          );

        } catch (error: any) {
          resultadosEliminacionIntegrantes.push({
            exito: false,
            idArtista: idArtistaEliminar,
            mensaje: `Error: ${error.message}`,
            tipo: 'integrante'
          });
        }
      }
    }

    // Eliminar representados específicos (para representantes)
    if (perfil.tipo_perfil === 'representante' && representadosEliminarIds.length > 0) {
      for (const idRepresentadoEliminar of representadosEliminarIds) {
        try {
          // Eliminar de la tabla representado
          const { error: errorEliminarRepresentado } = await supabaseAdmin
            .from('representado')
            .delete()
            .eq('id_representante', perfil.id_perfil)
            .eq('id_representado', idRepresentadoEliminar);

          if (errorEliminarRepresentado) {
            resultadosEliminacionRepresentados.push({
              exito: false,
              idRepresentado: idRepresentadoEliminar,
              mensaje: `Error eliminando representado: ${errorEliminarRepresentado.message}`,
              tipo: 'representado'
            });
          } else {
            resultadosEliminacionRepresentados.push({
              exito: true,
              idRepresentado: idRepresentadoEliminar,
              mensaje: 'Representado eliminado exitosamente',
              tipo: 'representado'
            });
          }

          // También eliminar solicitud pendiente asociada (si existe)
          await eliminarSolicitudSiExiste(
            supabaseAdmin,
            perfil.id_perfil,
            idRepresentadoEliminar,
            'ser_representado'
          );

        } catch (error: any) {
          resultadosEliminacionRepresentados.push({
            exito: false,
            idRepresentado: idRepresentadoEliminar,
            mensaje: `Error: ${error.message}`,
            tipo: 'representado'
          });
        }
      }
    }

    // 2. SEGUNDO: AGREGAR NUEVOS INTEGRANTES/REPRESENTADOS
    // Para bandas: procesar integrantes
    if (perfil.tipo_perfil === 'banda' && integrantesIds.length > 0) {
      // Verificar y eliminar solicitudes existentes para cada integrante
      for (const idArtista of integrantesIds) {
        try {
          // PRIMERO: Verificar si ya existe un integrante CONFIRMADO (activo)
          const { data: integranteConfirmado } = await supabaseAdmin
            .from('integrante')
            .select('id')
            .eq('id_banda', perfil.id_perfil)
            .eq('id_artista', idArtista)
            .eq('estado', 'activo')
            .single();

          // Si ya es integrante confirmado, no hacemos nada
          if (integranteConfirmado) {
            console.log(`Artista ${idArtista} ya es integrante confirmado de la banda`);
            resultadosIntegrantes.push({ 
              exito: false, 
              idArtista, 
              mensaje: 'Ya es integrante confirmado',
              estado: 'confirmado' 
            });
            continue; // Pasamos al siguiente artista
          }

          // SEGUNDO: Eliminar solicitud pendiente existente (si existe)
          await eliminarSolicitudSiExiste(
            supabaseAdmin,
            perfil.id_perfil,
            idArtista,
            'unirse_banda'
          );

          // TERCERO: Verificar si ya existe un registro en la tabla integrante (pero no confirmado)
          const { data: integranteExistente } = await supabaseAdmin
            .from('integrante')
            .select('id')
            .eq('id_banda', perfil.id_perfil)
            .eq('id_artista', idArtista)
            .not('estado', 'eq', 'activo') 
            .single();

          // Si existe (pero no está confirmado), eliminarlo
          if (integranteExistente) {
            await supabaseAdmin
              .from('integrante')
              .delete()
              .eq('id', integranteExistente.id);
          }
        } catch (error) {
          // Si no existe registro, continuar normalmente
          console.log(`No existe solicitud o integrante previo para artista ${idArtista}`);
        }
      }
      
      // Luego, crear nuevos integrantes (solo para los que no estaban confirmados)
      resultadosIntegrantes = await procesarIntegrantesBanda(perfil.id_perfil, integrantesIds);
    }

    // Para representantes: procesar representados
    if (perfil.tipo_perfil === 'representante' && representadosIds.length > 0) {
      // Verificar y eliminar solicitudes existentes para cada representado
      for (const idRepresentado of representadosIds) {
        try {
          // PRIMERO: Verificar si ya existe un representado CONFIRMADO
          const { data: representadoConfirmado } = await supabaseAdmin
            .from('representado')
            .select('id')
            .eq('id_representante', perfil.id_perfil)
            .eq('id_representado', idRepresentado)
            .eq('estado_representacion', 'confirmado')
            .single();

          // Si ya es representado confirmado, no hacemos nada
          if (representadoConfirmado) {
            console.log(`Perfil ${idRepresentado} ya es representado confirmado`);
            resultadosRepresentados.push({ 
              exito: false, 
              idRepresentado, 
              mensaje: 'Ya es representado confirmado',
              estado: 'confirmado' 
            });
            continue; // Pasamos al siguiente representado
          }

          // SEGUNDO: Eliminar solicitud pendiente existente (si existe)
          await eliminarSolicitudSiExiste(
            supabaseAdmin,
            perfil.id_perfil,
            idRepresentado,
            'ser_representado'
          );

          // TERCERO: Verificar si ya existe un registro en la tabla representado (pero no confirmado)
          const { data: representadoExistente } = await supabaseAdmin
            .from('representado')
            .select('id')
            .eq('id_representante', perfil.id_perfil)
            .eq('id_representado', idRepresentado)
            .eq('estado_representacion', 'pendiente')
            .single();

          // Si existe (pero no está confirmado), eliminarlo
          if (representadoExistente) {
            await supabaseAdmin
              .from('representado')
              .delete()
              .eq('id', representadoExistente.id);
          }
        } catch (error) {
          // Si no existe registro, continuar normalmente
          console.log(`No existe solicitud o representado previo para ${idRepresentado}`);
        }
      }
      
      // Luego, crear nuevos representados (solo para los que no estaban confirmados)
      resultadosRepresentados = await procesarRepresentados(perfil.id_perfil, representadosIds);
    }

    return {
      exito: true,
      mensaje: 'Perfil actualizado exitosamente',
      datos: perfilActualizado,
      resultadosIntegrantes,
      resultadosRepresentados,
      resultadosEliminacionIntegrantes,
      resultadosEliminacionRepresentados
    };

  } catch (error: any) {
    console.error("Error en actualizarPerfil:", error);
    return {
      exito: false,
      mensaje: `Error interno: ${error.message}`
    };
  }
};

// Función para eliminar perfil
export const eliminarPerfil = async (id_perfil: string): Promise<{exito: boolean; mensaje: string}> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const { error } = await supabaseAdmin
      .from('perfil')
      .delete()
      .eq('id_perfil', id_perfil);

    if (error) {
      console.error("Error eliminando perfil:", error);
      return {
        exito: false,
        mensaje: `Error al eliminar perfil: ${error.message}`
      };
    }

    return {
      exito: true,
      mensaje: 'Perfil eliminado exitosamente'
    };

  } catch (error: any) {
    console.error("Error en eliminarPerfil:", error);
    return {
      exito: false,
      mensaje: `Error interno: ${error.message}`
    };
  }
};

// 1. FUNCIÓN PARA CREAR SOLICITUD
export async function crearSolicitud(
  creadorId: string,
  invitadoId: string,
  tipo: 'unirse_banda' | 'ser_representado'
) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Obtener el ID del tipo de solicitud
    const { data: tipoData, error: tipoError } = await supabaseAdmin
      .from('tipo_solicitud')
      .select('id')
      .eq('codigo', tipo)
      .single();

    if (tipoError) throw tipoError;

    // Crear la solicitud
    const { data, error } = await supabaseAdmin
      .from('solicitud')
      .insert([{
        tipo_solicitud_id: tipoData.id,
        id_creador: creadorId,
        id_invitado: invitadoId,
        id_evento_solicitud: null,
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estado: 'pendiente'
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return { exito: true, data };
  } catch (error: any) {
    console.error(`Error creando solicitud ${tipo}:`, error);
    return { exito: false, error: error.message };
  }
}

// 2. FUNCIÓN PARA CREAR INTEGRANTE
export async function crearIntegrante(id_artista: string, id_banda: string) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const { data, error } = await supabaseAdmin
      .from('integrante')
      .insert([{
        id_artista,
        id_banda,
        estado: 'pendiente',
        tipo: 'miembro'
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return { exito: true, data };
  } catch (error: any) {
    console.error('Error creando integrante:', error);
    return { exito: false, error: error.message };
  }
}

// 3. FUNCIÓN PARA CREAR REPRESENTADO
export async function crearRepresentado(id_representante: string, id_representado: string) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    const { data, error } = await supabaseAdmin
      .from('representado')
      .insert([{
        id_representante,
        id_representado,
        estado_representacion: 'pendiente'
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    return { exito: true, data };
  } catch (error: any) {
    console.error('Error creando representado:', error);
    return { exito: false, error: error.message };
  }
}

// 4. FUNCIÓN PARA PROCESAR INTEGRANTES DE BANDA
export async function procesarIntegrantesBanda(id_banda: string, integrantesIds: string[]) {
  const resultados = [];
  
  for (const idArtista of integrantesIds) {
    try {
      // Crear solicitud
      const solicitudResult = await crearSolicitud(id_banda, idArtista, 'unirse_banda');
      if (!solicitudResult.exito) {
        resultados.push({ exito: false, idArtista, error: solicitudResult.error });
        continue;
      }

      // Crear integrante
      const integranteResult = await crearIntegrante(idArtista, id_banda);
      if (!integranteResult.exito) {
        resultados.push({ exito: false, idArtista, error: integranteResult.error });
        continue;
      }

      resultados.push({ exito: true, idArtista, data: integranteResult.data });
    } catch (error: any) {
      resultados.push({ exito: false, idArtista, error: error.message });
    }
  }

  return resultados;
}

// 5. FUNCIÓN PARA PROCESAR REPRESENTADOS
export async function procesarRepresentados(id_representante: string, representadosIds: string[]) {
  const resultados = [];
  
  for (const idRepresentado of representadosIds) {
    try {
      // Crear solicitud
      const solicitudResult = await crearSolicitud(id_representante, idRepresentado, 'ser_representado');
      if (!solicitudResult.exito) {
        resultados.push({ exito: false, idRepresentado, error: solicitudResult.error });
        continue;
      }

      // Crear representado
      const representadoResult = await crearRepresentado(id_representante, idRepresentado);
      if (!representadoResult.exito) {
        resultados.push({ exito: false, idRepresentado, error: representadoResult.error });
        continue;
      }

      resultados.push({ exito: true, idRepresentado, data: representadoResult.data });
    } catch (error: any) {
      resultados.push({ exito: false, idRepresentado, error: error.message });
    }
  }

  return resultados;
}

// 6. FUNCIÓN PRINCIPAL CREAR PERFIL
export async function crearPerfil(perfilData: any) {
  const supabaseAdmin = getSupabaseAdmin();
  
  try {
    // Extraer arrays
    const integrantesIds = Array.isArray(perfilData.integrantes_perfil) ? perfilData.integrantes_perfil : [];
    const representadosIds = Array.isArray(perfilData.representados_perfil) ? perfilData.representados_perfil : [];

    // Crear perfil sin arrays
    const perfilParaInsertar = { ...perfilData };
    delete perfilParaInsertar.integrantes_perfil;
    delete perfilParaInsertar.representados_perfil;

    const { data: perfilCreado, error: errorPerfil } = await supabaseAdmin
      .from('perfil')
      .insert([perfilParaInsertar])
      .select()
      .single();

    if (errorPerfil) throw errorPerfil;

    const idPerfilCreado = perfilCreado.id_perfil;

    // Procesar según tipo
    let resultadosIntegrantes:any = [];
    let resultadosRepresentados:any = [];

    if (perfilData.tipo_perfil === 'banda' && integrantesIds.length > 0) {
      resultadosIntegrantes = await procesarIntegrantesBanda(idPerfilCreado, integrantesIds);
    }

    if (perfilData.tipo_perfil === 'representante' && representadosIds.length > 0) {
      resultadosRepresentados = await procesarRepresentados(idPerfilCreado, representadosIds);
    }

    return {
      exito: true,
      mensaje: 'Perfil creado',
      datos: perfilCreado,
      resultadosIntegrantes,
      resultadosRepresentados
    };

  } catch (error: any) {
    console.error('Error crearPerfil:', error);
    return { exito: false, error: error.message };
  }
}