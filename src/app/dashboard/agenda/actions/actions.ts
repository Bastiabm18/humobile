'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData,EventoActualizar, ProfileType, GeoData,ParticipanteEvento, Profile, BlockDateRangeParams, evento, CalendarEvent, eventoCompleto, categoriaEvento, EventoGuardar, EventoCalendario, IntegranteBandaEvento } from '@/types/profile'; 
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';


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

  // 1. Validar que no existan eventos/bloqueos en el mismo rango para este creador
  const { data: eventosExistentes, error: errorConsulta } = await supabase
    .from('evento')
    .select('id, titulo, fecha_hora_ini, fecha_hora_fin')
    .eq('id_creador', creator_profile_id)
    .or(`and(fecha_hora_ini.lt.${fecha_hora_fin.toISOString()},fecha_hora_fin.gt.${fecha_hora_ini.toISOString()})`);

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

  // 2. Insertar el bloqueo en la tabla evento
  const { data: eventoInsertado, error } = await supabase
    .from('evento')
    .insert({
      titulo: title.trim(),
      descripcion: reason.trim(),
      fecha_hora_ini,
      fecha_hora_fin,
      id_creador: creator_profile_id,
      creador_tipo_perfil: creator_type,
      es_bloqueo: true,
      motivo_bloqueo: reason.trim(),
      es_publico: false,  
    })
    .select()
    .single();

  if (error) {
    console.error('Error al crear bloqueo:', error);
    return { success: false, error: error.message };
  }

  // 3. Insertar participación del creador como confirmado
  const { error: errorParticipacion } = await supabase
    .from('participacion_evento')
    .insert({
      evento_id: eventoInsertado.id,
      perfil_id: creator_profile_id,
      estado: 'confirmado'
    });

  if (errorParticipacion) {
    console.error('Error al crear participación:', errorParticipacion);

    // Rollback: eliminar el evento si falla la participación
    await supabase
      .from('evento')
      .delete()
      .eq('id', eventoInsertado.id);

    return { success: false, error: errorParticipacion.message };
  }

  // revalidatePath('/dashboard/agenda');  ← descomenta si lo necesitas

  return { success: true, eventoInsertado };
}
export async function eliminarBloqueo(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verificar que existe y es bloqueo (opcional pero recomendado)
    const { data, error: checkError } = await supabaseAdmin
      .from('evento')
      .select('id, es_bloqueo')
      .eq('id', eventId)
      .eq('es_bloqueo', true)
      .single();

    if (checkError || !data) {
      console.error('Error verificando bloqueo:', checkError);
      return { success: false, error: 'El bloqueo no existe o no es válido' };
    }

    // 2. Eliminar de participacion_evento (primero, para no violar FK si hay)
    const { error: participacionError } = await supabaseAdmin
      .from('participacion_evento')
      .delete()
      .eq('evento_id', eventId);

    if (participacionError) {
      console.error('Error eliminando participaciones:', participacionError);
      return { success: false, error: participacionError.message };
    }

    // 3. Eliminar el bloqueo de la tabla evento
    const { error: deleteError } = await supabaseAdmin
      .from('evento')
      .delete()
      .eq('id', eventId);

    if (deleteError) {
      console.error('Error eliminando bloqueo:', deleteError);
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error en eliminarBloqueo:', error);
    return { success: false, error: error.message || 'Error desconocido' };
  }
}


