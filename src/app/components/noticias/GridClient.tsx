'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import ProjectCard from './NoticiaCard';
import { Post } from './actions'; 

export default function GridClient({ posts }: { posts: Post[] }) {

  const [isHovered, setIsHovered] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const Sparks = () => (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full "
          style={{ boxShadow: "0 0 10px 2px" }}
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

  return (
    <section 
      id="proyectos" 
      className="w-screen min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 "
    >
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

      <div className="w-full max-w-[90vw] mt-16">
        <Link href={`/noticias`} >
          <motion.p
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex justify-between items-center w-full h-12 font-bold text-primary-light "
          >
            <div className="flex-grow h-[2px] relative ">
              <motion.div
                className="absolute top-0 left-0 w-full h-full "
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "0%" : "-100%" }}
                transition={{ duration: 1.0, ease: [0.7, 0, 0.3, 1] }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <AnimatePresence>
                    {isHovered && (
                      <>
                        <motion.div
                          className="w-3 h-3 rounded-full "
                          style={{ boxShadow: "0 0 25px 10px" }}
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
              className="ml-4 pr-2 z-10 text-3xl cursor-pointer"
              variants={{
                rest: { x: 0 },
                hover: { x: [-3, 3, -3, 3, 0] }
              }}
              animate={isHovered ? "hover" : "rest"}
              transition={{ x: { delay: isHovered ? 0.4 : 0, duration: 0.4 } }}
            >
              Ver más Noticias
              <FaArrowRight className="inline-block ml-2" />
            </motion.span>
          </motion.p>
        </Link>
      </div>
    </section>
  );
}