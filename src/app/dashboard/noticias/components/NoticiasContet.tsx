'use client';

import { useState } from 'react';
import PostForm from './PostForm';
import PostsTable from './PostTable';
import { Post } from '@/types/profile';

interface NoticiasContentProps {
  initialPosts: Post[];
}

export default function NoticiasContent({ initialPosts }: NoticiasContentProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  //  FIX: Se reintroduce esta función.
  // Actualiza el estado local para que la tabla se refresque en tiempo real.
  const handlePostSaved = (savedPost: Post) => {
    if (editingPost) {
      // Si estábamos editando, reemplazamos el post antiguo por el nuevo.
      setPosts(posts.map(p => p.id === savedPost.id ? savedPost : p));
    } else {
      // Si es un post nuevo, lo añadimos al principio de la lista.
      setPosts([savedPost, ...posts]);
    }
    setEditingPost(null); // Limpia el formulario después de guardar.
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
  };

  return (
    <div className="space-y-8">
      <PostForm 
        editingPost={editingPost}
        onCancelEdit={handleCancelEdit}
        onPostSaved={handlePostSaved} // FIX: Se vuelve a pasar la prop al formulario.
      />
      <PostsTable 
        posts={posts}
        onEdit={handleEdit}
        onPostDeleted={(postId) => setPosts(posts.filter(p => p.id !== postId))}
      />
    </div>
  );
}
