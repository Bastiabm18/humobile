'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, BlockDateRangeParams, SolicitudRespuesta, AceptarRechazarSolicitud } from '@/types/profile'; 
import { revalidatePath } from 'next/cache';


/**
 * Obtiene todos los perfiles (Artist, Band, Place) asociados al usuario logueado, 
 * combinando las consultas de las tres tablas.
 * @param userId ID del usuario logueado.
 * @returns Array combinado de todos los perfiles del usuario.
 */
export async function blockDateRange({
  creator_profile_id,
  creator_type,
  title,
  reason,
  fecha_hora_ini,
  fecha_hora_fin,
}: BlockDateRangeParams) {
 const supabase = getSupabaseAdmin();

  // Validación básica (nunca está de más)
  if (!creator_profile_id || !creator_type || !title || !reason) {
    return { success: false, error: 'FALTAN DATOS ' };
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      creator_profile_id,
      creator_type,
      title: title.trim(),
      description: reason.trim(),
      fecha_hora_ini,
      fecha_hora_fin,
      is_blocked: true,
      blocked_reason: reason.trim(),
      status: 'approved', // bloqueos siempre aprobados al tiro
    })
    .select()
    .single();

  if (error) {
    console.error('Error al bloquear fecha:', error);
    return { success: false, error: error.message };
  }

  // Refrescamos la página del calendario
  revalidatePath('/dashboard/agenda');

  return { success: true, data };
}


