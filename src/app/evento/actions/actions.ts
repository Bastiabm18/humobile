// app/actions/eventosActions.ts
'use server';

import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { EventoCalendario } from "@/types/profile";

export async function getEventoById(eventoId: string): Promise<EventoCalendario> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { data, error } = await supabaseAdmin
      .rpc('obtener_evento_completo', {
        p_evento_id: eventoId
      })
      .single(); 

    if (error) {
      console.error('Error obteniendo evento:', error);
      throw new Error(error.message);
    }

    return data as EventoCalendario;
  } catch (error: any) {
    console.error('Error en getEventoById:', error);
    throw error;
  }
}