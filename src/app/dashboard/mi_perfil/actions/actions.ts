'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile } from '@/types/profile'; 
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

/**
 * Crea un perfil de Artista.
 */
export async function createArtistProfile(userId: string, data: ArtistData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Mapeo basado en la interfaz ArtistData (usa IDs geográficos)
    const mappedData = {
        user_id: userId,
        nombre_artistico: data.name,
        email: data.email, 
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        image_url: data.image_url,
        perfil_visible: data.perfil_visible,
    };
    
     const { error } = await supabaseAdmin.from('ProfileArtist').insert([mappedData]);
     if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Artista creado para ${userId}`);
}

/**
 * Crea un perfil de Banda.
 */
export async function createBandProfile(userId: string, data: BandData) {
    // Mapeo basado en la interfaz BandData (usa NOMBRES geográficos)
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        user_id: userId,
        nombre_banda: data.band_name,
        estilo_banda: data.style,
        tipo_musica: data.music_type,
        es_tributo: data.is_tribute,
        telefono_contacto: data.contact_phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        foto_url: data.photo_url,
        video_url: data.video_url,
    };
    
     const { error } = await supabaseAdmin.from('ProfileBand').insert([mappedData]);
     if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Banda creado para ${userId}`);
}

/**
 * Crea un perfil de Local.
 */
export async function createPlaceProfile(userId: string, data: PlaceData) {
    // Mapeo basado en la interfaz PlaceData
    const supabaseAdmin = getSupabaseAdmin();
    
    const mappedData = {
        user_id: userId,
        nombre_local: data.place_name,
        direccion: data.address,
        telefono_local: data.phone,
        tipo_establecimiento: data.place_type,
        latitud: data.lat,
        longitud: data.lng,
        foto_url: data.photo_url,
        video_url: data.video_url,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        mail_cantante: data.singer,
        mail_grupo: data.band,
        mail_actor: data.actor,
        mail_humorista: data.comedian,
        mail_dobles: data.impersonator,
        mail_tributo: data.tribute,

    };

     const { error } = await supabaseAdmin.from('ProfilePlace').insert([mappedData]); 
     if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Local creado para ${userId}`);
}


// ===========================================
// 4. FUNCIÓN PRINCIPAL DE CREACIÓN (Router)
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
        default:
            throw new Error(`Tipo de perfil no soportado: ${type}`);
    }
};
export const deleteProfile = async (profileId: string, type: ProfileType) => {
    const supabaseAdmin = getSupabaseAdmin(); 
    
    switch (type) {
        case 'artist':
            const { error: artistError } = await supabaseAdmin
                .from('ProfileArtist')
                .delete()
                .eq('id_profile', profileId); // 
            
            if (artistError) {
                console.error("DELETE ARTIST PROFILE ERROR:", artistError);
                throw new Error(`Fallo al eliminar el perfil de artista: ${artistError.message}`);
            }
            break; 
            
        case 'band':
            const { error: bandError } = await supabaseAdmin
                .from('ProfileBand') // 
                .delete()
                .eq('id_profile', profileId); //
            
            if (bandError) {
                console.error("DELETE BAND PROFILE ERROR:", bandError);
                throw new Error(`Fallo al eliminar el perfil de banda: ${bandError.message}`);
            }
            break; 
            
        case 'place':
            const { error: placeError } = await supabaseAdmin
                .from('ProfilePlace') // 
                .delete()
                .eq('id_profile', profileId);
            
            if (placeError) {
                console.error("DELETE PLACE PROFILE ERROR:", placeError);
                throw new Error(`Fallo al eliminar el perfil de local: ${placeError.message}`);
            }
            break; 
            
        default:
            throw new Error(`Tipo de perfil no soportado: ${type}`);
    }
    
    console.log(`[DB OPERATION] Perfil ${type} eliminado: ${profileId}`);
};

export const updateProfile = async (userId: string, type: ProfileType, data: any) => {

        switch (type) {
            case 'artist':
            await updateArtistProfile(userId, data as ArtistData);
            break; 
        case 'band':
            await updateBandProfile(userId, data as BandData);
            break; 
        case 'place':
            await updatePlaceProfile(userId, data as PlaceData);
            break; 
        default:
            throw new Error(`Tipo de perfil no soportado: ${type}`);
        }

};

// ===========================================
// 5. FUNCIONES DE ACTUALIZACIÓN ESPECÍFICAS
// ===========================================

/**
 * Actualiza un perfil de Artista.
 */
export async function updateArtistProfile(userId: string, data: ArtistData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el perfil existe y pertenece al usuario
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('ProfileArtist')
        .select('id_profile')
        .eq('id_profile', userId) // Asumiendo que ArtistData tiene un campo 'id'
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil no encontrado o no tienes permisos para editarlo');
    }

    // Mapeo basado en la interfaz ArtistData
    const mappedData = {
        nombre_artistico: data.name,
        email: data.email, 
        telefono_contacto: data.phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        image_url: data.image_url,
        updatedAt: new Date().toISOString(),
    };
    
    const { error } = await supabaseAdmin
        .from('ProfileArtist')
        .update(mappedData)
        .eq('id_profile', userId);
    
    if (error) throw new Error(error.message);
    
    console.log(`[DB OPERATION] Perfil de Artista actualizado: ${userId}`);
}

/**
 * Actualiza un perfil de Banda.
 */
export async function updateBandProfile(userId: string, data: BandData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el perfil existe y pertenece al usuario
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('ProfileBand')
        .select('id_profile')
        .eq('id_profile', userId) // Asumiendo que BandData tiene un campo 'id'
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil no encontrado o no tienes permisos para editarlo');
    }

    const mappedData = {
        nombre_banda: data.band_name,
        estilo_banda: data.style,
        tipo_musica: data.music_type,
        es_tributo: data.is_tribute,
        telefono_contacto: data.contact_phone,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        foto_url: data.photo_url,
        video_url: data.video_url,
        updatedAt: data.updateAt
    };
    
    const { error } = await supabaseAdmin
        .from('ProfileBand')
        .update(mappedData)
        .eq('id_profile', userId)

    
    if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Banda actualizado: ${userId}`);
}

