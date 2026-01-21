"use server"

import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { EventoCalendario, IntegranteBandaEvento } from "@/types/profile";

// app/actions/actions.ts
export async function obtenerEventosBusqueda(): Promise<EventoCalendario[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Llamar a la función PostgreSQL que creamos
    const { data: eventosDB, error } = await supabaseAdmin
      .rpc('obtener_eventos_buscador');

    if (error) {
      console.error(' Error al llamar a obtener_eventos_buscador:', error);
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

    return eventosDB

  } catch (error: any) {
    console.error('Error en obtenerEventosBusqueda:', error);
    throw error;
  }
}