export async function getEventosByPerfilParticipacion(
  profileId: string,
  estadoParticipacion?: string, // 'confirmado' | 'pendiente' | 'rechazado' | undefined = todos
  fechaDesde?: Date,
  fechaHasta?: Date
): Promise<EventoCalendario[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const params: any = {
      p_id_perfil: profileId,
    };

    if (estadoParticipacion) {
      params.p_estado = estadoParticipacion;
    }

    if (fechaDesde) {
      params.p_fecha_desde = fechaDesde.toISOString();
    }

    if (fechaHasta) {
      params.p_fecha_hasta = fechaHasta.toISOString();
    }

    const { data: eventosDB, error } = await supabaseAdmin
      .rpc('get_eventos_perfil_estados', params);

    if (error) {
      console.error(' Error al llamar a get_eventos_perfil_estados:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }

    if (!eventosDB || eventosDB.length === 0) {
      return [];
    }

    // Opcional: log para depuración
    // console.log('📊 Primer evento recibido:', Object.keys(eventosDB[0]));

    const eventosMapeados: EventoCalendario[] = eventosDB.map((evento: any) => {
      // Participantes ya vienen en el formato que necesitamos
      const participantes: IntegranteBandaEvento[] = evento.participantes || [];

      // Convertimos lat/lon a string (como espera tu interfaz)
      const latStr = evento.lat_lugar != null ? String(evento.lat_lugar) : '';
      const lonStr = evento.lon_lugar != null ? String(evento.lon_lugar) : '';

      return {
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion || '',
        inicio: new Date(evento.inicio),
        fin: evento.fin ? new Date(evento.fin) : new Date(evento.inicio), // fallback si no hay fin
        id_categoria: evento.id_categoria || '',
        nombre_categoria: evento.nombre_categoria || '',
        flyer_url: evento.flyer_url,
        video_url: evento.video_url,

        id_creador: evento.id_creador,
        nombre_creador: evento.nombre_creador || 'Desconocido',
        tipo_perfil_creador: evento.tipo_perfil_creador || '',

        id_lugar: evento.id_lugar || '',
        nombre_lugar: evento.nombre_lugar || '',
        direccion_lugar: evento.direccion_lugar || '',
        lat_lugar: latStr,
        lon_lugar: lonStr,

        id_productor: evento.id_productor,
        nombre_productor: evento.nombre_productor,

        tickets_evento: evento.tickets_evento || '',
        es_publico: evento.es_publico ?? true,
        es_bloqueo: evento.es_bloqueo ?? false,
        motivo_bloqueo: evento.motivo_bloqueo,

        created_at: new Date(evento.created_at),
        updated_at: new Date(evento.updated_at),

        // Participantes ya vienen en el formato correcto
        participantes,
      };
    });

    return eventosMapeados;
  } catch (error: any) {
    console.error('Error en getEventosByPerfilParticipacion:', error);
    throw error;
  }
}

export async function getEventsByProfile(profileId: string, estadoEvento:string ): Promise<CalendarEvent[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Consulta eventos del perfil creador
    const { data:eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_calendario',{
        p_id_perfil: profileId,
         p_estado_filtro: estadoEvento
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
          tipo: evento.creator_type || '',
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
          _datos_originales: evento,
        
          
        }
      };
    });

  

    return calendarEvents;
    
    
  } catch (error: any) {
    console.error('Error en getEventsByProfile:', error);
    throw error;
  }
}
export async function getEventoById(idEvento: string): Promise<EventoCalendario | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .rpc('obtener_evento_completo', {
      p_evento_id: idEvento
    })
    .single();

  if (error || !data) {
    console.error('Error al obtener evento:', error);
    return null;
  }

  

  return data as EventoCalendario;
}
export async function getEventoByIdV2(idEvento: string): Promise<EventoCalendario | null> {
  const supabase = getSupabaseAdmin(); // o el cliente que uses

  const { data, error } = await supabase
    .rpc('get_evento_calendario_por_perfil', {
      p_id_evento: idEvento,
      // p_id_perfil: currentUserProfileId,  ← opcional si quieres usarlo después
    })
    .single();

  if (error) {
    console.error('Error al obtener evento:', error);
    return null;
  }

  return data as EventoCalendario;
}

export async function getEventsByDiaYPerfilId(
  fecha: Date, 
  perfilId: string
): Promise<EventoCalendario[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Formatear fecha a YYYY-MM-DD
    const fechaStr = format(fecha, 'yyyy-MM-dd');

    const { data: eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_por_dia', {
        p_fecha: fechaStr,
        p_perfil_id: perfilId
      });

    if (error) {
      console.error('Error en obtener_eventos_por_dia:', error);
      throw new Error(`Error al obtener eventos del día: ${error.message}`);
    }

    if (!eventosDB || eventosDB.length === 0) {
      return [];
    }

    

    return eventosDB;
  } catch (error: any) {
    console.error('Error en getEventsByDiaYPerfilId:', error);
    throw error;
  }
}


export async function deleteEvent(eventId: string, perfilId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Primero verificar que el perfil es el creador del evento
    //cambiar a evento
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('evento')
      .select('id_creador')
      .eq('id', eventId)
      .single();
    
    if (eventoError) {
      console.error('Error obteniendo evento:', eventoError);
      return { 
        success: false, 
        error: 'Evento no encontrado' 
      };
    }
    
    if (!evento || evento.id_creador !== perfilId) {
      return { 
        success: false, 
        error: 'No tienes permisos para eliminar este evento. Solo el creador puede eliminarlo.' 
      };
    }
    
    // 2. Eliminar las participaciones primero
    const { error: deleteParticipacionesError } = await supabaseAdmin
      .from('participacion_evento')
      .delete()
      .eq('evento_id', eventId);
    
    if (deleteParticipacionesError) {
      console.error('Error eliminando participaciones:', deleteParticipacionesError);
      // Podemos continuar o lanzar error según tu política
    }

     // eliminar solicitudes para el evento 
      const { error: deleteSolicitudError } = await supabaseAdmin
      .from('solicitud')
      .delete()
      .eq('id_evento_solicitud', eventId);
    
    if (deleteSolicitudError) {
      console.error('Error eliminando evento:', deleteSolicitudError);
      return { 
        success: false, 
        error: `Error al eliminar el evento: ${deleteSolicitudError.message}` 
      };
    }
    
    // 3. Eliminar el evento
    const { error: deleteEventError } = await supabaseAdmin
      .from('evento')
      .delete()
      .eq('id', eventId);
    
    if (deleteEventError) {
      console.error('Error eliminando evento:', deleteEventError);
      return { 
        success: false, 
        error: `Error al eliminar el evento: ${deleteEventError.message}` 
      };
    }

   
    
    return { 
      success: true,
   
    };
    
  } catch (error: any) {
    console.error('Error en deleteEvent:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al eliminar el evento' 
    };
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

/** 
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

   // 2. El creador siempre participa (y no necesita solicitud)
    await crearParticipacionEvento(evento.id, eventData.creator_profile_id, 'confirmado');

      // 3. Procesar según tipo de creador
    switch (eventData.creator_type) {
      case 'band':
        await procesarEventoBanda(evento.id, eventData);
        break;
        
      case 'place':
        await procesarEventoLocal(evento.id, eventData);
        break;
        
      case 'artist':
        await procesarEventoArtista(evento.id, eventData);
        break;
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
*/


/**
 * Crea una solicitud de invitación a evento
 */
async function crearSolicitudEvento(
  eventoId: string,
  creadorId: string,
  invitadoId: string,
  tipo: 'invitacion' | 'solicitud' = 'invitacion'
) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const tipoCodigo = tipo === 'invitacion' ? 'invitacion_evento' : 'solicitud_evento';
  
  const { data, error } = await supabaseAdmin
    .from('solicitud')
    .insert([{
      tipo_solicitud_id: (await supabaseAdmin
        .from('tipo_solicitud')
        .select('id')
        .eq('codigo', tipoCodigo)
        .single()).data?.id,
      id_creador: creadorId,
      id_invitado: invitadoId,
      id_evento_solicitud: eventoId,
      fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    }])
    .select()
    .single();
    
  if (error) {
    console.error(`Error creando solicitud de evento para ${invitadoId}:`, error);
    return null;
  }
  
  console.log(`✅ Solicitud creada para ${invitadoId}`);
  return data;
}