/**
 * Actualiza un perfil de Local.
 */
export async function updatePlaceProfile(userId: string, data: PlaceData) {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Verificar que el perfil existe y pertenece al usuario
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from('ProfilePlace')
        .select('id_profile')
        .eq('id_profile', userId)
  
        .single();

    if (fetchError || !existingProfile) {
        throw new Error('Perfil no encontrado o no tienes permisos para editarlo');
    }

    const mappedData = {
        nombre_local: data.place_name,
        direccion: data.address,
        telefono_local: data.phone,
        tipo_establecimiento: data.place_type,
        latitud: data.lat,
        longitud: data.lng,
        foto_url: data.photo_url,
        video_url: data.video_url,
        id_comuna: data.cityId, 
        id_region: data.regionId,
        id_pais: data.countryId,
        mail_cantante: data.singer,
        mail_grupo: data.band,
        mail_actor: data.actor,
        mail_humorista: data.comedian,
        mail_dobles: data.impersonator,
        mail_tributo: data.tribute,
        updatedAt: data.updateAt,
    };

    const { error } = await supabaseAdmin
        .from('ProfilePlace')
        .update(mappedData)
        .eq('id_profile', userId)
  
    if (error) throw new Error(error.message);

    console.log(`[DB OPERATION] Perfil de Local actualizado: ${userId}`);
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
export const getProfiles = async (userId: string): Promise<Profile[]> => {
    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Ejecutar consultas concurrentemente en las tres tablas, filtrando por user_id
    const [artistsRes, bandsRes, placesRes] = await Promise.all([
        // Incluimos todas las columnas necesarias para el mapeo
      supabaseAdmin.from('ProfileArtist').select(`
            *, 
            id_profile, 
            "createdAt",
            Pais(nombre_pais),     
            Region(nombre_region), 
            Comuna(nombre_comuna) 
        `).eq('user_id', userId),

        supabaseAdmin.from('ProfileBand').select(`
            *, 
            id_profile,
             "createdAt",
             Pais(nombre_pais),     
             Region(nombre_region), 
             Comuna(nombre_comuna),
              integrante!left(
                              id_artista,
                              estado,
                              tipo,
                              ProfileArtist(id_profile, nombre_artistico)
                            ) 
             `).eq('user_id', userId)
               .eq('integrante.estado', 'activo'),
        supabaseAdmin.from('ProfilePlace').select(` 
             *,
             id_profile,
              "createdAt",
                Pais(nombre_pais),     
             Region(nombre_region), 
             Comuna(nombre_comuna) 
             `).eq('user_id', userId),
    ]);

    // 2. Manejo de errores
    if (artistsRes.error || bandsRes.error || placesRes.error) {
        console.error("Error fetching profiles:", artistsRes.error || bandsRes.error || placesRes.error);
        throw new Error(`Fallo al obtener perfiles: ${artistsRes.error?.message || bandsRes.error?.message || placesRes.error?.message}`);
    }

    let allProfiles: Profile[] = [];

    // 3. Mapeo y tipado de perfiles de Artista (¡CORREGIDO!)
    if (artistsRes.data) {
        allProfiles = allProfiles.concat(artistsRes.data.map(p => ({
            // Usamos el ID correcto de la tabla de artista
            id: p.id_profile, 
            type: 'artist' as ProfileType,
            created_at: p.createdAt, // Usamos el campo de fecha correcto
            data: {
                // Mapeo explícito de DB -> Interfaz ArtistData
                name: p.nombre_artistico,
                phone: p.telefono_contacto,
                email: p.email,
                countryId: p.Pais.nombre_pais,
                regionId: p.Region.nombre_region,
                cityId: p.Comuna.nombre_comuna,
                image_url: p.image_url,
                perfil_visible: p.perfil_visible,
            } as ArtistData, 
        })));
    }

    // 4. Mapeo y tipado de perfiles de Banda (¡CORREGIDO!)
    if (bandsRes.data) {
        allProfiles = allProfiles.concat(bandsRes.data.map(p => ({
            id: p.id_profile, // Usamos el ID correcto de la tabla
            type: 'band' as ProfileType,
            created_at: p.createdAt,
            data: {
                // Mapeo explícito de DB -> Interfaz BandData
                band_name: p.nombre_banda,
                style: p.estilo_banda,
                music_type: p.tipo_musica,
                is_tribute: p.es_tributo,
                contact_phone: p.telefono_contacto,
                cityId: p.Comuna.nombre_comuna,
                regionId: p.Region.nombre_region,
                countryId: p.Pais.nombre_pais,
                photo_url: p.foto_url,
                video_url: p.video_url,
                tipo_perfil:p.tipo_perfil,
                integrante: p.integrante.map((i: any) => ({
                    id: i.id_artista,
                    estado: i.estado,
                    tipo: i.tipo,
                    nombre_integrante: i.ProfileArtist.nombre_artistico,
                })),
            } as BandData,
        })));
    }

    // 5. Mapeo y tipado de perfiles de Local (¡CORREGIDO!)
    if (placesRes.data) {
        allProfiles = allProfiles.concat(placesRes.data.map(p => ({
            id: p.id_profile, // Usamos el ID correcto de la tabla
            type: 'place' as ProfileType,
            created_at: p.createdAt,
            data: {
                // Mapeo explícito de DB -> Interfaz PlaceData
                // mismos nombres para la db e interfaz
                place_name: p.nombre_local,
                address: p.direccion,
                cityId: p.Comuna.nombre_comuna,
                regionId: p.Region.nombre_region,
                countryId: p.Pais.nombre_pais,
                phone: p.telefono_local,
                place_type: p.tipo_establecimiento,
                lat: p.latitud,
                lng: p.longitud,
                photo_url: p.foto_url,
                video_url: p.video_url,
                 singer: p.mail_cantante,
                 band: p.mail_grupo,
                 actor: p.mail_actor,
                 comedian: p.mail_humorista,
                 impersonator: p.mail_dobles,
                 tribute: p.mail_tributo,
            } as PlaceData,
        })));
    }

    // 6. Ordenar por fecha de creación
    allProfiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return allProfiles;
};


/**PERFILES VISIBLES  */


export const getPerfilesVisibles = async (): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // SOLO ProfileArtist con perfil_visible = true
  const { data, error } = await supabaseAdmin
    .from('ProfileArtist')
    .select(`
      *, 
      id_profile, 
      "createdAt",
      Pais(nombre_pais),     
      Region(nombre_region), 
      Comuna(nombre_comuna) 
    `)
    .eq('perfil_visible', true);

  // Manejo de errores
  if (error) {
    console.error("Error fetching visible profiles:", error);
    throw new Error(`Fallo al obtener perfiles visibles: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Mapeo solo de artistas visibles
  const perfilesVisibles: Profile[] = data.map(p => ({
    id: p.id_profile, 
    type: 'artist' as ProfileType,
    created_at: p.createdAt,
    data: {
      name: p.nombre_artistico,
      phone: p.telefono_contacto,
      email: p.email,
      countryId: p.Pais.nombre_pais,
      regionId: p.Region.nombre_region,
      cityId: p.Comuna.nombre_comuna,
      image_url: p.image_url,
      perfil_visible: p.perfil_visible,
    } as ArtistData,
  }));

  // Ordenar por nombre
  perfilesVisibles.sort((a, b) => 
    (a.data as ArtistData).name.localeCompare((b.data as ArtistData).name)
  );
  
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