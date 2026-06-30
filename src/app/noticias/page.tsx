'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaArrowLeft, FaSpinner, FaSearch, FaPlus, FaDownload } from 'react-icons/fa';
import { getPosts, getPostById } from "./actions";

import { FormState, Post } from '@/types/profile';
import NeonSign from '../components/NeonSign';


// ===================================================================
// Componente para la VISTA DE DETALLE de un solo post
// ===================================================================
function ProjectDetailView({ post }: { post: Post }) {
  const router = useRouter();
  const [mainImage, setMainImage] = useState(post.imagenes.length > 0 ? post.imagenes[0] : null);
  
    

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.button 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/`)} 
        className="flex items-center gap-2 mb-8 text-neutral-300 font-bold"
      >
        <FaArrowLeft /> Inicio
      </motion.button>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
    

        {/* Columna Derecha: Galería */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="lg:col-span-3"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mainImage ? mainImage.url : 'no-image'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="relative w-full aspect-[4/3] rounded-lg shadow-2xl overflow-hidden mb-4"
            >
              {mainImage ? (
                <>
                <Image src={mainImage.url} alt={post.titulo} fill className=" object-contain" priority />
                <a 
                  href={mainImage.url} 
                  download 
                  target='_blank'
                  title='DESCARGAR IMAGEN'
                  
                  className="absolute top-4 right-4 z-10 px-4 py-4 bg-neutral-400  text-white font-semibold rounded-full animate-pulse hover:bg-secondary-dark/90 transition shadow-lg"
                >
                  <FaDownload />
                </a>
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-neutral-500">No hay imágenes disponibles</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {post.imagenes.length > 1 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {post.imagenes.map((img) => (
                <button key={img.url} onClick={() => setMainImage(img)}
                  className={`relative aspect-square rounded-md overflow-hidden transition-all duration-300 ${mainImage?.url === img.url ? 'ring-2 ring-offset-2 ring-offset-gray-100  ring-secondary-dark' : 'opacity-60 hover:opacity-100'}`}
                >
                  <Image src={img.url} alt={`Miniatura de ${post.titulo}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

            {/* Columna Izquierda: Detalles */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-2 flex flex-col pt-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-300 leading-tight">{post.titulo}</h1>
          <p className="mt-4 text-xl font-semibold text-neutral-300">{post.subtitulo}</p>
          <div className="mt-8 text-neutral-400 text-base leading-relaxed whitespace-pre-wrap">{post.descripcion}</div>
        </motion.div>
      </div>


      <div className='w-full  flex items-center justify-center p-10'>
          {post.contenido ? (
            <div className="mt-8">
              <div
                
                // Utiliza dangerouslySetInnerHTML para inyectar la cadena HTML completa del iframe
                dangerouslySetInnerHTML={{ __html: post.contenido }}
              />
            </div>
          ) :
           (<></>)
           }
      </div>

            <motion.button 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/noticias?id=`)} 
        className="flex text-right items-center justify-end w-full gap-2 mt-8 text-secondary-dark font-bold"
      >
        <FaPlus /> Ver Más Noticias
      </motion.button>
    </motion.div>
  );
}

// ===================================================================
// Componente para la VISTA DE GRILLA con todos los posts y filtro
// ===================================================================
function ProjectsGridView({ allPosts }: { allPosts: Post[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const filteredPosts = allPosts.filter(post => 
      post.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-20">

     <motion.button 
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           onClick={() => router.push(`/`)} 
          className="flex items-center gap-2 mt-8 text-secondary-dark font-bold"
      >
        <FaArrowLeft /> Inicio
      </motion.button>
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4 text-neutral-300">Humobile Noticias</h1>
        <p className="text-lg text-center text-neutral-400 max-w-3xl mx-auto mb-12">Enterate de que pasa en el mundo Humobile</p>
        
        {/* Barra de Búsqueda */}
        <div className="relative mb-12 max-w-lg mx-auto">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full  border-2 border-neutral-300   focus:ring-0 rounded-lg py-3 pl-12 pr-4 transition"
          />
        </div>

        {/* Grilla de Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPosts.map(post => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => router.push(`/noticias?id=${post.id}`)}
                className="bg-green-900/10 rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="relative w-full h-56">
                  {post.imagenes.length > 0 ? (
                    <Image src={post.imagenes[0].url} alt={post.titulo} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-300"></div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-neutral-300">{post.titulo}</h3>
                  <p className="text-neutral-300 mt-1">{post.subtitulo}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredPosts.length === 0 && (
            <p className="text-center text-neutral-500 mt-12">No se encontraron Noticias con ese título.</p>
        )}
      </motion.div>
    );
}

// ===================================================================
// Componente Principal que decide qué vista mostrar
// ===================================================================
function ProjectPageContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(false);
      try {
        if (postId) {
          // Si hay ID, carga solo ese post
          const fetchedPost = await getPostById(postId);
          if (fetchedPost) {
            setPost(fetchedPost);
          } else {
            setError(true); // El post con ese ID no fue encontrado
          }
        } else {
          // Si no hay ID, carga todos los posts para la grilla
          const fetchedAllPosts = await getPosts();
          setAllPosts(fetchedAllPosts);
        }
      } catch (err) {
        console.error("Error al cargar los datos:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [postId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center ">
        <NeonSign />
      </div>
    );
  }

  if (error) {
     return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center ">
        <p className="text-xl text-neutral-600">Noticia no encontrada o ID inválido.</p>
        <button onClick={() => window.location.href=`/noticias?id=`} className="mt-4 flex items-center gap-2 px-4 py-2 bg-secondary-dark text-white rounded-md hover:bg-opacity-80">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  // Decide qué vista renderizar
  return (
    <main className="w-full min-h-screen  text-neutral-300 mt-20 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {postId && post ? (
            <motion.div key="detail">
              <ProjectDetailView post={post} />
            </motion.div>
          ) : (
            <motion.div key="grid">
              <ProjectsGridView allPosts={allPosts} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}


// Usamos Suspense para que useSearchParams funcione correctamente
export default function ProjectPage() {
    return (
        <Suspense fallback={
            <div className="w-full min-h-screen flex items-center justify-center mt-20">
               <NeonSign/>
            </div>
        }>
            <ProjectPageContent />
        </Suspense>
    )
}