async function crearParticipacionEvento(
  eventoId: string,
  perfilId: string,
  estado: 'pendiente' | 'confirmado' | 'rechazado' = 'pendiente'
) {
  const supabaseAdmin = getSupabaseAdmin();
  
  const { error } = await supabaseAdmin
    .from('participacion_evento')
    .insert([{
      evento_id: eventoId,
      perfil_id: perfilId,
      estado: estado
    }]);
    
  if (error) {
    console.error(`Error creando participación para ${perfilId}:`, error);
    return false;
  }
  
  console.log(`✅ Participación creada para ${perfilId}`);
  return true;
}

/**
 * Procesa evento creado por una BANDA
 */
async function procesarEventoBanda(eventoId: string, id_creador: string, id_participante:string, tipo_perfil_participante:string) {
  console.log(' Procesando evento de banda');
  


    // Si es banda, también invitar a sus integrantes
 
   
  
  
  // Si tiene local asignado
  if (tipo_perfil_participante === 'lugar') {
    await crearParticipacionEvento(eventoId, id_participante, 'pendiente');
    await crearSolicitudEvento(eventoId, id_creador, id_participante, 'invitacion');
  }
  // si tiene artistas
  if (tipo_perfil_participante === 'artist') {
    await crearParticipacionEvento(eventoId, id_participante, 'pendiente');
    await crearSolicitudEvento(eventoId, id_creador, id_participante, 'invitacion');
  }
}

/**
 * Procesa evento creado por un LOCAL
 */
async function procesarEventoLocal(eventoId: string,id_creador:string, id_participante:string, tipo_perfil_participante:string) {
  console.log('🏠 Procesando evento de local');
  


  
  const esBanda = tipo_perfil_participante === 'banda';
  
  // Artista/Banda invitada
  await crearParticipacionEvento(eventoId, id_participante, 'pendiente');
  await crearSolicitudEvento(eventoId, id_creador, id_participante, 'invitacion');
  
  // Si es banda, también invitar a sus integrantes
  if (esBanda) {
    const { data: integrantes } = await getSupabaseAdmin()
      .from('integrante')
      .select('id_artista')
      .eq('id_banda', id_participante)
      .eq('estado', 'activo');
    
    if (integrantes) {
      for (const integrante of integrantes) {
        await crearParticipacionEvento(eventoId, integrante.id_artista, 'pendiente');
        await crearSolicitudEvento(eventoId, id_creador, integrante.id_artista, 'invitacion');
      }
    }
  }
}

/**
 * Procesa evento creado por un ARTISTA
 */
async function procesarEventoArtista(eventoId: string,id_creador:string, id_participante:string, tipo_perfil_participante:string) {
  console.log('🎤 Procesando evento de artista');
  
  // Si tiene local asignado
  if (tipo_perfil_participante === 'lugar') {
    await crearParticipacionEvento(eventoId, id_participante, 'pendiente');
    await crearSolicitudEvento(eventoId, id_creador, id_participante, 'invitacion');
  }

  if (tipo_perfil_participante === 'banda') {

    // invitamoos a la banda y luego los integrantes
    await crearParticipacionEvento(eventoId, id_participante, 'pendiente');
    await crearSolicitudEvento(eventoId, id_creador, id_participante, 'invitacion');
    //  también invitar a sus integrantes
    const { data: integrantes } = await getSupabaseAdmin()
      .from('integrante')
      .select('id_artista')
      .eq('id_banda', id_participante)
      .eq('estado', 'activo');

    if (integrantes) {
      for (const integrante of integrantes) {
        await crearParticipacionEvento(eventoId, integrante.id_artista, 'pendiente');
        await crearSolicitudEvento(eventoId, id_creador, integrante.id_artista, 'invitacion');
      }
    }
  }
  if (tipo_perfil_participante === 'artista') {
    await crearParticipacionEvento(eventoId, id_participante, 'pendiente');
    await crearSolicitudEvento(eventoId, id_creador, id_participante, 'invitacion');
  }

}


