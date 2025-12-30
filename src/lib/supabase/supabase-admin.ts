import { createClient } from '@supabase/supabase-js';

// Se utiliza una función para asegurar que el cliente se inicialice correctamente en el servidor.
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

  if (!supabaseUrl || !supabaseKey) {
    // Validamos que las variables existan. Si esta clave falta, el cliente no funcionará.
    throw new Error('Faltan variables de entorno de Supabase para el cliente Admin.');
  }

  // Se crea el cliente de Supabase usando la clave de servicio (Service Role Key)
  // lo que le otorga privilegios de administrador (¡por eso se llama "admin"!) 
  // para leer y escribir roles en la base de datos (tabla 'User').
  return createClient<any>(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false, // Esto es vital en el servidor.
      },
    }
  );
}