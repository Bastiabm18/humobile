"use server"
import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";

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
      .eq('nombre', 'PREMIUM')
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