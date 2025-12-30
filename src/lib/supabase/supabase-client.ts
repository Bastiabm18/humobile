import { createBrowserClient } from '@supabase/ssr';

// Función para inicializar el cliente que maneja automáticamente las cookies del navegador.
export function getSupabaseBrowser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan variables de entorno de Supabase públicas.");
  }

  // Usamos <any> para evitar el error de tipado de la DB.
  return createBrowserClient<any>(
    supabaseUrl,
    supabaseKey,

     {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
}