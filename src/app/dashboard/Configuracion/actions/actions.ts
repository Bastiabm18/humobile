'use server'; 

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { ArtistData, BandData, PlaceData, ProfileType, GeoData, Profile, CalendarEvent, User, categoria_perfil, MembresiaConPermisos, Perfil } from '@/types/profile'; 
import { pregunta_frecuente } from '@/types/externo';
import { create } from 'domain';



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
    
    console.log(' Iniciando obtención de usuarios master...');
    
    // Llamar a la función PostgreSQL
    const { data: usuariosData, error } = await supabaseAdmin
      .rpc('get_usuarios_master_v2');

    if (error) {
      console.error(' Error en la función PostgreSQL get_usuarios_master:', error);
      console.error('Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }

    if (!usuariosData || usuariosData.length === 0) {
      console.log(' No se encontraron usuarios');
      return [];
    }

    console.log(` Se obtuvieron ${usuariosData.length} usuarios`);
    
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
         perfil_representante: usuario.perfiles_representante || 0,  // NUEVO
        perfil_productor: usuario.perfiles_productor || 0,          // NUEVO
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
    console.error(' Error en getUsuarios:', error);
    throw error;
  }
}

export async function bloquearUsuario(id: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('User')
      .update({ 
        estado: 'bloqueado',
        "updatedAt": new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error al bloquear usuario:', error);
      throw new Error(`Error al bloquear usuario: ${error.message}`);
    }

    console.log('Usuario bloqueado:', id);
    
  } catch (error: any) {
    console.error('Error en bloquearUsuario:', error);
    throw error;
  }
}

export async function activarUsuario(id: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('User')
      .update({ 
        estado: 'ACTIVO',
        "updatedAt": new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error al activar usuario:', error);
      throw new Error(`Error al activar usuario: ${error.message}`);
    }

    console.log('Usuario activado:', id);
    
  } catch (error: any) {
    console.error('Error en activarUsuario:', error);
    throw error;
  }
}

export async function eliminarUsuario(id: string): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Primero verificamos si el usuario existe
    const { data: usuario, error: errorBusqueda } = await supabaseAdmin
      .from('User')
      .select('id, supabase_id')
      .eq('id', id)
      .single();

    if (errorBusqueda || !usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Eliminar usuario (esto eliminará en cascada los perfiles por las FK)
    const { error } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar usuario:', error);
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }

    console.log('Usuario eliminado permanentemente:', id);
    
  } catch (error: any) {
    console.error('Error en eliminarUsuario:', error);
    throw error;
  }
}

export async function actualizarUsuario(
  id: string, 
  datos: Partial<{
    name: string;
    role: string;
    phone: string;
    estado: string;
  }>
): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { error } = await supabaseAdmin
      .from('User')
      .update({ 
        ...datos,
        "updatedAt": new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error al actualizar usuario:', error);
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }

    console.log('Usuario actualizado:', id);
    
  } catch (error: any) {
    console.error('Error en actualizarUsuario:', error);
    throw error;
  }
}

export async function getCategoriasPerfil(): Promise<categoria_perfil[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
   
    
    const { data: categoriasData, error } = await supabaseAdmin
      .from('categoria_perfil')
      .select('*')
      .order('tipo', { ascending: true })
      .order('categoria', { ascending: true });

    if (error) {
      console.error('Error al obtener categorías:', error);
      console.error('Detalles del error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }

    if (!categoriasData || categoriasData.length === 0) {
      console.log('ℹ No se encontraron categorías');
      return [];
    }

    console.log(` Se obtuvieron ${categoriasData.length} categorías`);
    
    const categorias: categoria_perfil[] = categoriasData.map((cat: any) => ({
      id_categoria: cat.id_categoria,
      nombre_categoria: cat.categoria,
      tipo_perfil: cat.tipo,
      estado: cat.estado,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }));

    return categorias;
    
  } catch (error: any) {
    console.error(' Error en getCategoriasPerfil:', error);
    throw error;
  }
}

// CREAR nueva categoría
export async function crearCategoriaPerfil(
  categoriaData: Omit<categoria_perfil, 'id_categoria'>
): Promise<categoria_perfil> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('📝 Creando nueva categoría:', categoriaData);
    
    const { data, error } = await supabaseAdmin
      .from('categoria_perfil')
      .insert([{
        categoria: categoriaData.nombre_categoria,
        tipo: categoriaData.tipo_perfil,
        estado: categoriaData.estado ?? true
      }])
      .select()
      .single();

    if (error) {
      console.error(' Error al crear categoría:', error);
      throw new Error(`Error al crear categoría: ${error.message}`);
    }

    console.log(' Categoría creada exitosamente:', data.id_categoria);
    
    return {
      id_categoria: data.id_categoria,
      nombre_categoria: data.categoria,
      tipo_perfil: data.tipo,
      estado: data.estado
    };
    
  } catch (error: any) {
    console.error(' Error en crearCategoriaPerfil:', error);
    throw error;
  }
}

