'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, BlockDateRangeParams, evento, CalendarEvent } from '@/types/profile'; 
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
  //revalidatePath('/dashboard/agenda');

  return { success: true, data };
}

export async function createDateBlock({
  creator_profile_id,
  creator_type,
  title,
  reason,
  fecha_hora_ini,
  fecha_hora_fin,
}: {
  creator_profile_id: string;
  creator_type: string;
  title: string;
  reason: string;
  fecha_hora_ini: Date;
  fecha_hora_fin: Date;
}) {
  const supabase = getSupabaseAdmin();

  // Validar que no existan eventos en el mismo rango de fechas para el creador
const { data: eventosExistentes, error: errorConsulta } = await supabase
  .from('participacion_evento')
  .select(`
    evento_id,
    events!inner(
      id,
      title,
      fecha_hora_ini,
      fecha_hora_fin
    )
  `)
  .eq('perfil_id', creator_profile_id)  // Mismo perfil
  .filter('events.fecha_hora_ini', 'lt', fecha_hora_fin.toISOString())  // Inicio existente < Fin nuevo
  .filter('events.fecha_hora_fin', 'gt', fecha_hora_ini.toISOString());  // Fin existente > Inicio nuevo
          
        if (errorConsulta) {
          console.error('Error al verificar eventos existentes:', errorConsulta);
          return { 
            success: false, 
            error: 'Error al verificar disponibilidad de fechas' 
          };
        }

        if (eventosExistentes && eventosExistentes.length > 0) {
          return { 
            success: false, 
            error: 'Ya tienes eventos programados en ese rango de fechas. Por favor, selecciona otras fechas.' 
          };
        }


  const { data: eventoInsertado, error } = await supabase
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
      status: 'approved',
      organizer_name: 'Bloqueo Usuario', // <- Campo requerido
      organizer_contact: 'N/A',
      category: 'bloqueo',
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear bloqueo:', error);
    return { success: false, error: error.message };
  }


  
    // 2. Insertar el creador en participacion_evento usando el id del evento
  const { error: errorParticipacion } = await supabase
    .from('participacion_evento')
    .insert({
      evento_id: eventoInsertado.id, // Aquí usamos el id del evento insertado
      perfil_id: creator_profile_id,
      estado: 'confirmado'
    });

      if (errorParticipacion) {
    console.error('Error al crear participación:', errorParticipacion);
    
    // Opcional: Eliminar el evento si falla la participación
    await supabase
      .from('events')
      .delete()
      .eq('id', eventoInsertado.id);
    
    return { success: false, error: errorParticipacion.message };
  }

  

 // revalidatePath('/dashboard/agenda');
  return { success: true, eventoInsertado };
}

export async function eliminarBloqueo(eventId: string): Promise<{ success: boolean; error?: string }> {

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
       .from('events')
      .select('id, is_blocked')
      .eq('id', eventId)
      .eq('is_blocked', true)
      .single();


      
    if (error) {
      console.error('Error obteniendo evento:', error);
      throw new Error(`Error al obtener el evento: ${error.message}`);
    }

    if(!data){
      return { success: false, error: 'El evento no es un bloqueo o no existe' };
    }


    const { error: deleteError } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('is_blocked', true)

    if (deleteError) {
      console.error('Error eliminando bloqueo:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true};

  }catch (error){

    console.error('Error en eliminarBloqueo:', error);
    return { success: false, error: (error as Error).message };
  }

}

export async function getEventsByProfile(profileId: string, profileType: 'artist' | 'band' | 'place'): Promise<CalendarEvent[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Consulta eventos del perfil creador
    const { data:eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_calendario',{
        p_id_perfil: profileId,
      });
       if (error) {
      console.error('❌ Error en la función PostgreSQL:', error);
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


      // Verificar estructura del primer evento
    console.log('📊 Estructura del primer evento:', Object.keys(eventosDB[0]));
    console.log('📈 Estadísticas del primer evento:', {
      titulo: eventosDB[0].titulo,
      total_participantes: eventosDB[0].total_participantes,
      confirmados: eventosDB[0].confirmados,
      pendientes: eventosDB[0].pendientes,
      porcentaje_aprobacion: eventosDB[0].porcentaje_aprobacion
    });

  
  const calendarEvents: CalendarEvent[] = eventosDB.map((evento: any) => {
      const fechaIni = new Date(evento.fecha_hora_ini);
      const fechaFin = new Date(evento.fecha_hora_fin);
      
// Crear título con estadísticas si hay participantes
      const tituloConEstadisticas = evento.total_participantes > 0 
        ? `${evento.title} (${evento.confirmados}/${evento.total_participantes} ✓)`
        : evento.title;
      
       return {
        // Campos para react-big-calendar
        id: evento.id,
        title: tituloConEstadisticas,
        start: fechaIni,
        end: fechaFin,
        description: evento.description || '',
        category: evento.category || '',
        status: evento.status || '',
        
        // Todos los datos originales en resource
        resource: {
          // Mapear campos en español a inglés para tu interfaz
          creator_profile_id: evento.creator_profile_id,
          creator_type: evento.creator_type,
          fecha_hora_ini: fechaIni,
          fecha_hora_fin: fechaFin,
          place_profile_id: evento.place_profile_id || '',
          custom_place_name: evento.custom_place_name || '',
          address: evento.address || '',
          organizer_name: evento.organizer_name || '',
          organizer_contact: evento.organizer_contact || '',
          ticket_link: evento.ticket_link || '',
          instagram_link: evento.instagram_link || '',
          flyer_url: evento.flyer_url || '',
          category: evento.category || '',
          status: evento.status || '',
          created_at: evento.created_at,
          updated_at: evento.updated_at,
          is_blocked: evento.is_blocked || false,
          blocked_reason: evento.blocked_reason || '',
          
          // Estadísticas de participación
          total_participantes: evento.total_participantes || 0,
          pendientes: evento.pendientes || 0,
          confirmados: evento.confirmados || 0,
          rechazados: evento.rechazados || 0,
          porcentaje_aprobacion: evento.porcentaje_aprobacion || 0,
          
          // Campos adicionales de events
          id_artista: evento.id_artista || '',
          id_tipo_artista: evento.id_tipo_artista || '',
          nombre_artista: evento.nombre_artista || '',
          
          // Agregar campos originales para referencia
          _datos_originales: evento
        }
      };
    });

  

    return calendarEvents;
    
    
  } catch (error: any) {
    console.error('Error en getEventsByProfile:', error);
    throw error;
  }
}