export async function crearEvento(eventData: EventoGuardar, participantes: ParticipanteEvento[]): Promise<{ success: boolean; evento?: evento; error?: string; message?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Validar campos obligatorios
    if (!eventData.titulo || !eventData.fecha_hora_ini) {
      return { 
        success: false, 
        error: 'Título y fecha de inicio son obligatorios' 
      };
    }

    // Convertir fechas
    const fechaInicio = typeof eventData.fecha_hora_ini === 'string' 
      ? new Date(eventData.fecha_hora_ini) 
      : eventData.fecha_hora_ini;
    
    const fechaFin = eventData.fecha_hora_fin 
      ? (typeof eventData.fecha_hora_fin === 'string' 
          ? new Date(eventData.fecha_hora_fin) 
          : eventData.fecha_hora_fin)
      : null;

    // Validar fecha fin posterior
    if (fechaFin && fechaFin <= fechaInicio) {
      return { 
        success: false, 
        error: 'La fecha de fin debe ser posterior a la fecha de inicio' 
      };
    }

    // Validar que no existan eventos en el mismo rango
    const { data: eventosExistentes, error: errorConsulta } = await supabaseAdmin
      .from('participacion_evento')
      .select(`
        evento_id,
        evento!inner(
          id,
          titulo,
          fecha_hora_ini,
          fecha_hora_fin
        )
      `)
      .eq('perfil_id', eventData.id_creador)
      .filter('evento.fecha_hora_ini', 'lt', fechaFin?.toISOString() || fechaInicio.toISOString())
      .filter('evento.fecha_hora_fin', 'gt', fechaInicio.toISOString());

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

    // Preparar datos para insertar
    const eventoParaInsertar = {
      titulo: eventData.titulo.trim(),
      descripcion: eventData.descripcion?.trim() || '',
      fecha_hora_ini: fechaInicio.toISOString(),
      fecha_hora_fin: fechaFin?.toISOString() || null,
      id_categoria: eventData.id_categoria || null,
      flyer_url: eventData.flyer_url?.trim() || null,
      video_url: eventData.video_url?.trim() || null,
      id_creador: eventData.id_creador,
      creador_tipo_perfil: eventData.creador_tipo_perfil,
      id_lugar: eventData.id_lugar || null,
      nombre_lugar: eventData.nombre_lugar?.trim() || null,
      direccion_lugar: eventData.direccion_lugar?.trim() || null,
      lat_lugar: eventData.lat_lugar || null,
      lon_lugar: eventData.lon_lugar || null,
      id_productor: eventData.id_productor || null,
      tickets_evento: eventData.tickets_evento?.trim() || null,
      es_publico: eventData.es_publico !== undefined ? eventData.es_publico : true,
      es_bloqueo: eventData.es_bloqueado || false,
      motivo_bloqueo: eventData.motivo_bloqueo?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Creando evento con datos:', eventoParaInsertar);

    // Insertar el evento
    const { data: evento, error: eventoError } = await supabaseAdmin
      .from('evento')
      .insert([eventoParaInsertar])
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

 // PASO 1: Primero el creador (confirmado)
await crearParticipacionEvento(evento.id, eventData.id_creador, 'confirmado');

// PASO 2: Invitar a todos los participantes
for (const participante of participantes) {
  console.log(`🎯 Procesando: ${participante.id_perfil} (${participante.tipo})`);
  
  // Saltar si es el creador (ya lo procesamos)
  if (participante.id_perfil === eventData.id_creador) continue;
  
  await crearParticipacionEvento(evento.id, participante.id_perfil, 'pendiente');
  await crearSolicitudEvento(evento.id, eventData.id_creador, participante.id_perfil, 'invitacion');
  
  // Si el participante es una banda, invitar a sus integrantes
  if (participante.tipo === 'banda') {
    console.log(`👥 Invitando integrantes de la banda participante: ${participante.id_perfil}`);
    await invitarIntegrantesBanda(evento.id, eventData.id_creador, participante.id_perfil);
  }
}

// PASO 3: Si el CREADOR es banda, invitar también a sus integrantes
if (eventData.creador_tipo_perfil === 'banda') {
  console.log(`🎸 Creador es banda, invitando integrantes...`);
  await invitarIntegrantesBanda(evento.id, eventData.id_creador, eventData.id_creador);
}
    
    return { 
      success: true, 
      evento,
      message: 'Evento creado exitosamente' 
    };
    
  } catch (error: any) {
    console.error('Error en crearEvento:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
}


async function invitarParticipanteEvento(
  eventoId: string,
  creadorId: string,
  creadorTipo: string,
  participanteId: string,
  participanteTipo: string
) {
  console.log(`📨 Invitando participante: ${participanteId} (${participanteTipo})`);
  
  // 1. Si es el creador mismo, solo crear participación (sin solicitud)
  if (participanteId === creadorId) {
    console.log(`👤 Creador ${creadorId} - solo participación confirmada`);
    await crearParticipacionEvento(eventoId, participanteId, 'confirmado');
    return;
  }
  
  // 2. Para cualquier otro participante: participación + solicitud
  await crearParticipacionEvento(eventoId, participanteId, 'pendiente');
  await crearSolicitudEvento(eventoId, creadorId, participanteId, 'invitacion');
  
  // 3. Si el participante es una banda, invitar también a sus integrantes
  if (participanteTipo === 'banda') {
    console.log(`👥 Invitando integrantes de la banda: ${participanteId}`);
    await invitarIntegrantesBanda(eventoId, creadorId, participanteId);
  }
  
  // 4. Si el CREADOR es una banda, invitar también a sus propios integrantes
  // (solo la primera vez que se procesa el creador)
  if (creadorTipo === 'banda' && participanteId === creadorId) {
    console.log(`👥 Invitando integrantes de la banda creadora: ${creadorId}`);
    await invitarIntegrantesBanda(eventoId, creadorId, creadorId);
  }
}

async function invitarIntegrantesBanda(
  eventoId: string, 
  creadorId: string, 
  bandaId: string
) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log(`🔍 Buscando integrantes de la banda ${bandaId}`);
    
    // Consulta SIMPLE: solo IDs de integrantes
    const { data: integrantes, error: errorIntegrantes } = await supabaseAdmin
      .from('integrante')
      .select('id_artista')
      .eq('id_banda', bandaId)
      .eq('estado', 'activo');

    if (errorIntegrantes) {
      console.error('Error al obtener integrantes:', errorIntegrantes);
      return;
    }

    if (!integrantes || integrantes.length === 0) {
      console.log(`ℹ️ La banda ${bandaId} no tiene integrantes registrados`);
      return;
    }

    console.log(`✅ Encontrados ${integrantes.length} integrantes para la banda ${bandaId}`);

    // Invitar a cada integrante (ASUMIMOS que son artistas)
    for (const integrante of integrantes) {
      const artistaId = integrante.id_artista;
      
      // Evitar duplicados con el creador
      if (artistaId === creadorId) {
        console.log(`ℹ️ El creador ${creadorId} también es integrante, omitiendo`);
        continue;
      }
      
      console.log(`📨 Invitando artista integrante: ${artistaId}`);
      
      // Crear participación y solicitud para el artista
      await crearParticipacionEvento(eventoId, artistaId, 'pendiente');
      await crearSolicitudEvento(eventoId, creadorId, artistaId, 'invitacion');
    }
    
    console.log(`🎉 Todos los integrantes de la banda ${bandaId} han sido invitados`);
    
  } catch (error) {
    console.error('Error en invitarIntegrantesBanda:', error);
  }
}

