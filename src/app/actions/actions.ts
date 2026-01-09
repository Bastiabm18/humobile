'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, CalendarEvent } from '@/types/profile'; 
import { pregunta_frecuente } from '@/types/externo';
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
// 1. FUNCIÓN DE LECTURA (COMBINADA)
// ===========================================

/**
 * Obtiene todos los perfiles (Artist, Band, Place) asociados al usuario logueado, 
 * combinando las consultas de las tres tablas.
 * @param userId ID del usuario logueado.
 * @returns Array combinado de todos los perfiles del usuario.
 */
export const getProfilesPublic = async (): Promise<Profile[]> => {
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
    .order('creado_en', { ascending: false });

  // 2. Manejo de errores
  if (error) {
    console.error("Error fetching public profiles:", error);
    throw new Error(`Fallo al obtener perfiles públicos: ${error.message}`);
  }

  if (!data) return [];

  // 3. Mapear cada perfil según su tipo
  const allProfiles: Profile[] = data.map((p: any) => {
    // Datos base comunes
    const baseData = {
      countryId: p.Pais?.nombre_pais || '',
      regionId: p.Region?.nombre_region || '',
      cityId: p.Comuna?.nombre_comuna || '',
      email: p.email || '',
      updateAt: p.actualizado_en || p.creado_en
    };

    // Según el tipo de perfil, construir la data específica
    switch (p.tipo_perfil) {
      case 'artista':
        return {
          id: p.id_perfil,
          type: 'artist' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...p.artista_data
          } as ArtistData
        };

      case 'banda':
        return {
          id: p.id_perfil,
          type: 'band' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            band_name: p.nombre,
            style: p.banda_data?.estilo_banda || '',
            music_type: p.banda_data?.tipo_musica || '',
            is_tribute: p.banda_data?.es_tributo || false,
            contact_phone: p.telefono_contacto || '',
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            tipo_perfil: p.tipo_perfil,
            ...p.banda_data
          } as BandData
        };

      case 'local':
        return {
          id: p.id_perfil,
          type: 'place' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            place_name: p.nombre,
            address: p.direccion || '',
            phone: p.telefono_contacto || '',
            place_type: p.local_data?.tipo_establecimiento as any || 'other',
            lat: p.lat || 0,
            lng: p.lon || 0,
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            singer: false,
            band: false,
            actor: false,
            comedian: false,
            impersonator: false,
            tribute: false,
            tipo_perfil: p.tipo_perfil,
            ...p.local_data
          } as PlaceData
        };

      case 'productor':
      case 'representante':
        return {
          id: p.id_perfil,
          type: 'artist' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...(p.tipo_perfil === 'productor' ? p.productor_data : p.representante_data)
          } as ArtistData
        };

      default:
        return {
          id: p.id_perfil,
          type: 'artist' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil || 'artista'
          } as ArtistData
        };
    }
  });

  return allProfiles;
};
export const getProfile = async (id_perfil: string, tipo?: string): Promise<Profile[]> => {
  const supabaseAdmin = getSupabaseAdmin();
  
  // Construir la consulta
  let query = supabaseAdmin
    .from('perfil')
    .select(`
      *,
      Pais(nombre_pais),
      Region(nombre_region),
      Comuna(nombre_comuna)
    `)
    .eq('id_perfil', id_perfil);

  // Si se especifica el tipo, filtrar por él
  if (tipo) {
    const tipoPerfilMap: Record<string, string> = {
      'artista': 'artista',
      'banda': 'banda',
      'lugar': 'local',
      'producer': 'productor',
      'representative': 'representante'
    };
    
    const tipoPerfil = tipoPerfilMap[tipo] || tipo;
    query = query.eq('tipo_perfil', tipoPerfil);
  }

  const { data, error } = await query;

  // 2. Manejo de errores
  if (error) {
    console.error("Error fetching profile:", error);
    throw new Error(`Fallo al obtener perfil: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // 3. Mapear los perfiles según su tipo
  const profiles: Profile[] = data.map((p: any) => {
    const baseData = {
      countryId: p.Pais?.nombre_pais || '',
      regionId: p.Region?.nombre_region || '',
      cityId: p.Comuna?.nombre_comuna || '',
      email: p.email || '',
      updateAt: p.actualizado_en || p.creado_en
    };

    switch (p.tipo_perfil) {
      case 'artista':
        return {
          id: p.id_perfil,
          type: 'artist' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...p.artista_data
          } as ArtistData
        };

      case 'banda':
        return {
          id: p.id_perfil,
          type: 'band' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            band_name: p.nombre,
            style: p.banda_data?.estilo_banda || '',
            music_type: p.banda_data?.tipo_musica || '',
            is_tribute: p.banda_data?.es_tributo || false,
            contact_phone: p.telefono_contacto || '',
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            tipo_perfil: p.tipo_perfil,
            ...p.banda_data
          } as BandData
        };

      case 'local':
        return {
          id: p.id_perfil,
          type: 'place' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            place_name: p.nombre,
            address: p.direccion || '',
            phone: p.telefono_contacto || '',
            place_type: p.local_data?.tipo_establecimiento as any || 'other',
            lat: p.lat || 0,
            lng: p.lon || 0,
            photo_url: p.imagen_url || '',
            video_url: p.video_url || '',
            singer: false,
            band: false,
            actor: false,
            comedian: false,
            impersonator: false,
            tribute: false,
            tipo_perfil: p.tipo_perfil,
            ...p.local_data
          } as PlaceData
        };

      case 'productor':
      case 'representante':
        return {
          id: p.id_perfil,
          type: 'artist' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil,
            ...(p.tipo_perfil === 'productor' ? p.productor_data : p.representante_data)
          } as ArtistData
        };

      default:
        return {
          id: p.id_perfil,
          type: 'artist' as ProfileType,
          created_at: p.creado_en,
          data: {
            ...baseData,
            name: p.nombre,
            phone: p.telefono_contacto || '',
            image_url: p.imagen_url || '',
            tipo_perfil: p.tipo_perfil || 'artista'
          } as ArtistData
        };
    }
  });

  return profiles;
};
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
        description: evento.descripcion || '',
        category: evento.category || '',
        status: evento.estado || '',
        
        // Todos los datos originales en resource
        resource: {
          // Mapear campos en español a inglés para tu interfaz
          creator_profile_id: evento.id_creador_perfil,
          creator_type: evento.tipo_creador,
          fecha_hora_ini: fechaIni,
          fecha_hora_fin: fechaFin,
          place_profile_id: evento.id_perfil_lugar || '',
          custom_place_name: evento.nombre_lugar_personalizado || '',
          address: evento.direccion || '',
          organizer_name: evento.nombre_organizador || '',
          organizer_contact: evento.contacto_organizador || '',
          ticket_link: evento.link_entradas || '',
          instagram_link: evento.link_instagram || '',
          flyer_url: evento.flyer_url || '',
          category: evento.categoria || '',
          status: evento.estado || '',
          created_at: evento.creado_en,
          updated_at: evento.actualizado_en,
          is_blocked: evento.esta_bloqueado || false,
          blocked_reason: evento.motivo_bloqueo || '',
          
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
export async function getEventosMostrarPerfil(profileId: string, profileType: 'artist' | 'band' | 'place'): Promise<CalendarEvent[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Consulta eventos del perfil creador
    const { data:eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_calendario_sin_bloqueos',{
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
        description: evento.descripcion || '',
        category: evento.category || '',
        status: evento.estado || '',
        
        // Todos los datos originales en resource
        resource: {
          // Mapear campos en español a inglés para tu interfaz
          creator_profile_id: evento.id_creador_perfil,
          creator_type: evento.tipo_creador,
          fecha_hora_ini: fechaIni,
          fecha_hora_fin: fechaFin,
          place_profile_id: evento.id_perfil_lugar || '',
          custom_place_name: evento.nombre_lugar_personalizado || '',
          address: evento.direccion || '',
          organizer_name: evento.nombre_organizador || '',
          organizer_contact: evento.contacto_organizador || '',
          ticket_link: evento.link_entradas || '',
          instagram_link: evento.link_instagram || '',
          flyer_url: evento.flyer_url || '',
          category: evento.categoria || '',
          status: evento.estado || '',
          created_at: evento.creado_en,
          updated_at: evento.actualizado_en,
          is_blocked: evento.esta_bloqueado || false,
          blocked_reason: evento.motivo_bloqueo || '',
          
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

export async function getEventsPorEstado():Promise<CalendarEvent[]>{

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Consulta eventos del perfil creador
    const { data:eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_confirmados');
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
        description: evento.descripcion || '',
        category: evento.category || '',
        status: evento.estado || '',
        
        // Todos los datos originales en resource
        resource: {
          // Mapear campos en español a inglés para tu interfaz
          creator_profile_id: evento.id_creador_perfil,
          creator_type: evento.tipo_creador,
          fecha_hora_ini: fechaIni,
          fecha_hora_fin: fechaFin,
          place_profile_id: evento.id_perfil_lugar || '',
          custom_place_name: evento.nombre_lugar_personalizado || '',
          address: evento.direccion || '',
          organizer_name: evento.nombre_organizador || '',
          organizer_contact: evento.contacto_organizador || '',
          ticket_link: evento.link_entradas || '',
          instagram_link: evento.link_instagram || '',
          flyer_url: evento.flyer_url || '',
          category: evento.categoria || '',
          status: evento.estado || '',
          created_at: evento.creado_en,
          updated_at: evento.actualizado_en,
          is_blocked: evento.esta_bloqueado || false,
          blocked_reason: evento.motivo_bloqueo || '',
          
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

export async function getPreguntasFrecuentes(): Promise<pregunta_frecuente[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // FUNCION EN POSTGRESQL
    const { data: faqsData, error } = await supabaseAdmin
      .rpc('get_pregunta_frecuente');

    if (error) {
      console.error('Error en la función PostgreSQL get_pregunta_frecuente:', error);
      console.error('Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error al obtener preguntas frecuentes: ${error.message}`);
    }

    if (!faqsData || faqsData.length === 0) {
      console.log(' No se encontraron preguntas frecuentes activas');
      return [];
    }

    console.log(`Se obtuvieron ${faqsData.length} preguntas frecuentes`);
    
    // Mapeamos los datos a nuestro tipo FAQ
    const preguntasFrecuentes: pregunta_frecuente[] = faqsData.map((faq: any) => ({
      id: faq.id,
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      estado: faq.estado,
      created_at: faq.created_at,
      updated_at: faq.updated_at
    }));

    return preguntasFrecuentes;
    
  } catch (error: any) {
    console.error(' Error en getPreguntasFrecuentes:', error);
    throw error;
  }
}