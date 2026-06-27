'use server';

import { revalidatePath } from 'next/cache';
// 1. Tu patrón de Supabase
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FormState, Post } from '@/types/profile';
// 2. Tus tipos centralizados


/**
 * Obtiene todos los posts de la tabla, ordenados por fecha descendente.
 */
export async function getPosts(): Promise<Post[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    const { data, error } = await supabase
      .from('publicacion')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(item => ({
      id: item.id,
      titulo: item.titulo || '',
      subtitulo: item.subtitulo || '',
      descripcion: item.descripcion || '',
      contenido: item.contenido || '',
      fecha: item.fecha,
      imagenes: item.imagenes || [],
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Obtiene un único post por su ID.
 */
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const supabase = getSupabaseBrowser();
    
    const { data, error } = await supabase
      .from('publicacion')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      titulo: data.titulo || '',
      subtitulo: data.subtitulo || '',
      descripcion: data.descripcion || '',
      contenido: data.contenido || '',
      fecha: data.fecha,
      imagenes: data.imagenes || [],
    };
  } catch (error) {
    console.error(`Error al obtener el post con ID ${id}:`, error);
    return null;
  }
}

/**
 * Crea o actualiza un post en Supabase y sube las imágenes al Storage.
 */
export async function createOrUpdatePost(formData: FormData): Promise<FormState> {
  const supabase = getSupabaseBrowser();
  const storage = supabase.storage.from('posts');

  const postId = formData.get('postId') as string | null;
  const rawData = {
    titulo: formData.get('titulo') as string,
    subtitulo: formData.get('subtitulo') as string,
    descripcion: formData.get('descripcion') as string,
    contenido: formData.get('contenido') as string || '',
  };

  try {
    const newImages: { url: string; path: string }[] = [];
    const files = formData.getAll('imagenes') as File[];

    // 1. Subir nuevas imágenes
    for (const file of files) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const path = `${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await storage.upload(path, buffer, {
          contentType: file.type,
          upsert: false
        });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = storage.getPublicUrl(path);
        newImages.push({ url: publicUrlData.publicUrl, path });
      }
    }

    let result;

    if (postId) {
      // 2A. ACTUALIZAR: Buscar imágenes existentes para concatenarlas
      const { data: existingPost, error: fetchError } = await supabase
        .from('publicacion')
        .select('imagenes')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      const currentImages = existingPost?.imagenes || [];
      const finalImages = [...currentImages, ...newImages];

      result = await supabase
        .from('publicacion')
        .update({ ...rawData, imagenes: finalImages })
        .eq('id', postId)
        .select()
        .single();

    } else {
      // 2B. CREAR: Insertamos con las imágenes nuevas
      result = await supabase
        .from('publicacion')
        .insert([{ ...rawData, imagenes: newImages }])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    const savedPost: Post = {
      id: result.data.id,
      titulo: result.data.titulo,
      subtitulo: result.data.subtitulo,
      descripcion: result.data.descripcion,
      contenido: result.data.contenido || '',
      fecha: new Date(result.data.fecha).toISOString(),
      imagenes: result.data.imagenes || [],
    };

    revalidatePath('/dashboard/publicacion');
    revalidatePath('/projects'); // Para que se actualice la grilla pública también
    return { success: true, message: 'Publicación guardada con éxito.', post: savedPost };
    
  } catch (error: any) {
    console.error('Error saving post:', error);
    return { success: false, message: error.message || 'Error al guardar la publicación.' };
  }
}

/**
 * Elimina un post y sus imágenes asociadas.
 */
export async function deletePost(postId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseBrowser();
    const storage = supabase.storage.from('posts');

    // 1. Obtener imágenes para borrar del Storage
    const { data: post, error: fetchError } = await supabase
      .from('publicacion')
      .select('imagenes')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Borrar imágenes del bucket
    if (post?.imagenes?.length > 0) {
      const pathsToDelete = post.imagenes.map((img: { path: string }) => img.path);
      const { error: deleteStorageError } = await storage.remove(pathsToDelete);
      if (deleteStorageError) console.error('Error borrando imágenes:', deleteStorageError);
    }

    // 3. Borrar fila de la tabla
    const { error: deleteDbError } = await supabase
      .from('publicacion')
      .delete()
      .eq('id', postId);

    if (deleteDbError) throw deleteDbError;

    revalidatePath('/dashboard/publicacion');
    revalidatePath('/projects');
    return { success: true, message: 'Publicación eliminada.' };
    
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return { success: false, message: error.message || 'No se pudo eliminar la publicación.' };
  }
}