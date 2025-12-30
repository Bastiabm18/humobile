'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, BlockDateRangeParams, SolicitudRespuesta, AceptarRechazarSolicitud, AceptarRechazarEvento, CalendarEvent } from '@/types/profile'; 
import { revalidatePath } from 'next/cache';


export async function getEventsByProfile(profileId: string, profileType: 'artist' | 'band' | 'place', status: string): Promise<CalendarEvent[]> {
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




export async function aceptarSolicitud ({ id_evento}: AceptarRechazarEvento){
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
export async function rechazarSolicitud ({ id_evento,motivo}: AceptarRechazarEvento){
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

export async function eliminarEvento ({ id_evento}: AceptarRechazarEvento){
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