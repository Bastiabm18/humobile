'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { FaPlus, FaTimes, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types/profile';
import { createOrUpdatePost } from '../actions/actions';



interface PostFormProps {
  editingPost: Post | null;
  onCancelEdit: () => void;
  onPostSaved: (savedPost: Post) => void;
}

export default function PostForm({ editingPost, onCancelEdit, onPostSaved }: PostFormProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (editingPost) {
      setPreviews(editingPost.imagenes.map(img => img.url));
      setFiles([]); // Los archivos no se pueden recargar, el usuario debe añadir nuevos si desea.
    } else {
      formRef.current?.reset();
      setPreviews([]);
      setFiles([]);
    }
  }, [editingPost]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(event.target.files || []);
    if (newFiles.length === 0) return;

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);
    formData.delete('imagenes'); // Limpiamos por si acaso
    files.forEach(file => {
      formData.append('imagenes', file);
    });
    
    const result = await createOrUpdatePost(formData);
    
    if (result.success && result.post) {
      onPostSaved(result.post); // Llama al callback para actualizar la tabla en tiempo real
      formRef.current?.reset();
      setPreviews([]);
      setFiles([]);
      if (editingPost) onCancelEdit(); // Cierra el modo edición si estábamos editando
    }
    
    setMessage(result.message);
    setIsSubmitting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className=" p-6 rounded-lg shadow-md  flex items-center justify-center"
    >
      <div className=" w-[90vw] md:w-[80vw]  flex flex-col items-center justify-center gap-5">

     
      <h2 className="text-2xl font-bold mb-4 text-white">
        {editingPost ? 'Editar Noticia' : 'Crear Nueva Noticia'}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 w-[90vw] md:w-[70vw]">
        <input type="hidden" name="postId" value={editingPost?.id || ''} />
        
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-400">Título</label>
          <input type="text" name="titulo" id="titulo" defaultValue={editingPost?.titulo} required className="mt-1 block w-full px-3 py-2 bg-neutral-800 border border-neutral-200 rounded-md shadow-sm focus:outline-none "/>
        </div>

        <div>
          <label htmlFor="subtitulo" className="block text-sm font-medium text-gray-400">Subtítulo</label>
          <input type="text" name="subtitulo" id="subtitulo" defaultValue={editingPost?.subtitulo} required className="mt-1 block w-full px-3 py-2 bg-neutral-800 border border-neutral-200 rounded-md shadow-sm focus:outline-none "/>
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-400">Descripción</label>
          <textarea name="descripcion" id="descripcion" rows={4} defaultValue={editingPost?.descripcion} required className="mt-1 block w-full px-3 py-2 bg-neutral-800 border border-neutral-200 rounded-md shadow-sm focus:outline-none "></textarea>
        </div>

        <div>
          <label htmlFor="contenido" className="block text-sm font-medium text-gray-400">Enlace</label>
          <input  name="contenido" id="contenido" defaultValue={editingPost?.contenido}  className="mt-1 block w-full px-3 py-2  border rounded-md shadow-sm focus:outline-none bg-neutral-800 border-neutral-200"/>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Imágenes {editingPost ? '(Añadir nuevas)' : ''}
          </label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <AnimatePresence>
              {previews.map((src, index) => (
                <motion.div key={src} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative">
                  <Image src={src} alt={`Preview ${index}`} width={100} height={100} className="w-full h-24 object-cover rounded-md" />
                  <button type="button" onClick={() => removePreview(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs">
                    <FaTimes />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center w-full h-24 border-2 border-dashed  rounded-md text-gray-400   transition-colors"
            >
              <FaPlus size={24} />
            </button>
          </div>
          <input
            type="file"
            name="imagenes"
            ref={fileInputRef}
            multiple
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className=" flex justify-center items-center px-3  py-2 w-[80vw] md:w-[30vw]  text-white rounded-md bg-green-700  disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : 'Publicar Noticia'}
          </button>
          {editingPost && (
            <button type="button" onClick={onCancelEdit} className=" px-4 py-2 w-[80vw] md:w-[30vw] bg-neutral-400 rounded-md hover:bg-gray-300  transition-colors">
              Cancelar
            </button>
          )}
        </div>
        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </form>
     </div>
    </motion.div>
  );
}
