'use client';

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Post } from './actions'; 

interface ProjectCardProps {
  post: Post;
}



const Sparks = () => {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary-dark dark:bg-primary-light"
          style={{ boxShadow: "0 0 10px 2px " }}
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

const ProjectCard: React.FC<ProjectCardProps> = ({ post }) => {
  
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);
//  const { t } = useTranslation();

  const hasImages = post.imagenes && post.imagenes.length > 0;
  const defaultImage = hasImages ? post.imagenes[0].url : '/placeholder.jpg';
  const hoverImage = hasImages && post.imagenes.length > 1 ? post.imagenes[1].url : defaultImage;

  return (
    <motion.div 
      className="relative flex flex-col rounded-lg overflow-hidden shadow-lg bg-primary-light/90 dark:bg-background-dark_alt"
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
   
    >
      {hasImages && (
        <div className="relative w-full h-56">
          <AnimatePresence>
            <motion.div
              key={isCardHovered ? hoverImage : defaultImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={isCardHovered ? hoverImage : defaultImage}
                alt={post.titulo}
                fill
                className="object-cover transition-transform duration-500 ease-in-out"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}
      <div className="flex-grow p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-widest text-gray-800 dark:text-white mb-1">{post.titulo}</h3>
          <p className="text-sm tracking-wider font-semibold text-primary-light_alt dark:text-primary-dark/80  mb-4 line-clamp-1">{post.subtitulo}</p>
          <p className="text-gray-700 tracking-wide dark:text-gray-300 text-base line-clamp-2">{post.descripcion}</p>
        </div>
        <motion.a 
          href={`/noticias?id=${post.id}`}
          onMouseEnter={() => setIsLinkHovered(true)}
          onMouseLeave={() => setIsLinkHovered(false)}
          className="relative flex justify-between items-center w-full mt-6 font-bold text-primary-light dark:text-secondary-dark h-12 rounded-md"
        >
          <div className="flex-grow h-[2px] relative bg-primary-light/20 dark:bg-primary-light/20">
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-green-600"
              initial={{ x: "-100%" }}
              animate={{ x: isLinkHovered ? "0%" : "-100%" }}
              transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <AnimatePresence>
                  {isLinkHovered && (
                    <>
                      <motion.div
                        className="w-3 h-3 rounded-full bg-green-700"
                        style={{ boxShadow: "0 0 25px 10px " }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                      <Sparks />
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          <motion.span
            className="ml-4 pr-2 z-10 tracking-wider text-green-700 cursor-pointer"
            variants={{
              rest: { x: 0 },
              hover: { x: [-3, 3, -3, 3, 0] }
            }}
            animate={isLinkHovered ? "hover" : "rest"}
            transition={{ x: { delay: isLinkHovered ? 0.4 : 0, duration: 0.4 } }}
          >
            Ver Noticia
          </motion.span>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default ProjectCard;