'use server';

import { revalidatePath } from 'next/cache';
// Usamos exactamente el mismo import que usas en tus FAQs
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { FormState, Post } from '@/types/profile';


// --- OBTENER TODAS LAS news
export async function getPosts(): Promise<Post[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    const { data, error } = await supabase
      .from('publicacion')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      titulo: item.titulo,
      subtitulo: item.subtitulo,
      descripcion: item.descripcion,
      contenido: item.contenido || '',
      fecha: new Date(item.fecha).toISOString(),
      imagenes: item.imagenes || [],
    })) as Post[];
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    throw new Error('No se pudieron obtener las publicaciones.');
  }
}

// --- CREAR O ACTUALIZAR UNA PUBLICACIÓN ---
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

    // 1. Subimos las nuevas imágenes al Storage
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
      // 2A. ACTUALIZAR: Buscamos imágenes existentes para no borrarlas
      const { data: existingPost, error: fetchError } = await supabase
        .from('publicacion')
        .select('imagenes')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      const currentImages = existingPost?.imagenes || [];
      const finalImages = [...currentImages, ...newImages];

      // Actualizamos con las imágenes viejas + nuevas
      result = await supabase
        .from('publicacion')
        .update({ ...rawData, imagenes: finalImages })
        .eq('id', postId)
        .select()
        .single();

    } else {
      // 2B. CREAR: Insertamos directamente
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
    return { success: true, message: 'Publicación guardada con éxito.', post: savedPost };
    
  } catch (error: any) {
    console.error('Error saving post:', error);
    return { success: false, message: error.message || 'Error al guardar la publicación.' };
  }
}

// --- ELIMINAR UNA PUBLICACIÓN ---
export async function deletePost(postId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseBrowser();
    const storage = supabase.storage.from('posts');

    // 1. Obtenemos las imágenes para borrarlas del Storage
    const { data: post, error: fetchError } = await supabase
      .from('publicacion')
      .select('imagenes')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    // 2. Borramos las imágenes del bucket
    if (post?.imagenes?.length > 0) {
      const pathsToDelete = post.imagenes.map((img: { path: string }) => img.path);
      const { error: deleteStorageError } = await storage.remove(pathsToDelete);
      if (deleteStorageError) console.error('Error borrando imágenes:', deleteStorageError);
    }

    // 3. Borramos la fila de la tabla
    const { error: deleteDbError } = await supabase
      .from('publicacion')
      .delete()
      .eq('id', postId);

    if (deleteDbError) throw deleteDbError;

    revalidatePath('/dashboard/publicacion');
    return { success: true, message: 'Publicación eliminada.' };
    
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return { success: false, message: error.message || 'No se pudo eliminar la publicación.' };
  }
}