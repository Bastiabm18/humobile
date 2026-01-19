'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, BlockDateRangeParams, SolicitudRespuesta, AceptarRechazarSolicitud, AceptarRechazarEvento, CalendarEvent, EventoCalendario, IntegranteBandaEvento } from '@/types/profile'; 
import { revalidatePath } from 'next/cache';


export async function getEventsByProfile(profileId: string, ProfileType:ProfileType, status: string): Promise<CalendarEvent[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    
    const { data: eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_perfil',{
        p_profile_id: profileId,
      });
    

    if (error) {
      console.error('Error obteniendo eventos:', error);
      throw new Error(`Error al obtener eventos: ${error.message}`);
    }

    if (!eventosDB || eventosDB.length === 0) {
      return [];
    }

    // 2. Aplicar filtro de status si es necesario
    let eventosFiltrados = eventosDB;
    if (status && status.trim() !== '') {
      eventosFiltrados = eventosDB.filter((evento: any) => evento.status === status);
    }
  const calendarEvents: CalendarEvent[] = eventosFiltrados.map((event: any) => {
      const fechaIni = new Date(event.fecha_hora_ini);
      const fechaFin = new Date(event.fecha_hora_fin);
      
      return {
        // Campos para react-big-calendar
        id: event.id,
        title: event.title,
        start: fechaIni,
        end: fechaFin,
        description: event.description,
        category: event.category,
        status: event.status,
        
        // Todos los datos originales en resource
        resource: {
          creator_profile_id: event.creator_profile_id,
          creator_type: event.creator_type,
          fecha_hora_ini: fechaIni,
          fecha_hora_fin: fechaFin,
          place_profile_id: event.place_profile_id || '',
          custom_place_name: event.custom_place_name || '',
          address: event.address || '',
          organizer_name: event.organizer_name || '',
          organizer_contact: event.organizer_contact || '',
          ticket_link: event.ticket_link || '',
          instagram_link: event.instagram_link || '',
          flyer_url: event.flyer_url || '',
          category: event.category,
          status: event.status,
          created_at: event.created_at,
          updated_at: event.updated_at,
          is_blocked: event.is_blocked,
          blocked_reason: event.blocked_reason || '',
        }
      };
    });

    return calendarEvents;
    
    
  } catch (error: any) {
    console.error('Error en getEventsByProfile:', error);
    throw error;
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


/**
export async function aceptarSolicitud ({ id_evento,id_perfil}: AceptarRechazarEvento){
   try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('events')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id_evento)
      .eq('status', 'pending') // Solo actualizar si está pendiente
      .select()
      .single();

    if (error) {
      console.error('Error aceptando solicitud:', error);
      return { 
        success: false, 
        error: error.message || 'Error al aceptar la solicitud' 
      };
    }

    return { 
      success: true, 
      data,
      message: 'Solicitud aceptada exitosamente'
    };
    
  } catch (error: any) {
    console.error('Error en aceptarSolicitud:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
  
  
}
   */
export async function rechazarSolicitud ({ id_evento,motivo,id_perfil}: AceptarRechazarEvento){
 try {
    const supabase = getSupabaseAdmin();
    
    const updateData: any = {
      status: 'rejected',
      updated_at: new Date().toISOString(),
      blocked_reason: motivo,
    };
    
    // Si hay motivo, guardarlo (podrías agregar un campo motivo_rechazo a la tabla)
    if (motivo) {
      updateData.blocked_reason = motivo.trim();
    }

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id_evento)
      .eq('status', 'pending') // Solo actualizar si está pendiente
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
    
  } catch (error: any) {
    console.error('Error en rechazarSolicitud:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
}

export async function eliminarEvento ({ id_evento,id_perfil}: AceptarRechazarEvento){
   try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id_evento)
      .select()
      .single();

      
    if (error) {
      console.error('Error eliminando evento:', error);
      return { 
        success: false, 
        error: error.message || 'Error al eliminar el evento' 
      };
    }
    return { 
      success: true, 
      data,
      message: 'Evento eliminado exitosamente'
    };
    
  }
    catch (error: any) {    
    console.error('Error en eliminarEvento:', error);
    return { 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    };
  }
}