// ACTUALIZAR categoría existente
export async function actualizarCategoriaPerfil(
  id: number,
  updates: Partial<Omit<categoria_perfil, 'id_categoria'>>
): Promise<categoria_perfil> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log(' Actualizando categoría:', id, updates);
    
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (updates.nombre_categoria !== undefined) updateData.categoria = updates.nombre_categoria;
    if (updates.tipo_perfil !== undefined) updateData.tipo = updates.tipo_perfil;
    if (updates.estado !== undefined) updateData.estado = updates.estado;
    
    const { data, error } = await supabaseAdmin
      .from('categoria_perfil')
      .update(updateData)
      .eq('id_categoria', id)
      .select()
      .single();

    if (error) {
      console.error(' Error al actualizar categoría:', error);
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }

    console.log(' Categoría actualizada exitosamente:', id);
    
    return {
      id_categoria: data.id_categoria,
      nombre_categoria: data.categoria,
      tipo_perfil: data.tipo,
      estado: data.estado
    };
    
  } catch (error: any) {
    console.error(' Error en actualizarCategoriaPerfil:', error);
    throw error;
  }
}

// CAMBIAR ESTADO de categoría (activar/desactivar)
export async function cambiarEstadoCategoriaPerfil(
  id: number,
  estado: boolean
): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log(` Cambiando estado de categoría ${id} a:`, estado);
    
    const { error } = await supabaseAdmin
      .from('categoria_perfil')
      .update({ 
        estado: estado,
        updatedAt: new Date().toISOString()
      })
      .eq('id_categoria', id);

    if (error) {
      console.error(' Error al cambiar estado de categoría:', error);
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }

    console.log(` Estado de categoría ${id} cambiado a ${estado ? 'activo' : 'inactivo'}`);
    
  } catch (error: any) {
    console.error(' Error en cambiarEstadoCategoriaPerfil:', error);
    throw error;
  }
}

// ELIMINAR categoría 
export async function eliminarCategoriaPerfil(id: number): Promise<void> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('Eliminando categoría:', id);
    
    // Verificar si la categoría está siendo usada por algún perfil
    const { data: perfilesConCategoria, error: errorVerificacion } = await supabaseAdmin
      .from('perfil')
      .select('id_perfil')
      .eq('id_categoria', id)
      .limit(1);

    if (errorVerificacion) {
      console.error(' Error al verificar uso de categoría:', errorVerificacion);
      throw new Error(`Error al verificar categoría: ${errorVerificacion.message}`);
    }

    if (perfilesConCategoria && perfilesConCategoria.length > 0) {
      throw new Error('No se puede eliminar la categoría porque está siendo usada por uno o más perfiles');
    }

    // Eliminar categoría
    const { error } = await supabaseAdmin
      .from('categoria_perfil')
      .delete()
      .eq('id_categoria', id);

    if (error) {
      console.error(' Error al eliminar categoría:', error);
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }

    console.log(' Categoría eliminada permanentemente:', id);
    
  } catch (error: any) {
    console.error(' Error en eliminarCategoriaPerfil:', error);
    throw error;
  }
}

// OBTENER categorías por tipo
export async function getCategoriasPorTipo(tipo: string): Promise<categoria_perfil[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log(` Obteniendo categorías para tipo: ${tipo}`);
    
    const { data, error } = await supabaseAdmin
      .from('categoria_perfil')
      .select('*')
      .eq('tipo', tipo)
      .eq('estado', true)
      .order('categoria', { ascending: true });

    if (error) {
      console.error(' Error al obtener categorías por tipo:', error);
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log(` No se encontraron categorías para tipo: ${tipo}`);
      return [];
    }

    console.log(` Se obtuvieron ${data.length} categorías para tipo ${tipo}`);
    
    const categorias: categoria_perfil[] = data.map((cat: any) => ({
      id_categoria: cat.id_categoria,
      nombre_categoria: cat.categoria,
      tipo_perfil: cat.tipo,
      estado: cat.estado
    }));

    return categorias;
    
  } catch (error: any) {
    console.error(' Error en getCategoriasPorTipo:', error);
    throw error;
  }
}

