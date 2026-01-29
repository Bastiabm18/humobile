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


export async function aceptarSolicitud({ 
  id_solicitud,
  codigo_solicitud,
  id_evento_solicitud,
  id_invitado,
  id_creador
}: AceptarRechazarSolicitud) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Primero actualizar el estado de la solicitud
    const { data: solicitudActualizada, error: errorSolicitud } = await supabase
      .from('solicitud')
      .update({
        estado: 'aceptada',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', id_solicitud)
      .eq('estado', 'pendiente')
      .select()
      .single();
    
    if (errorSolicitud) {
      console.error('Error actualizando estado de solicitud:', errorSolicitud);
      return { 
        success: false, 
        error: errorSolicitud.message || 'Error al aceptar la solicitud' 
      };
    }
    
    // Luego manejar según el código de solicitud
    switch (codigo_solicitud) {
      case 'invitacion_evento':
        return await confirmarParticipacionEvento({
          supabase,
          id_evento_solicitud,
          id_invitado
        });

        case 'unirse_banda':
          return await confirmarSerIntegranteBanda({
            id_creador,
            id_invitado
          });


        case 'ser_representado':
          return await confirmarSerRepresentado({
            id_creador,
            id_invitado
          });
        
      default:
        return { 
          success: true, 
          data: solicitudActualizada,
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

// Función separada para confirmar participación en evento
async function confirmarParticipacionEvento({ 
  supabase, 
  id_evento_solicitud, 
  id_invitado 
}: {
  supabase: any,
  id_evento_solicitud: string,
  id_invitado: string
}) {


   const { data: conflictoData, error: conflictoError } = await supabase
      .rpc('tiene_conflicto_horario', {
        p_id_evento: id_evento_solicitud,
        p_id_invitado: id_invitado
      });

    if (conflictoError) {
      console.error('Error verificando conflicto de horario:', conflictoError);
      return { 
        success: false, 
        error: 'Error al verificar disponibilidad de horario' 
      };
    }

    // 2. Si hay conflicto, no permitir confirmar
    if (conflictoData === true) {
      return { 
        success: false, 
        error: 'No puedes confirmar este evento porque ya tienes un evento confirmado en ese horario'
      };
    }
  // Buscar el registro en participacion_evento usando evento_id y perfil_id
  const { data, error } = await supabase
    .from('participacion_evento')
    .update({
      estado: 'confirmado',
      updated_at: new Date().toISOString()
    })
    .eq('evento_id', id_evento_solicitud)
    .eq('perfil_id', id_invitado)
    .eq('estado', 'pendiente')
    .select()
    .single();

  if (error) {
    console.error('Error confirmando participación en evento:', error);
    return { 
      success: false, 
      error: error.message || 'Error al confirmar participación en el evento' 
    };
  }

  return { 
    success: true, 
    data,
    message: 'Participación en evento confirmada exitosamente'
  };
}
// Función separada para confirmar ser representado
async function confirmarSerRepresentado({ 
 
 
  id_invitado,
  id_creador
}: {

  id_invitado: string,
  id_creador:string
}) {
  const supabase = getSupabaseAdmin();
  // Buscar el registro en participacion_evento usando evento_id y perfil_id
  const { data, error } = await supabase
    .from('representado')
    .update({
      estado_representacion: 'activo',
      updated_at: new Date().toISOString()
    })
    .eq('id_representante',id_creador)
    .eq('id_representado',id_invitado)
    .eq('estado_representacion', 'pendiente')
    .select()
    .single();

  if (error) {
    console.error('Error confirmando al representante:', error);
    return { 
      success: false, 
      error: error.message || 'Error al confirmar al representante' 
    };
  }

  return { 
    success: true, 
    data,
    message: 'Representante confirmado exitosamente'
  };
}
async function confirmarSerIntegranteBanda({ 
 
 
  id_invitado,
  id_creador
}: {

  id_invitado: string,
  id_creador:string
}) {
  const supabase = getSupabaseAdmin();
  // Buscar el registro en participacion_evento usando evento_id y perfil_id
  const { data, error } = await supabase
    .from('integrante')
    .update({
      estado: 'activo',
      updated_at: new Date().toISOString()
    })
    .eq('id_banda',id_creador)
    .eq('id_artista',id_invitado)
    .eq('estado', 'pendiente')
    .select()
    .single();

  if (error) {
    console.error('Error confirmando al representante:', error);
    return { 
      success: false, 
      error: error.message || 'Error al confirmar al representante' 
    };
  }

  return { 
    success: true, 
    data,
    message: 'Representante confirmado exitosamente'
  };
}
export async function rechazarSolicitud({ 
  id_solicitud,
  codigo_solicitud,
  id_evento_solicitud,
  id_invitado,
  motivo_rechazo
}: AceptarRechazarSolicitud) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Primero actualizar el estado de la solicitud
    const updateDataSolicitud: any = {
      estado: 'rechazada',
      actualizado_en: new Date().toISOString()
    };
    
    // Agregar motivo si existe
    if (motivo_rechazo) {
      updateDataSolicitud.motivo_rechazo = motivo_rechazo.trim();
    }

    const { data: solicitudActualizada, error: errorSolicitud } = await supabase
      .from('solicitud')
      .update(updateDataSolicitud)
      .eq('id', id_solicitud)
      .eq('estado', 'pendiente')
      .select()
      .single();
    
    if (errorSolicitud) {
      console.error('Error actualizando estado de solicitud:', errorSolicitud);
      return { 
        success: false, 
        error: errorSolicitud.message || 'Error al rechazar la solicitud' 
      };
    }
    
    // Luego manejar según el código de solicitud
    switch (codigo_solicitud) {
      case 'invitacion_evento':
        return await rechazarParticipacionEvento({
          supabase,
          id_evento_solicitud,
          id_invitado,
          motivo_rechazo
        });
        
      default:
        return { 
          success: true, 
          data: solicitudActualizada,
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

// Función separada para rechazar participación en evento
async function rechazarParticipacionEvento({ 
  supabase, 
  id_evento_solicitud, 
  id_invitado,
  motivo_rechazo
}: {
  supabase: any,
  id_evento_solicitud: string,
  id_invitado: string,
  motivo_rechazo?: string
}) {
  const updateDataEvento: any = {
    estado: 'rechazado',
    updated_at: new Date().toISOString()
  };
  
  // Agregar motivo si existe
  if (motivo_rechazo) {
    updateDataEvento.motivo_rechazo = motivo_rechazo.trim();
  }

  const { data, error } = await supabase
    .from('participacion_evento')
    .update(updateDataEvento)
    .eq('evento_id', id_evento_solicitud)
    .eq('perfil_id', id_invitado)
    .eq('estado', 'pendiente')
    .select()
    .single();

  if (error) {
    console.error('Error rechazando participación en evento:', error);
    return { 
      success: false, 
      error: error.message || 'Error al rechazar participación en el evento' 
    };
  }

  return { 
    success: true, 
    data,
    message: 'Participación en evento rechazada exitosamente'
  };
}

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


export async function getSolicitudesByPerfil(
    perfilId: string,
    estadoSolicitud: string = ''
): Promise<SolicitudRespuesta[]> {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        
        if (!perfilId) {
            return [];
        }

        const { data, error } = await supabaseAdmin
            .rpc('get_solicitudes_detalladas_v2', {
                p_id_perfil: perfilId,
                filtro_estado: estadoSolicitud
            });

        if (error) {
            console.error(' Error obteniendo solicitudes:', error);
            throw new Error(`Error al obtener solicitudes: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Mapear la respuesta
        const solicitudes: SolicitudRespuesta[] = data.map((item: any) => {
            return {
                id: item.id || '',
                id_tipo_solicitud: item.id_tipo_solicitud || '',
                tipo_solicitud: item.tipo_solicitud || '',
                codigo_solicitud: item.codigo_solicitud || '',
                nombre_solicitud: item.nombre_solicitud || '',
                descripcion_solicitud: item.descripcion_solicitud || '',
                creador_id: item.creador_id || '',
                creador_nombre: item.creador_nombre || '',
                creador_tipo: item.creador_tipo || '',
                invitado_id: item.invitado_id || '',
                invitado_nombre: item.invitado_nombre || '',
                invitado_tipo: item.invitado_tipo || '',
                fecha_creacion: new Date(item.fecha_creacion),
                fecha_expiracion: item.fecha_expiracion ? new Date(item.fecha_expiracion) : new Date(),
                plazoRespuesta: item.plazo_respuesta ? new Date(item.plazo_respuesta) : new Date(),
                estado: item.estado || 'pendiente',
                motivo_rechazo: item.motivo_rechazo || undefined,
                id_evento_solicitud: item.id_evento_solicitud || undefined,
                evento_titulo: item.evento_titulo || '',
                evento_fecha_inicio: item.evento_fecha_inicio || undefined,
                evento_fecha_fin: item.evento_fecha_fin || undefined,
                es_invitacion_banda: item.es_invitacion_banda || false,
                nombre_banda_asociada: item.nombre_banda_asociada || ''

            };
        });

       // console.log(' Solicitudes obtenidas:', {
       //     cantidad: solicitudes.length,
       //     primerItem: solicitudes[0] ? {
       //         id: solicitudes[0].id,
       //         tipo_solicitud: solicitudes[0].tipo_solicitud,
       //         creador: solicitudes[0].creador_nombre,
       //         invitado: solicitudes[0].invitado_nombre,
       //         estado: solicitudes[0].estado
       //     } : 'No hay datos'
       // });

        return solicitudes;
        
    } catch (error: any) {
        console.error(' Error en getSolicitudesByPerfil:', error);
        throw error;
    }
}