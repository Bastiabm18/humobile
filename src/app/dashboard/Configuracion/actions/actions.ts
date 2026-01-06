'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, CalendarEvent, User } from '@/types/profile'; 
import { pregunta_frecuente } from '@/types/externo';



export async function getPreguntasFrecuentes(): Promise<pregunta_frecuente[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // FUNCION EN POSTGRESQL
    const { data: faqsData, error } = await supabaseAdmin
      .rpc('get_pregunta_frecuente_master');

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

// Crear nueva pregunta
export async function crearPreguntaFrecuente(
  preguntaData: Omit<pregunta_frecuente, 'id' | 'created_at' | 'updated_at'>
): Promise<pregunta_frecuente> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from('pregunta_frecuente')
      .insert([{
        pregunta: preguntaData.pregunta,
        respuesta: preguntaData.respuesta,
        estado: preguntaData.estado ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear pregunta frecuente:', error);
      throw new Error(`Error al crear pregunta: ${error.message}`);
    }

    console.log('Pregunta creada exitosamente:', data.id);
    return data as pregunta_frecuente;
    
  } catch (error: any) {
    console.error('Error en crearPreguntaFrecuente:', error);
    throw error;
  }
}

// Actualizar pregunta existente
export async function actualizarPreguntaFrecuente(
  id: string,
  updates: Partial<Omit<pregunta_frecuente, 'id' | 'created_at' | 'updated_at'>>
): Promise<pregunta_frecuente> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .from('pregunta_frecuente')
      .update({
        pregunta: updates.pregunta,
        respuesta: updates.respuesta,
        estado: updates.estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar pregunta frecuente:', error);
      throw new Error(`Error al actualizar pregunta: ${error.message}`);
    }

    console.log('Pregunta actualizada exitosamente:', id);
    return data as pregunta_frecuente;
    
  } catch (error: any) {
    console.error('Error en actualizarPreguntaFrecuente:', error);
    throw error;
  }
}

// Eliminar pregunta (cambiar estado a false)
export async function eliminarPreguntaFrecuente(id: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('pregunta_frecuente')
      .delete()   
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar pregunta frecuente:', error);
      throw new Error(`Error al eliminar pregunta: ${error.message}`);
    }

    console.log('Pregunta eliminada (estado cambiado a false):', id);
    
  } catch (error: any) {
    console.error('Error en eliminarPreguntaFrecuente:', error);
    throw error;
  }
}

export async function getUsuarios(): Promise<User[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('📋 Iniciando obtención de usuarios master...');
    
    // Llamar a la función PostgreSQL
    const { data: usuariosData, error } = await supabaseAdmin
      .rpc('get_usuarios_master');

    if (error) {
      console.error('❌ Error en la función PostgreSQL get_usuarios_master:', error);
      console.error('Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }

    if (!usuariosData || usuariosData.length === 0) {
      console.log('ℹ️ No se encontraron usuarios');
      return [];
    }

    console.log(`✅ Se obtuvieron ${usuariosData.length} usuarios`);
    
    // Mapear los datos a nuestro tipo UsuarioMaster
    const usuarios: User[] = usuariosData.map((usuario: any) => {
      const totalPerfiles = 
        (usuario.perfiles_artista || 0) + 
        (usuario.perfiles_banda || 0) + 
        (usuario.perfiles_lugar || 0);
      
      // Determinar el estado del usuario
      let estadoUsuario = 'activo';
      if (usuario.user_estado === 'bloqueado' || usuario.user_estado === 'inactivo') {
        estadoUsuario = 'bloqueado';
      } else if (usuario.user_estado === 'pendiente') {
        estadoUsuario = 'pendiente';
      }
      
      // Determinar el texto de membresía para display
      let textoMembresia = usuario.membership_nombre || 'GRATIS';
      if (usuario.membership_estado !== 'ACTIVO') {
        textoMembresia = `${textoMembresia} (${usuario.membership_estado})`;
      }
      
      // Determinar el texto de perfiles para display
      let textoPerfiles = `${totalPerfiles} perfil${totalPerfiles !== 1 ? 'es' : ''}`;
      if (totalPerfiles === 0) {
        textoPerfiles = 'Sin perfiles';
      }
      
      return {
        id: usuario.user_id,
        supabase_id: usuario.user_supabase_id,
        name: usuario.user_name,
        role: usuario.user_role || 'user',
        email: usuario.user_email,
        telefono: usuario.user_phone || '',
        createdAt: usuario.user_created_at,
        updatedAt: usuario.user_updated_at,
        estado: estadoUsuario,
        membresia: textoMembresia,
        perfiles: textoPerfiles,
        perfil_artista: usuario.perfiles_artista || 0,
        perfil_banda: usuario.perfiles_banda || 0,
        perfil_lugar: usuario.perfiles_lugar || 0,
        membership_precio: usuario.membership_precio || 0,
        membership_inicio: usuario.membership_inicio,
        membership_fin: usuario.membership_fin,
        membership_estado: usuario.membership_estado || 'SIN MEMBRESÍA'
      };
    });

    // Log detallado del primer usuario para debugging
    if (usuarios.length > 0) {
      console.log('📊 Ejemplo de usuario obtenido:', {
        nombre: usuarios[0].name,
        email: usuarios[0].email,
        role: usuarios[0].role,
        membresia: usuarios[0].membresia,
        perfiles: usuarios[0].perfiles,
        perfilesDetalle: {
          artista: usuarios[0].perfil_artista,
          banda: usuarios[0].perfil_banda,
          lugar: usuarios[0].perfil_lugar
        },
        estado: usuarios[0].estado
      });
    }
    
    return usuarios;
    
  } catch (error: any) {
    console.error('❌ Error en getUsuarios:', error);
    throw error;
  }
}



