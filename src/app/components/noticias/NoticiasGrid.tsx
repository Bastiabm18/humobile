'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaSpinner } from 'react-icons/fa';
import ProjectCard from './NoticiaCard';
import { getPosts, Post } from './actions'; // Asegúrate que la ruta a 'actions.ts' es correcta
import { FaRegNewspaper } from 'react-icons/fa6';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const Sparks = () => {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full "
          style={{
            boxShadow: "0 0 10px 2px",
          }}
          initial={{ y: 0, x: 0, scale: 0.5 }}
          animate={{
            y: [0, -Math.random() * 60 - 30, 100],
            x: (Math.random() - 0.5) * 120,
            scale: Math.random() * 1.2,
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 0.6 + 0.8,
            ease: ["easeOut", "easeIn"],
          }}
        />
      ))}
    </>
  );
};

export default function NoticiasGrid() {

  const [isHovered, setIsHovered] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Se usa useEffect para obtener los datos en el lado del cliente, igual que en tu FAQ.tsx
  useEffect(() => {
    async function loadPosts() {
      try {
        const fetchedPosts = await getPosts();
        // Guardamos solo los primeros 6
        setPosts(fetchedPosts.slice(0, 6)); 
      } catch (error) {
        console.error("Falló la carga de posts", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // Muestra un spinner mientras los datos están cargando
  if (loading) {
    return (
      <section className="w-screen min-h-screen flex justify-center items-center ">
        <FaSpinner className="animate-spin text-4xl " />
      </section>
    );
  }
const fadeInUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const } // sin as const typescript adivina que: LLORA!
});
  // No renderiza nada si, después de cargar, no hay posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-between flex-col gap-5">
      <motion.h1 {...fadeInUp(0)} className="text-4xl md:text-5xl flex items-center justify-center gap-3 font-bold text-gray-400">
          <FaRegNewspaper size={32} className="text-green-800" />
          Lo Último En Humobile
        </motion.h1>

    <section 
    
      className="w-full flex flex-col items-center justify-center "
    >
      {/* Grid de Proyectos */}
      <motion.div
        className="w-full max-w-[90vw] items-center justify-center p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map(post => (
          <ProjectCard key={post.id} post={post} />
        ))}
      </motion.div>

      {/* Link de "Ver más proyectos" */}
      <div className="w-full max-w-[90vw] mt-16">
        <Link href={`/noticias?id=`} >
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex justify-between items-center w-full h-12 font-bold  rounded-md"
          >
            <div className="flex-grow h-[2px] relative ">
             
            </div>
            <motion.span
              className="ml-4 pr-2 z-10 text-3xl text-green-700 cursor-pointer"
              variants={{
                rest: { x: 0 },
                hover: { x: [-3, 3, -3, 3, 0] }
              }}
              animate={isHovered ? "hover" : "rest"}
              transition={{
                x: { delay: isHovered ? 0.4 : 0, duration: 0.4 }
              }}
            >
              ver más Noticias
              <FaArrowRight className="inline-block ml-2" />
            </motion.span>
          </motion.div>
        </Link>
      </div>
    </section>
      </div>
  );
};