export const getLugaresVisibles = async (): Promise<Profile[]> => {

  const supabaseAdmin = getSupabaseAdmin();
  const { data: lugares, error:errorLugares } = await supabaseAdmin
    .from('perfil')
    .select(`
      *, 
      id_perfil, 
      "creado_en",
      Pais(nombre_pais),     
      Region(nombre_region), 
      Comuna(nombre_comuna) 
    `)
    .eq('tipo_perfil', 'lugar')
    .eq('perfil_visible', true);

    if(errorLugares){
      console.error("Error fetching visible places:", errorLugares);
      throw new Error(`Fallo al obtener lugares visibles: ${errorLugares.message}`);
    }
      const perfilesLugares: Profile[] = (lugares || []).map(p => ({
    id: p.id_perfil, 
    tipo: 'lugar',
    nombre: p.nombre,
    email: p.email,
    imagen_url: p.imagen_url,
    video_url: p.video_url,
    created_at: p.creado_en,
    region_id: p.Region?.nombre_region,
    pais_id: p.Pais?.nombre_pais,
    ciudad_id: p.Comuna?.nombre_comuna,
   
  }));
  return perfilesLugares;
  
}
export const getArtistasVisibles = async (): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // SOLO ProfileArtist con perfil_visible = true
  const { data:artistas, error:errorArtistas } = await supabaseAdmin
    .from('perfil')
    .select(`
      *, 
      id_perfil, 
      "creado_en",
      Pais(nombre_pais),     
      Region(nombre_region), 
      Comuna(nombre_comuna) 
    `)
    .in('tipo_perfil', [
      'artista',
      'banda'
    ])
    .eq('perfil_visible', true);

  // Manejo de errores
  if (errorArtistas ) {
    console.error("Error fetching visible profiles:", errorArtistas );
    throw new Error(`Fallo al obtener perfiles visibles: ${(errorArtistas )?.message}`);
  }
   const perfilesVisibles: Profile[] = (artistas || []).map(p => ({
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
export const getCategoriasVisibles = async (): Promise<categoriaEvento[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // SOLO ProfileArtist con perfil_visible = true
  const { data:categoria, error:errorCategoria } = await supabaseAdmin
    .from('categoria_evento')
    .select(`
      * 
    `)
    .eq('estado', 'activo');

  // Manejo de errores
  if (errorCategoria ) {
    console.error("Error fetching visible profiles:", errorCategoria );
    throw new Error(`Fallo al obtener perfiles visibles: ${(errorCategoria )?.message}`);
  }
   const categoriasVisibles: categoriaEvento[] = (categoria || []).map(p => ({
    id_categoria: p.id,
    nombre_categoria: p.nombre,
    descripcion_categoria: p.descripcion,
    estado: p.visible,
   
  }));
  return categoriasVisibles;
  
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
    };
  });

  return allProfiles;
};