export async function aceptarSolicitud ({ id_solicitud,respuesta_solicitud,motivo,tipo,id_banda,id_artista}: AceptarRechazarSolicitud){
   try {
    const supabase = getSupabaseAdmin();
    
    if (tipo === 'solicitud'){

        const { data, error } = await supabase
              .from('solicitud')
              .update({
                estado: 'aceptada',
                updated_at: new Date().toISOString()
              })
              .eq('id', id_solicitud)
              .eq('estado', 'pendiente') // Solo actualizar si está pendiente
              .select()
              .single();
            
            if (error) {
              console.error('Error aceptando solicitud:', error);
              return { 
                success: false, 
                error: error.message || 'Error al aceptar la solicitud' 
              };
            }
          
             const { data: integrante, error: errorInsert } = await supabase
              .from('integrante')
              .insert({
                id_artista: id_artista,
                id_banda: id_banda,
                estado: 'activo',
                tipo: motivo || 'miembro', 
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (errorInsert) {
              console.error('Error agregando integrante:', errorInsert);

              // Si falla el insert, revertir el update de la solicitud
              await supabase
                .from('solicitud')
                .update({
                  estado: 'pendiente',
                  updated_at: new Date().toISOString()
                })
                .eq('id', id_solicitud);
              
              return { 
                success: false, 
                error: errorInsert.message || 'Error al agregar integrante a la banda' 
              };
            }
          
            return { 
              success: true, 
              data: {
                solicitud: data,
                integrante: integrante
              },
              message: 'Solicitud aceptada y artista agregado a la banda exitosamente'
            };
          
            // TODO: Aquí podrías agregar lógica adicional:
            // - Agregar artista a la banda
            // - Notificar a ambos usuarios
            // - Crear relación en tabla band_members, etc.
          
            return { 
              success: true, 
              data,
              message: 'Solicitud aceptada exitosamente'
            };

    }else{

      const { data, error } = await supabase
      .from('participacion_evento')
      .update({
        estado: 'confirmado',
        updated_at: new Date().toISOString()
      })
      .eq('id', id_solicitud)
      .eq('estado', 'pendiente') // Solo actualizar si está pendiente
      .select()
      .single();

    if (error) {
      console.error('Error aceptando evento:', error);
      return { 
        success: false, 
        error: error.message || 'Error al aceptar el evento' 
      };
    }
    return { 
      success: true, 
      data,
      message: 'Solicitud aceptada exitosamente'
    };
    
    
    }





  } catch (error: any) {
    console.error('Error en aceptarSolicitud:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
  
  
}
export async function rechazarSolicitud ({ id_solicitud,motivo,tipo}: AceptarRechazarSolicitud){
 try {
    const supabase = getSupabaseAdmin();
    
    const updateData: any = {
      estado: 'rechazado',
      updated_at: new Date().toISOString(),
      motivo_rechazo: motivo,
    };
    
    if (tipo =='evento'){
// Si hay motivo, guardarlo (podrías agregar un campo motivo_rechazo a la tabla)
    if (motivo) {
      updateData.motivo_rechazo = motivo.trim();
    }

    const { data, error } = await supabase
      .from('participacion_evento')
      .update(updateData)
      .eq('id', id_solicitud)
      .eq('estado', 'pendiente') // Solo actualizar si está pendiente
      .select()
      .single();

    if (error) {
      console.error('Error rechazando evento:', error);
      return { 
        success: false, 
        error: error.message || 'Error al rechazar el evento' 
      };
    }

    // TODO: Aquí podrías notificar al artista del rechazo

    return { 
      success: true, 
      data,
      message: 'Solicitud rechazada exitosamente'
    };

    }else{

      // Si hay motivo, guardarlo (podrías agregar un campo motivo_rechazo a la tabla)
    if (motivo) {
      updateData.motivo_rechazo = motivo.trim();
    }

    const { data, error } = await supabase
      .from('solicitud')
      .update(updateData)
      .eq('id', id_solicitud)
      .eq('estado', 'pendiente') // Solo actualizar si está pendiente
      .select()
      .single();

    if (error) {
      console.error('Error rechazando solicitud:', error);
      return { 
        success: false, 
        error: error.message || 'Error al rechazar la solicitud' 
      };
    }

    // TODO: Aquí podrías notificar al artista del rechazo

    return { 
      success: true, 
      data,
      message: 'Solicitud rechazada exitosamente'
    };
    }
    
  } catch (error: any) {
    console.error('Error en rechazarSolicitud:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
}

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
             Comuna(nombre_comuna) 
             `).eq('user_id', userId),
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


export async function getSolicitudesByPerfiles(perfilIds: string[]) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (perfilIds.length === 0) {
      return [];
    }

     // Convertir strings a UUID para PostgreSQL
    const perfilIdsUUID = perfilIds.map(id => id);

 
      const {data,error} = await supabaseAdmin
            .rpc('get_solicitudes_y_eventos',{
              perfil_ids:perfilIdsUUID
            });


    if (error) {
      console.error('Error obteniendo solicitudes y eventos:', error);
      throw new Error(`Error al obtener solicitudes y eventos: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

   const solicitudes: SolicitudRespuesta[] = data.map((item: any) => {
      if (item.origen_tabla === 'solicitud') {
        return {
          id: item.id,
          tipo: 'grupo' as const,
          titulo: item.titulo,
          creador: item.creador,
          fechaInicio: new Date(item.fecha_inicio),
          fechaFin: new Date(item.fecha_fin),
          plazoRespuesta: new Date(item.plazo_respuesta),
          estado: item.estado as 'pendiente' | 'aceptada' | 'rechazada' | 'expirada',
          
          // Campos directos
          id_perfil: item.id_perfil,
          id_banda: item.id_banda,
          tipo_invitacion: item.tipo_invitacion,
          descripcion: item.descripcion,
          created_at: item.created_at,
          nombre_artista: item.nombre_artista,
          nombre_banda: item.nombre_banda,
          
          esEvento: false,
          origen_tabla: 'solicitud'
        };
      } else {
        // Para eventos
        return {
          id: item.id,
          tipo: 'evento' as const,
          titulo: item.titulo,
          creador: item.creador,
          fechaInicio: new Date(item.fecha_inicio),
          fechaFin: new Date(item.fecha_fin),
          plazoRespuesta: new Date(item.plazo_respuesta),
          estado: item.estado as 'pendiente' | 'aceptada' | 'rechazada' | 'expirada',
          
          // Campos específicos de eventos
          id_perfil: item.id_perfil,
          id_evento: item.id_evento,
          tipo_evento: item.tipo_evento,
          lugar: item.lugar,
          direccion: item.direccion,
          flyer_url: item.flyer_url,
          confirmado: item.confirmado,
          descripcion: item.descripcion,
          created_at: item.created_at,
          nombre_artista: item.nombre_artista,
          
          esEvento: true,
          origen_tabla: 'participacion_evento',
          id_organizador: item.id_organizador,
          estado_evento: item.estado_evento
        };
      }
    });

    return solicitudes;
  } catch (error: any) {
    console.error('Error en getSolicitudesByPerfiles:', error);
    throw error;
  }
}