export async function aceptarSolicitud({ id_evento, id_perfil }: AceptarRechazarEvento) {
  try {
    const supabase = getSupabaseAdmin();
    
    // 1. Obtener información del evento
    const { data: evento, error: errorEvento } = await supabase
      .from('events')
      .select('fecha_hora_ini, fecha_hora_fin, title, is_blocked')
      .eq('id', id_evento)
      .single();

    if (errorEvento) {
      return { 
        success: false, 
        error: 'Evento no encontrado' 
      };
    }

    // 2. Verificar choque de horarios - PARA TODOS LOS EVENTOS (bloqueados y confirmados)
    const verificación = await verificarChoqueHorarios(
      id_perfil,
      new Date(evento.fecha_hora_ini),
      new Date(evento.fecha_hora_fin),
      id_evento
    );

    if (verificación.tieneChoque) {
      return { 
        success: false, 
        error: 'Ya Tienes eventos CONFIRMADOS en este horario verifica tu agenda!',
        eventosChoque: verificación.eventosChoque
      };
    }

    // 3. Actualizar participacion_evento
    const { data: participacion, error: participacionError } = await supabase
      .from('participacion_evento')
      .update({
        estado: 'confirmado',
        updated_at: new Date().toISOString()
      })
      .eq('evento_id', id_evento)
      .eq('perfil_id', id_perfil)
      .eq('estado', 'pendiente')
      .select()
      .single();

    if (participacionError) {
      return { 
        success: false, 
        error: 'Error al aceptar la participación', participacionError 
      };
    }

    // 4. Actualizar solicitud (si existe)
    await supabase
      .from('solicitud')
      .update({
        estado: 'aceptada',
        fecha_respuesta: new Date().toISOString(),
        actualizado_en: new Date().toISOString()
      })
      .eq('id_evento_solicitud', id_evento)
      .eq('id_invitado', id_perfil)
      .eq('estado', 'pendiente');

    return { 
      success: true, 
      data: participacion,
      message: 'Participación aceptada'
    };
    
  } catch (error: any) {
    console.error('Error en aceptarSolicitud:', error);
    return { 
      success: false, 
      error: 'Error interno del servidor' 
    };
  }
}

async function verificarChoqueHorarios(
  id_perfil: string,
  fecha_inicio: Date,
  fecha_fin: Date,
  evento_excluido?: string
): Promise<{ tieneChoque: boolean; eventosChoque: any[] }> {
  const supabase = getSupabaseAdmin();
  
  try {
    const eventosChoque: any[] = [];

    // 1. Verificar eventos bloqueados (is_blocked = true)
    // Estos pueden estar en events directamente (creator_profile_id o id_artista)
    const { data: eventosBloqueados } = await supabase
      .from('events')
      .select('id, title, fecha_hora_ini, fecha_hora_fin, is_blocked')
      .eq('is_blocked', true)
      .lte('fecha_hora_ini', fecha_fin.toISOString())
      .gte('fecha_hora_fin', fecha_inicio.toISOString())
      .or(`creator_profile_id.eq.${id_perfil},id_artista.eq.${id_perfil}`);

    if (eventosBloqueados) {
      // Filtrar para excluir el evento actual
      const filtrados = evento_excluido 
        ? eventosBloqueados.filter(e => e.id !== evento_excluido)
        : eventosBloqueados;
      
      eventosChoque.push(...filtrados.map(e => ({ ...e, tipo: 'bloqueado' })));
    }

    // 2. Verificar eventos confirmados en participacion_evento
    const { data: participacionesConfirmadas } = await supabase
      .from('participacion_evento')
      .select(`
        evento_id,
        estado,
        events!inner (
          id,
          title,
          fecha_hora_ini,
          fecha_hora_fin,
          is_blocked
        )
      `)
      .eq('perfil_id', id_perfil)
      .eq('estado', 'confirmado')
      .lte('events.fecha_hora_ini', fecha_fin.toISOString())
      .gte('events.fecha_hora_fin', fecha_inicio.toISOString());

    if (participacionesConfirmadas) {
      // Filtrar para excluir el evento actual y eventos ya contados como bloqueados
      const filtrados = participacionesConfirmadas.filter((e: any) => {
        const esEventoActual = e.evento_id === evento_excluido;
        const yaEstaEnBloqueados = eventosChoque.some(eb => eb.id === e.evento_id);
        return !esEventoActual && !yaEstaEnBloqueados;
      });
      
      eventosChoque.push(...filtrados.map((e: any) => ({ 
        ...e.events, 
        tipo: 'confirmado',
        participacion_id: e.evento_id 
      })));
    }

    return {
      tieneChoque: eventosChoque.length > 0,
      eventosChoque
    };

  } catch (error) {
    console.error('Error en verificarChoqueHorarios:', error);
    throw error;
  }
}