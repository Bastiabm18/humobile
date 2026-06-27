'use server';

// 1. Usamos tu patrón de Supabase en vez de Firebase
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

export interface Post {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string;
  imagenes: { url: string; path: string }[];
}

export async function getPosts(): Promise<Post[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    // 2. Consultamos la tabla 'publicacion' ordenada por fecha descendente
    const { data, error } = await supabase
      .from('publicacion')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }

    // 3. Mapeamos la respuesta. 
    // Supabase ya devuelve la fecha como string ISO, así que no hay que hacer cálculos raros con _seconds
    return data.map(item => ({
      id: item.id,
      titulo: item.titulo || '',
      subtitulo: item.subtitulo || '',
      descripcion: item.descripcion || '',
      fecha: item.fecha, 
      imagenes: item.imagenes || [],
    }));
    
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return []; // Devolvemos array vacío para no romper el frontend
  }
}