"use server"
import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { MembresiaConPermisos } from "@/types/profile";

export async function insertMembresia(
  userId: string,
  membershipType: 'GRATIS' | 'PREMIUM',
  billingCycle: 'monthly' | 'yearly'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Obtener el id de la membresía PREMIUM
    const { data: membershipData, error: membershipError } = await supabaseAdmin
      .from('Membership')
      .select('id_membership, duracion_dias')
      .eq('nombre', membershipType)
      .single();
    
    if (membershipError || !membershipData) {
      throw new Error('No se encontró la membresía PREMIUM');
    }
    
    // Calcular fecha_fin según el ciclo de facturación
    const fechaInicio = new Date();
    let fechaFin: Date | null = null;
    
    if (billingCycle === 'monthly') {
      fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + 1);
    } else if (billingCycle === 'yearly') {
      fechaFin = new Date(fechaInicio);
      fechaFin.setFullYear(fechaFin.getFullYear() + 1);
    }
    
    // Insertar en MembershipState
    const { data, error } = await supabaseAdmin
      .from('MembershipState')
      .insert([
        {
          user_id: userId,
          membership_id: membershipData.id_membership,
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin ? fechaFin.toISOString() : null,
          estado: 'ACTIVO'
        }
      ])
      .select();
    
    if (error) {
      console.error('Error insertando membresía:', error);
      throw new Error(`Error al insertar membresía: ${error.message}`);
    }
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Error en insertMembresia:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al procesar la membresía' 
    };
  }
}

export async function getMembbresias() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('Membership')
      .select('*')
      .order('precio_mensual', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching memberships:', error);
    return { success: false, error: error.message };
  }
}

export async function eliminarMembresia(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('MembershipState')
      .update({ estado: 'CANCELADO', fecha_fin: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('estado', 'ACTIVO'); // Solo actualiza la membresía activa
    if (error) {
      console.error('Error cancelando membresía:', error);
      throw new Error(`Error al cancelar membresía: ${error.message}`);
    }
    return { success: true };
  } catch (error: any) {
    console.error('Error en eliminarMembresia:', error);
    return { 
      success: false, 
      error: error.message || 'Error desconocido al cancelar la membresía' 
    };
  }
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

export async function registrarCobroTransbank(data: {
  token_ws: string;
  perfil_id: string;
  plan_nombre: string;
  monto: number;
  estado_transaccion: string;
  codigo_autorizacion?: string;
  orden_compra?: string;
  fecha_fin: string;
}) {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase.from('cobro_transbank').insert({
    token_ws: data.token_ws,
    perfil_id: data.perfil_id,
    plan_nombre: data.plan_nombre,
    monto: data.monto,
    estado_transaccion: data.estado_transaccion,
    codigo_autorizacion: data.codigo_autorizacion || null,
    orden_compra: data.orden_compra || null,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: data.fecha_fin
  });

  if (error) {
    console.error('Error guardando historial de cobro:', error);
    return { success: false };
  }

  return { success: true };
}