// permisos
export async function getPermisos() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('permiso').select('*').order('nombre_permiso');
  return data;
}

export async function upsertPermiso(datos: any) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('permiso').upsert({
    id_permiso: datos.id_permiso || undefined,
    codigo_permiso: datos.codigo_permiso,
    nombre_permiso: datos.nombre_permiso,
    descripcion: datos.descripcion,
    updatedat: new Date().toISOString()
  });
  return { success: !error };
}

export async function eliminarPermiso(id: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('permiso').delete().eq('id_permiso', id);
}

// --- SECCIÓN MEMBRESÍAS & VINCULACIÓN ---
export async function getMembresias() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('Membership').select('*').order('precio_mensual');
  return data;
}

export async function getPermisosDeMembresia(idMembership: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('membership_permiso')
    .select(`
      *,
      permiso (id_permiso, nombre_permiso, codigo_permiso)
    `)
    .eq('id_membership', idMembership);
  return data;
}

export async function actualizarLimitePermiso(idMembresia: string, idPermiso: string, nuevoLimite: number) {
    const supabase = getSupabaseAdmin();
  await supabase.from('membership_permiso').update({ valor_limite: nuevoLimite })
    .match({ id_membership: idMembresia, id_permiso: idPermiso });
}

export async function asignarPermisoAMembresia(idM: string, idP: string, limite: number) {
  const supabase = getSupabaseAdmin();
  await supabase.from('membership_permiso').insert({
    id_membership: idM,
    id_permiso: idP,
    valor_limite: limite
  });
}

export async function quitarPermisoDeMembresia(idM: string, idP: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from('membership_permiso')
    .delete()
    .match({ id_membership: idM, id_permiso: idP });
}

export async function obtenerMembresiasDisponibles() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .rpc('obtener_membresias_con_permisos');

    if (error) throw error;

    return { 
      success: true, 
      data: data as MembresiaConPermisos[] 
    };
  } catch (error: any) {
    console.error('Error al obtener membresías:', error);
    return { success: false, error: error.message };
  }
}
//fin permisos

// ============================================
// MEMBRESÍAS - Version corregida
// ============================================

export async function getMembresiasDisponibles() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('Membership')
      .select('*')
      .order('precio_mensual', { ascending: true });

    if (error) throw new Error(error.message);

    if (!data) return [];

    // Convertir precio_mensual de string a number
    return data.map((m: any) => ({
      id_membership: m.id_membership,
      nombre: m.nombre,
      precio_mensual: parseFloat(m.precio_mensual) || 0,
      duracion_dias: m.duracion_dias
    }));
    
  } catch (error: any) {
    console.error('Error getMembresiasDisponibles:', error.message);
    throw error;
  }
}

export async function getHistorialMembresiaUsuario(supabase_id: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Consulta 1: Estados del usuario
    const { data: estados, error: err1 } = await supabase
      .from('MembershipState')
      .select('*')
      .eq('user_id', supabase_id)
      .order('fecha_inicio', { ascending: false });

    if (err1) throw new Error(err1.message);
    if (!estados || estados.length === 0) return [];

    // Consulta 2: Detalles de membresías (separado para evitar error de relación)
    const idsMembresia = [...new Set(estados.map((e: any) => e.membership_id))];
    
    const { data: membresias, error: err2 } = await supabase
      .from('Membership')
      .select('id_membership, nombre, precio_mensual, duracion_dias')
      .in('id_membership', idsMembresia);

    if (err2) throw new Error(err2.message);

    // Crear mapa
    const mapa = new Map(
      (membresias || []).map((m: any) => [m.id_membership, {
        id_membership: m.id_membership,
        nombre: m.nombre,
        precio_mensual: parseFloat(m.precio_mensual) || 0,
        duracion_dias: m.duracion_dias
      }])
    );

    // Combinar
    return estados.map((e: any) => ({
      id_state: e.id_state,
      user_id: e.user_id,
      membership_id: e.membership_id,
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin,
      estado: e.estado,
      Membership: mapa.get(e.membership_id) || null
    }));
    
  } catch (error: any) {
    console.error('Error getHistorialMembresiaUsuario:', error.message);
    throw error;
  }
}

