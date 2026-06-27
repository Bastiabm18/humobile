'use client';

import { useState } from 'react';

import { FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/types/profile';
import { deletePost } from '../actions/actions';


interface PostsTableProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onPostDeleted: (postId: string) => void;
}

export default function PostsTable({ posts, onEdit, onPostDeleted }: PostsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDeleteModal = (postId: string) => {
    setDeletingId(postId);
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    setModalOpen(false);
    setDeletingId(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const result = await deletePost(deletingId);
    if (result.success) {
      onPostDeleted(deletingId);
    } else {
      alert(result.message); 
    }
    setIsDeleting(false);
    closeDeleteModal();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className=" p-6 rounded-lg shadow-md overflow-x-auto w-[90vw] md:w-[80vw]"
      >
        <h2 className="text-2xl font-bold mb-4 text-neutral-300">Noticias Existentes</h2>
        <table className="w-full text-sm text-left text-neutral-500 ">
          <thead className="text-xs text-neutral-300 uppercase bg-neutral-700 ">
            <tr>
              <th scope="col" className="px-6 py-3">Título</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3">Imágenes</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="bg- border-b border-neutral-300 ">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{post.titulo}</td>
                <td className="px-6 py-4">{new Date(post.fecha).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    {post.imagenes.slice(0, 3).map(img => (
                      <Image key={img.url} src={img.url} alt="thumbnail" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                    ))}
                    {post.imagenes.length > 3 && (
                      <span className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white dark:border-gray-800">
                        +{post.imagenes.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 flex items-center gap-4">
                  <button onClick={() => onEdit(post)} className="text-blue-500 hover:text-blue-700"><FaEdit size={18} /></button>
                  <button onClick={() => openDeleteModal(post.id)} className="text-red-500 hover:text-red-700"><FaTrash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal de Confirmación */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-background-dark rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar Eliminación</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                ¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex justify-end gap-4">
                <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 flex items-center">
                  {isDeleting && <FaSpinner className="animate-spin mr-2" />}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
