// app/actions/eventosActions.ts
'use server';

import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function getEventoById(eventoId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Obtener el evento principal
    const { data:evento, error:eventoError } = await supabaseAdmin
      .rpc('obtener_evento_completo', {
        p_evento_id: eventoId
      })
      .single();

    if (eventoError) {
      console.error('Error obteniendo evento:', eventoError);
      throw new Error(eventoError.message);
    }

   
    return evento;
  } catch (error: any) {
    console.error('Error en getEventoById:', error);
    throw error;
  }
}