export async function updateEvento(data: EventoActualizar) {
  const supabase = getSupabaseAdmin();

  try {
    // 1. Obtener datos actuales del evento (incluyendo fechas para comparar)
    const { data: eventoActual, error: fetchError } = await supabase
      .from('evento')
      .select('id, id_creador, creador_tipo_perfil, fecha_hora_ini, fecha_hora_fin')
      .eq('id', data.id)
      .single();

    if (fetchError || !eventoActual) {
      return { success: false, error: 'Evento no encontrado o sin permisos' };
    }

    const idCreador = eventoActual.id_creador;
    const tipoCreador = eventoActual.creador_tipo_perfil;

    // 2. Obtener participantes actuales (para saber qué eliminar/agregar)
    const { data: participacionesActuales, error: partsError } = await supabase
      .from('participacion_evento')
      .select('perfil_id, estado')
      .eq('evento_id', data.id);

    if (partsError) {
      console.error('Error al obtener participantes actuales:', partsError);
      return { success: false, error: 'Error al leer participantes actuales' };
    }

    // Mapa: id_perfil → estado actual (para conservar estados existentes)
    const actualesMap = new Map(
      (participacionesActuales || []).map(p => [p.perfil_id, p.estado])
    );

    // Set de IDs actuales
    const idsActuales = new Set(actualesMap.keys());

    // 3. Preparar nuevas fechas
    const fechaIniNueva = new Date(data.fecha_hora_ini);
    const fechaFinNueva = data.fecha_hora_fin ? new Date(data.fecha_hora_fin) : null;

    if (fechaFinNueva && fechaIniNueva >= fechaFinNueva) {
      return { success: false, error: 'La fecha/hora de inicio debe ser anterior a la de fin' };
    }

    // Comparar si las fechas/horas cambiaron realmente
    const fechaIniActual = new Date(eventoActual.fecha_hora_ini);
    const fechaFinActual = eventoActual.fecha_hora_fin ? new Date(eventoActual.fecha_hora_fin) : null;

    const fechasCambiaron =
      fechaIniNueva.getTime() !== fechaIniActual.getTime() ||
      (fechaFinNueva?.getTime() ?? null) !== (fechaFinActual?.getTime() ?? null);

    // 4. Validar conflicto SOLO si cambiaron las fechas
    if (fechasCambiaron) {
      const { data: conflictos, error: conflictoError } = await supabase
        .from('participacion_evento')
        .select(`
          evento_id,
          evento!inner (
            id,
            fecha_hora_ini,
            fecha_hora_fin
          )
        `)
        .eq('perfil_id', idCreador)
        .neq('evento_id', data.id) // Excluimos el evento actual
        .or(
          `and(evento.fecha_hora_ini.lt.${fechaFinNueva?.toISOString() || fechaIniNueva.toISOString()},` +
          `evento.fecha_hora_fin.gt.${fechaIniNueva.toISOString()})`
        );

      if (conflictoError) {
        console.error('Error verificando conflictos:', conflictoError);
        return { success: false, error: 'Error al verificar disponibilidad de fechas' };
      }

      if (conflictos?.length > 0) {
        return { success: false, error: 'Conflicto de fechas con otros eventos del creador' };
      }
    }

    // 5. Actualizar campos principales del evento
    const { error: updateError } = await supabase
      .from('evento')
      .update({
        titulo: data.titulo.trim(),
        descripcion: data.descripcion?.trim() ?? null,
        fecha_hora_ini: fechaIniNueva.toISOString(),
        fecha_hora_fin: fechaFinNueva?.toISOString() ?? null,
        id_categoria: data.id_categoria ?? null,
        flyer_url: data.flyer_url?.trim() ?? null,
        video_url: data.video_url?.trim() ?? null,
        tickets_evento: data.tickets_evento?.trim() ?? null,
        es_publico: data.es_publico,
        id_lugar: data.id_lugar ?? null,
        nombre_lugar: data.nombre_lugar?.trim() ?? null,
        direccion_lugar: data.direccion_lugar?.trim() ?? null,
        lat_lugar: data.lat_lugar ?? null,
        lon_lugar: data.lon_lugar ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error actualizando evento:', updateError);
      return { success: false, error: updateError.message };
    }

    // 6. Manejo preciso de participantes (diff)

    // IDs deseados (del frontend)
    const idsDeseados = new Set(data.participantes.map(p => p.id_perfil));
    idsDeseados.add(idCreador); // el creador SIEMPRE debe quedar

    // A. Eliminados: estaban antes pero ya no están
    const eliminados = [...idsActuales].filter(id => !idsDeseados.has(id));

    if (eliminados.length > 0) {
      const { error: deleteError } = await supabase
        .from('participacion_evento')
        .delete()
        .eq('evento_id', data.id)
        .in('perfil_id', eliminados);

      if (deleteError) {
        console.error('Error eliminando participantes quitados:', deleteError);
        // No bloqueamos la actualización, pero logueamos
      }
    }

    // B. Nuevos: están deseados pero no estaban antes
    const nuevos = data.participantes.filter(p => !idsActuales.has(p.id_perfil));

    for (const nuevo of nuevos) {
      await crearParticipacionEvento(data.id, nuevo.id_perfil, 'pendiente');
      await crearSolicitudEvento(data.id, idCreador, nuevo.id_perfil, 'invitacion');
    }

    // C. Existentes: no tocamos nada (mantienen su estado anterior)

    // 7. Asegurar que el creador esté confirmado (seguridad extra)
    const estadoCreadorActual = actualesMap.get(idCreador);
    if (estadoCreadorActual !== 'confirmado') {
      await supabase
        .from('participacion_evento')
        .upsert(
          { evento_id: data.id, perfil_id: idCreador, estado: 'confirmado' },
          { onConflict: 'evento_id, perfil_id' }
        );
    }

    revalidatePath('/dashboard/agenda');

    return { success: true, message: 'Evento actualizado correctamente' };
  } catch (err: any) {
    console.error('[updateEvento] Error crítico:', err);
    return { success: false, error: err.message || 'Error inesperado al actualizar' };
  }
}

export async function updateEvent(eventData: any) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Validar campos obligatorios
    if (!eventData.id) {
      return { 
        success: false, 
        error: 'ID del evento es requerido' 
      };
    }

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

    // Verificar que no existan conflictos de fecha con otros eventos del mismo creador
    const { data: eventosExistentes, error: errorConsulta } = await supabaseAdmin
      .from('participacion_evento')
      .select(`
        evento_id,
        evento!inner(
          id,
          title,
          fecha_hora_ini,
          fecha_hora_fin
        )
      `)
      .eq('perfil_id', eventData.creator_profile_id)
      .neq('evento_id', eventData.id) // Excluir el evento actual
      .filter('events.fecha_hora_ini', 'lt', eventData.fecha_hora_fin.toISOString())
      .filter('events.fecha_hora_fin', 'gt', eventData.fecha_hora_ini.toISOString());
          
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

    // Verificar si place_profile_id es válido (solo si no es null/empty)
    let validPlaceProfileId = null;
    if (eventData.place_profile_id) {
      try {
        const { data: placeProfile, error: placeError } = await supabaseAdmin
          .from('ProfilePlace')
          .select('id')
          .eq('id', eventData.place_profile_id)
          .single();

        if (placeError) {
          console.log('place_profile_id no encontrado en ProfilePlace, usando null');
          validPlaceProfileId = null;
        } else {
          validPlaceProfileId = eventData.place_profile_id;
        }
      } catch (error) {
        console.error('Error validando place_profile_id:', error);
        validPlaceProfileId = null;
      }
    }

    // Obtener el evento actual para comparar cambios
    const { data: eventoActual, error: errorEventoActual } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventData.id)
      .single();

    if (errorEventoActual) {
      console.error('Error obteniendo evento actual:', errorEventoActual);
      return { 
        success: false, 
        error: 'No se pudo obtener el evento actual' 
      };
    }

    // Preparar datos para actualizar
    const updateData = {
      title: eventData.title.trim(),
      id_artista: eventData.id_artista || null,
      id_tipo_artista: eventData.id_tipo_artista || null,
      nombre_artista: eventData.nombre_artista?.trim() || '',
      description: eventData.description?.trim() || null,
      fecha_hora_ini: eventData.fecha_hora_ini.toISOString(),
      fecha_hora_fin: eventData.fecha_hora_fin.toISOString(),
      place_profile_id: validPlaceProfileId,
      custom_place_name: eventData.custom_place_name?.trim() || null,
      address: eventData.address?.trim() || null,
      organizer_name: eventData.organizer_name?.trim() || null,
      organizer_contact: eventData.organizer_contact?.trim() || null,
      ticket_link: eventData.ticket_link?.trim() || null,
      instagram_link: eventData.instagram_link?.trim() || null,
      flyer_url: eventData.flyer_url?.trim() || null,
      category: eventData.category || 'show',
      updated_at: new Date().toISOString(),
    };

    console.log('Actualizando evento ID:', eventData.id);
    console.log('Datos a actualizar:', updateData);

    // 1. Actualizar el evento principal
    const { data: updatedEvent, error: updateError } = await supabaseAdmin
      .from('events')
      .update(updateData)
      .eq('id', eventData.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando evento en Supabase:', updateError);
      return { 
        success: false, 
        error: updateError.message || 'Error desconocido al actualizar el evento' 
      };
    }

    // 2. Manejar actualizaciones en participacion_evento
    await manejarActualizacionParticipaciones(supabaseAdmin, eventData, eventoActual);

    return { 
      success: true, 
      evento: updatedEvent,
      message: 'Evento actualizado exitosamente' 
    };
    
  } catch (error: any) {
    console.error('Error en updateEvent:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
}

// Función auxiliar para manejar las actualizaciones en participacion_evento
async function manejarActualizacionParticipaciones(supabaseAdmin: any, eventData: any, eventoActual: any) {
  try {
    console.log('Manejando actualizaciones de participaciones...');

    // Caso 1: LOCAL actualiza artista/banda
    if (eventData.creator_type === 'place') {
      await manejarLocalActualizaArtista(supabaseAdmin, eventData, eventoActual);
    }
    
    // Caso 2: ARTISTA actualiza lugar
    else if (eventData.creator_type === 'artist') {
      await manejarArtistaActualizaLugar(supabaseAdmin, eventData, eventoActual);
    }
    
    // Caso 3: BANDA - mantener la participación del creador
    else if (eventData.creator_type === 'band') {
      // La banda creadora siempre debe estar como participante
      await asegurarParticipacionCreador(supabaseAdmin, eventData);
    }

  } catch (error) {
    console.error('Error en manejarActualizacionParticipaciones:', error);
    // No lanzamos el error para no afectar la actualización principal
  }
}

async function manejarLocalActualizaArtista(supabaseAdmin: any, eventData: any, eventoActual: any) {
  console.log('Local actualizando artista...');
  
  // Eliminar participaciones anteriores de artistas (si existen)
  const { error: deleteError } = await supabaseAdmin
    .from('participacion_evento')
    .delete()
    .eq('evento_id', eventData.id)
    .neq('perfil_id', eventData.creator_profile_id); // Mantener al creador

  if (deleteError) {
    console.error('Error eliminando participaciones anteriores:', deleteError);
  }

  // Si hay nuevo artista, agregarlo
  if (eventData.id_artista) {
    console.log(`Agregando nuevo artista ${eventData.nombre_artista} (${eventData.id_artista})`);
    
    await supabaseAdmin
      .from('participacion_evento')
      .insert([{
        evento_id: eventData.id,
        perfil_id: eventData.id_artista,
        estado: 'pendiente'
      }]);

    // Si es banda, agregar también los integrantes
    if (eventData.id_tipo_artista === 'band') {
      const { data: integranteData } = await supabaseAdmin
        .from('integrante')
        .select('id_artista')
        .eq('id_banda', eventData.id_artista)
        .eq('estado', 'activo');

      if (integranteData && integranteData.length > 0) {
        console.log(`Agregando ${integranteData.length} integrantes`);
        
        const participaciones = integranteData.map((integrante: { id_artista: any; }) => ({
          evento_id: eventData.id,
          perfil_id: integrante.id_artista,
          estado: 'pendiente'
        }));

        await supabaseAdmin
          .from('participacion_evento')
          .insert(participaciones);
      }
    }
  }
}

async function manejarArtistaActualizaLugar(supabaseAdmin: any, eventData: any, eventoActual: any) {
  console.log('Artista actualizando lugar...');
  
  // Eliminar participaciones anteriores de lugares (si existen)
  const { data: participantesAnteriores } = await supabaseAdmin
    .from('participacion_evento')
    .select('perfil_id')
    .eq('evento_id', eventData.id);

  if (participantesAnteriores) {
    // Buscar participantes que son lugares (no el creador)
    for (const participante of participantesAnteriores) {
      if (participante.perfil_id !== eventData.creator_profile_id) {
        // Verificar si es un lugar
        const { data: perfil } = await supabaseAdmin
          .from('ProfilePlace')
          .select('id')
          .eq('id', participante.perfil_id)
          .single();

        if (perfil) {
          // Es un lugar, eliminarlo
          await supabaseAdmin
            .from('participacion_evento')
            .delete()
            .eq('evento_id', eventData.id)
            .eq('perfil_id', participante.perfil_id);
        }
      }
    }
  }

  // Agregar nuevo lugar si existe
  if (eventData.place_profile_id) {
    console.log(`Agregando nuevo lugar ${eventData.custom_place_name} (${eventData.place_profile_id})`);
    
    await supabaseAdmin
      .from('participacion_evento')
      .insert([{
        evento_id: eventData.id,
        perfil_id: eventData.place_profile_id,
        estado: 'pendiente'
      }]);
  }
}

async function asegurarParticipacionCreador(supabaseAdmin: any, eventData: any) {
  console.log('Asegurando participación del creador...');
  
  // Verificar si el creador ya está como participante
  const { data: participacionExistente } = await supabaseAdmin
    .from('participacion_evento')
    .select('id')
    .eq('evento_id', eventData.id)
    .eq('perfil_id', eventData.creator_profile_id)
    .single();

  if (!participacionExistente) {
    console.log('Agregando creador como participante');
    
    await supabaseAdmin
      .from('participacion_evento')
      .insert([{
        evento_id: eventData.id,
        perfil_id: eventData.creator_profile_id,
        estado: 'pendiente'
      }]);
  }
}
