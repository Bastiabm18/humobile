"use server"


import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { UserData } from '@/types/profile';



export async function getUserData(uid: string): Promise<UserData> {
  const supabase = getSupabaseAdmin();
  
  const { data, error } = await supabase
    .rpc('get_user_with_membresia', {
      p_supabase_id: uid
    });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error('Usuario no encontrado');
  }

 
  return data[0] as UserData;
}

export async function actualizarRutUsuario(uid: string, rut: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  // Validar que el RUT tenga el formato correcto (con guión)
  if (!rut.includes('-')) {
    throw new Error('El RUT debe incluir guión (ej: 12.345.678-9)');
  }

  // Validar longitud mínima del RUT formateado
  const rutSinPuntos = rut.replace(/\./g, '');
  if (rutSinPuntos.length < 9 || rutSinPuntos.length > 10) {
    throw new Error('RUT inválido');
  }

  // Actualizar el campo rut_usuario en la tabla User
  const { error } = await supabase
    .from('User')
    .update({ 
      rut_usuario: rut,  // Guardamos exactamente como viene, con formato completo
      updatedAt: new Date().toISOString()
    })
    .eq('supabase_id', uid);

  if (error) {
    console.error('Error al actualizar RUT:', error);
    throw new Error(`Error al actualizar RUT: ${error.message}`);
  }
}