export async function asignarMembresiaAUsuario(
  supabase_id: string,
  membership_id: string,
  duracion_dias: number | null
) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Calcular fecha fin
    let fechaFin: string | null = null;
    if (duracion_dias && duracion_dias > 0) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() + duracion_dias);
      fechaFin = fecha.toISOString();
    }
    
    // Crear el estado de membresía
    const { error: err1 } = await supabase
      .from('MembershipState')
      .insert({
        user_id: supabase_id,
        membership_id: membership_id,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: fechaFin,
        estado: 'ACTIVO'
      });

    if (err1) throw new Error(err1.message);

    return { success: true };
    
  } catch (error: any) {
    console.error('Error asignarMembresiaAUsuario:', error.message);
    throw error;
  }
}

export async function cancelarMembresiaUsuario(supabase_id: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Buscar membresía activa directamente por user_id
    const { data: membresiaActiva, error: err1 } = await supabase
      .from('MembershipState')
      .select('id_state')
      .eq('user_id', supabase_id)
      .eq('estado', 'ACTIVO')
      .limit(1)
      .maybeSingle();

    if (err1) throw new Error(err1.message);
    
    if (!membresiaActiva) {
      throw new Error('El usuario no tiene membresía activa');
    }

    // Cancelar el estado
    const { error: err2 } = await supabase
      .from('MembershipState')
      .update({ estado: 'CANCELADO' })
      .eq('id_state', membresiaActiva.id_state);

    if (err2) throw new Error(err2.message);

    return { success: true };
    
  } catch (error: any) {
    console.error('Error cancelarMembresiaUsuario:', error.message);
    throw error;
  }
}

export async function extenderMembresiaUsuario(
  supabase_id: string,
  diasAdicionales: number
) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Buscar membresía activa por user_id
    const { data: membresiaActiva, error: err1 } = await supabase
      .from('MembershipState')
      .select('id_state, fecha_fin')
      .eq('user_id', supabase_id)
      .eq('estado', 'ACTIVO')
      .limit(1)
      .maybeSingle();

    if (err1) throw new Error(err1.message);
    
    if (!membresiaActiva) {
      throw new Error('El usuario no tiene membresía activa');
    }

    // Calcular nueva fecha
    const fechaBase = membresiaActiva.fecha_fin ? new Date(membresiaActiva.fecha_fin) : new Date();
    fechaBase.setDate(fechaBase.getDate() + diasAdicionales);

    // Actualizar
    const { error: err2 } = await supabase
      .from('MembershipState')
      .update({ fecha_fin: fechaBase.toISOString() })
      .eq('id_state', membresiaActiva.id_state);

    if (err2) throw new Error(err2.message);

    return { success: true, nuevaFechaFin: fechaBase.toISOString() };
    
  } catch (error: any) {
    console.error('Error extenderMembresiaUsuario:', error.message);
    throw error;
  }
}

// ============================================
// GESTIÓN DE PERFILES POR USUARIO
// ============================================

export async function getPerfilesByUsuario(supabase_id: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('perfil')
      .select('id_perfil, tipo_perfil, nombre, perfil_visible, creado_en, id_categoria')
      .eq('usuario_id', supabase_id)
      .order('creado_en', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
    
  } catch (error: any) {
    console.error('Error getPerfilesByUsuario:', error.message);
    throw error;
  }
}

export async function eliminarPerfil(id_perfil: string) {
  try {
    const supabase = getSupabaseAdmin();
    
    const { error } = await supabase
      .from('perfil')
      .delete()
      .eq('id_perfil', id_perfil);

    // Si falla, probablemente es por restricciones de llave foránea (eventos, solicitudes, etc)
    if (error) {
      if (error.message.includes('foreign key') || error.message.includes('violates foreign key')) {
        throw new Error('No se puede eliminar el perfil porque tiene eventos, solicitudes o datos asociados. Elimina esas dependencias primero.');
      }
      throw new Error(error.message);
    }

    return { success: true };
    
  } catch (error: any) {
    console.error('Error eliminarPerfil:', error.message);
    throw error;
  }
}
export async function getPerfilesByUsuario_2(supabase_id: string): Promise<Perfil[]> {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('perfil')
      .select('*')
      .eq('usuario_id', supabase_id)
      .order('creado_en', { ascending: false });

    if (error) throw new Error(error.message);
    
    // Asegurar que los JSONB no vengan null
    return (data || []).map((p: any) => ({
      ...p,
      artista_data: p.artista_data || {},
      banda_data: p.banda_data || {},
      local_data: p.local_data || {},
      productor_data: p.productor_data || {},
      representante_data: p.representante_data || {},
    })) as Perfil[];
    
  } catch (error: any) {
    console.error('Error getPerfilesByUsuario:', error.message);
    throw error;
  }
}