/**
 * Obtiene eventos donde el perfil es el lugar (place_profile_id)
 */
export async function getEventsByPlaceProfile(placeProfileId: string): Promise<evento[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('place_profile_id', placeProfileId)
      .order('fecha_hora_ini', { ascending: true });

    if (error) {
      console.error('Error obteniendo eventos del lugar:', error);
      throw new Error(`Error al obtener eventos del lugar: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const events: evento[] = data.map(event => ({
          id: event.id,
          creator_profile_id: event.creator_profile_id,
          creator_type: event.creator_type,
          id_artista: event.id_artista,
          id_tipo_artista: event.id_tipo_artista,
          nombre_artista: event.nombre_artista,
          title: event.title,
          description: event.description,
          fecha_hora_ini: event.fecha_hora_ini,
          fecha_hora_fin: event.fecha_hora_fin,
          place_profile_id: event.place_profile_id,
          custom_place_name: event.custom_place_name,
          address: event.address,
          organizer_name:event.organizer_name,
          organizer_contact:event.organizer_contact,
          ticket_link:event.ticket_link,
          instagram_link:event.instagram_link,
          flyer_url:event.flyer_url,
          category:event.category,
          status: event.status,
          created_at:event.created_at,
          updated_at:event.updated_at,
          is_blocked: event.is_blocked,
          blocked_reason: event.blocked_reason,


    }));

    return events;
    
  } catch (error: any) {
    console.error('Error en getEventsByPlaceProfile:', error);
    throw error;
  }
}


export async function createEvent(eventData: evento) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Validar campos obligatorios
    if (!eventData.title || !eventData.fecha_hora_ini || !eventData.fecha_hora_fin) {
      return { 
        success: false, 
        error: 'Título, fecha de inicio y fecha de fin son obligatorios' 
      };
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (eventData.fecha_hora_fin <= eventData.fecha_hora_ini) {
      return { 
        success: false, 
        error: 'La fecha de fin debe ser posterior a la fecha de inicio' 
      };
    }

   // Validar que no existan eventos en el mismo rango de fechas para el creador
const { data: eventosExistentes, error: errorConsulta } = await supabaseAdmin
  .from('participacion_evento')
  .select(`
    evento_id,
    events!inner(
      id,
      title,
      fecha_hora_ini,
      fecha_hora_fin
    )
  `)
  .eq('perfil_id', eventData.creator_profile_id)  // Mismo perfil
  .filter('events.fecha_hora_ini', 'lt', eventData.fecha_hora_fin.toISOString())  // Inicio existente < Fin nuevo
  .filter('events.fecha_hora_fin', 'gt', eventData.fecha_hora_ini.toISOString());  // Fin existente > Inicio nuevo
          
        if (errorConsulta) {
          console.error('Error al verificar eventos existentes:', errorConsulta);
          return { 
            success: false, 
            error: 'Error al verificar disponibilidad de fechas' 
          };
        }

        if (eventosExistentes && eventosExistentes.length > 0) {
          return { 
            success: false, 
            error: 'Ya tienes eventos programados en ese rango de fechas. Por favor, selecciona otras fechas.' 
          };
        }

    // Preparar los datos para insertar
    const eventToInsert = {
      creator_profile_id: eventData.creator_profile_id,
      creator_type: eventData.creator_type,
      title: eventData.title.trim(),
      id_artista: eventData.id_artista,
      id_tipo_artista: eventData.id_tipo_artista,
      nombre_artista: eventData.nombre_artista.trim(),
      description: eventData.description?.trim() || '',
      fecha_hora_ini: eventData.fecha_hora_ini.toISOString(),
      fecha_hora_fin: eventData.fecha_hora_fin.toISOString(),
      place_profile_id: eventData.place_profile_id || null,
      custom_place_name: eventData.custom_place_name?.trim() || null,
      address: eventData.address?.trim() || null,
      organizer_name: eventData.organizer_name?.trim() || null,
      organizer_contact: eventData.organizer_contact?.trim() || null,
      ticket_link: eventData.ticket_link?.trim() || null,
      instagram_link: eventData.instagram_link?.trim() || null,
      flyer_url: eventData.flyer_url?.trim() || null,
      category: eventData.category || 'show', // Valor por defecto
      status: eventData.status || 'pending', // Valor por defecto
      is_blocked: eventData.is_blocked || false,
      blocked_reason: eventData.blocked_reason?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Creando evento con datos:', eventToInsert);

    // 1 Insertar el evento  en la base de datos
    const { data: evento , error: eventoError } = await supabaseAdmin
      .from('events') 
      .insert([eventToInsert])
      .select()
      .single();

    if (eventoError) {
      console.error('Error creando evento en Supabase:', eventoError);
      return { 
        success: false, 
        error: eventoError.message || 'Error desconocido al crear el evento' 
      };
    }

    console.log('Evento Id creado:', evento.id);

    // 2. Insertar el creador en participacion_evento
    await supabaseAdmin
      .from('participacion_evento')
      .insert([{
        evento_id: evento.id,
        perfil_id: eventData.creator_profile_id,
        estado: 'confirmado'
      }]);

          // 3. Si el creador es BANDA
          if (eventData.id_tipo_artista === 'band') {
            try {
              console.log('Creador es banda, agregando banda e integrantes como participantes');

              // 1. La banda como participante (estado pendiente)
              await supabaseAdmin
                .from('participacion_evento')
                .insert([{
                  evento_id: evento.id,
                  perfil_id: eventData.creator_profile_id, // ID de la banda
                  estado: 'pendiente'
                }]);
              
              // 2. Los integrantes que vienen en eventData
              const integrantesIds = eventData.integrantes || [];
              if (integrantesIds.length > 0) {
                console.log(`Agregando ${integrantesIds.length} integrantes a participacion_evento`);

                const participaciones = integrantesIds.map(id => ({
                  evento_id: evento.id,
                  perfil_id: id,
                  estado: 'pendiente'
                }));
              
                await supabaseAdmin
                  .from('participacion_evento')
                  .insert(participaciones);
              }
            } catch (error) {
              console.error('Error al agregar banda e integrantes como participantes:', error);
            }
          }

    // 4. Si es un LOCAL y agrega artista solista
    const artistaId = eventData.id_artista || '';
    if (artistaId && eventData.creator_type === 'place' && eventData.id_tipo_artista === 'artist') {
      console.log(`Agregando artista ${eventData.nombre_artista} a participacion_evento`);
      
      await supabaseAdmin
        .from('participacion_evento')
        .insert([{
          evento_id: evento.id,
          perfil_id: artistaId,
          estado: 'pendiente'
        }]);
    }

    // si es artista o local y agrega local del listado o personalizado
      const lugarId = eventData.place_profile_id || '';
      if (lugarId && (eventData.creator_type =='artist' || eventData.creator_type=='band')){
        console.log('agregando participante para lugar establecido en la pagina ')

       try {
        const {data, error} = await supabaseAdmin
          .from('participacion_evento')
            .insert([{
              evento_id: evento.id,
              perfil_id: lugarId,
              estado: 'pendiente'
            }]);
       } catch (error) {
         console.log('error ',error)
       }
        }


        // 5. Si es un LOCAL y agrega una BANDA
    const bandaId = eventData.id_artista || '';
if (bandaId && eventData.creator_type === 'place' && eventData.id_tipo_artista === 'band') {
  try {
    console.log('Local agregando banda e integrantes como participantes');
    
    // 1. La banda como participante
    await supabaseAdmin
      .from('participacion_evento')
      .insert([{
        evento_id: evento.id,
        perfil_id: bandaId, // ID de la banda invitada
        estado: 'pendiente'
      }]);
    
    // 2. Buscar integrantes de la banda
    const { data: integranteData, error: integranteError } = await supabaseAdmin
      .from('integrante')
      .select('id_artista')
      .eq('id_banda', bandaId)
      .eq('estado', 'activo');

    if (integranteError) {
      console.error('Error al obtener integrantes:', integranteError);
    } else if (integranteData && integranteData.length > 0) {
      console.log(`Encontrados ${integranteData.length} integrantes`);
      
      // 3. Los integrantes como participantes
      const participaciones = integranteData.map(integrante => ({
        evento_id: evento.id,
        perfil_id: integrante.id_artista,
        estado: 'pendiente'
      }));

      await supabaseAdmin
        .from('participacion_evento')
        .insert(participaciones);
    }
  } catch (error) {
    console.error('Error al agregar banda invitada:', error);
  }
}


    
    return { 
      success: true, 
      evento,
      message: 'Evento creado exitosamente' 
    };
    
  } catch (error: any) {
    console.error('Error en createEvent:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
}


export const getLugaresVisibles = async (): Promise<Profile[]> => {

  const supabaseAdmin = getSupabaseAdmin();
  const { data: lugares, error:errorLugares } = await supabaseAdmin
    .from('ProfilePlace')
    .select(`
      *, 
      id_profile, 
      "createdAt",
      Pais(nombre_pais),     
      Region(nombre_region), 
      Comuna(nombre_comuna) 
    `)
    .eq('perfil_visible', true);

    if(errorLugares){
      console.error("Error fetching visible places:", errorLugares);
      throw new Error(`Fallo al obtener lugares visibles: ${errorLugares.message}`);
    }
      const perfilesLugares: Profile[] = (lugares || []).map(p => ({
    id: p.id_profile, 
    type: 'place' as ProfileType,
    created_at: p.createdAt,
    data: {
      place_name: p.nombre_local,
      address: p.direccion,
      cityId: p.Comuna?.nombre_comuna,
      regionId: p.Region?.nombre_region,
      countryId: p.Pais?.nombre_pais,
      phone: p.telefono_local,
      place_type: p.tipo_establecimiento,
      lat: p.latitud,
      lng: p.longitud,
      photo_url: p.photo_url,
      video_url: p.photo_url,
      
    } as PlaceData,
  }));
  return perfilesLugares;
  
}
export const getArtistasVisibles = async (): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // SOLO ProfileArtist con perfil_visible = true
  const { data:artistas, error:errorArtistas } = await supabaseAdmin
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

   // Consulta para ProfileBand
  const { data: bandas, error: errorBandas } = await supabaseAdmin
    .from('ProfileBand')
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
  if (errorArtistas || errorBandas) {
    console.error("Error fetching visible profiles:", errorArtistas || errorBandas);
    throw new Error(`Fallo al obtener perfiles visibles: ${(errorArtistas || errorBandas)?.message}`);
  }
  // Mapeo de artistas
  const perfilesArtistas: Profile[] = (artistas || []).map(p => ({
    id: p.id_profile, 
    type: 'artist' as ProfileType,
    created_at: p.createdAt,
    data: {
      name: p.nombre_artistico, // Ajusta según el campo real en ProfileArtist
      phone: p.telefono_contacto,
      email: p.email,
      countryId: p.Pais?.nombre_pais,
      regionId: p.Region?.nombre_region,
      cityId: p.Comuna?.nombre_comuna,
      image_url: p.image_url,
      perfil_visible: p.perfil_visible,
      tipo_perfil: 'artist',

    } as ArtistData,
  }));

  // Mapeo de bandas (ajusta los nombres de campos según tu tabla ProfileBand)
  const perfilesBandas: Profile[] = (bandas || []).map(p => ({
    id: p.id_profile, 
    type: 'band' as ProfileType, // Asumiendo que tienes este tipo
    created_at: p.createdAt,
    data: {
      name: p.nombre_banda, // Ajusta al campo correcto en ProfileBand
      phone: p.telefono_contacto,
      email: p.email,
      countryId: p.Pais?.nombre_pais,
      regionId: p.Region?.nombre_region,
      cityId: p.Comuna?.nombre_comuna,
      image_url: p.image_url,
      perfil_visible: p.perfil_visible,
        tipo_perfil: 'band',
      
    } as ArtistData, // O crea un tipo BandData si es diferente
  }));

  // Combinar y ordenar
  const perfilesVisibles = [...perfilesArtistas, ...perfilesBandas];
  
  // Ordenar por nombre
  perfilesVisibles.sort((a, b) => {
    const nameA = 'name' in a.data ? a.data.name : 'band_name' in a.data ? a.data.band_name : a.data.place_name;
    const nameB = 'name' in b.data ? b.data.name : 'band_name' in b.data ? b.data.band_name : b.data.place_name;
    return nameA.localeCompare(nameB);
  });
  
  return perfilesVisibles;

};


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