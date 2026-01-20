
'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, BlockDateRangeParams, evento, CalendarEvent, eventoCompleto, categoriaEvento, EventoGuardar, ParticipanteEvento, EventoCalendario, IntegranteBandaEvento, EventoActualizar } from '@/types/profile'; 
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';



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

    // 3. Mapear cada perfil según su tipo
   const perfilesVisibles: Profile[] = (perfilesRepresentados || []).map(p => ({
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

    // El creador siempre es participante confirmado
    await crearParticipacionEvento(evento.id, eventData.id_creador, 'confirmado');

    // Procesar según tipo de creador PARA CADA PARTICIPANTE enviar solicitud y participacion_evento 
    for (const participante of participantes) {
      if(participante.id_perfil === eventData.id_creador){
        continue; // ya creado arriba
      }else{
      switch (eventData.creador_tipo_perfil) {
        case 'banda':
          await procesarEventoBanda(evento.id, eventData.id_creador,
             participante.id_perfil,participante.tipo );
          break;
          
        case 'lugar':
          await procesarEventoLocal(evento.id, eventData.id_creador,
             participante.id_perfil,participante.tipo );
          break;
          
        case 'artista':
          await procesarEventoArtista(evento.id, eventData.id_creador,
             participante.id_perfil,participante.tipo);
          break;
      }
      }

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
  
  // La banda como participante
  await crearParticipacionEvento(eventoId, id_creador, 'pendiente');

    // Si es banda, también invitar a sus integrantes
  if (tipo_perfil_participante === 'banda') {
    const { data: integrantes } = await getSupabaseAdmin()
      .from('integrante')
      .select('id_artista')
      .eq('id_banda', id_creador)
      .eq('estado', 'activo');
    
    if (integrantes) {
      for (const integrante of integrantes) {
        await crearParticipacionEvento(eventoId, integrante.id_artista, 'pendiente');
        await crearSolicitudEvento(eventoId, id_creador, integrante.id_artista, 'invitacion');
      }
    }}
  
  
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

    // Ya viene en formato EventoCalendario, solo convertimos fechas si es necesario
    const eventos: EventoCalendario[] = eventosDB.map((ev: any) => ({
      ...ev,
      inicio: new Date(ev.inicio),
      fin: ev.fin ? new Date(ev.fin) : null,
      created_at: new Date(ev.created_at),
      updated_at: new Date(ev.updated_at),
      // Participantes ya vienen como jsonb/array
      participantes: ev.participantes || []
    }));

    return eventos;
  } catch (error: any) {
    console.error('Error en getEventsByDiaYPerfilId:', error);
    throw error;
  }
}


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