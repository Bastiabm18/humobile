'use client'; // Necesario para que Framer Motion funcione en Next.js App Router

import { motion } from 'framer-motion';

const HSign = () => {
  // --- Estilos para el efecto Neón ---
  // Usamos textShadow para crear el resplandor.
  // La sintaxis es: [desplazamiento-x] [desplazamiento-y] [desenfoque] [color]
  // Combinamos un resplandor interior blanco y uno exterior amarillo para un efecto más realista.
 const neonEffect = {
  color: '#FFFFFF', // Texto blanco puro
  textShadow: `
    0 0 7px #ffffff,
    0 0 10px #ffffff,
    0 0 21px #ffffff,
    0 0 42px #a0d8ff,
    0 0 82px #80bfff,
    0 0 92px #66aaff,
    0 0 102px #4d94ff,
    0 0 151px #3388ff
  `,
};
  return (
    <motion.div
      className=" " // Aumenté el tamaño para que se vea mejor
      style={neonEffect}
      // --- Animación de Parpadeo ---
      // Animamos la opacidad para simular un parpadeo o una conexión inestable.
      animate={{
        opacity: [1, 0.1, 0.95, 0.25, 1, 0.9, 1, 0.8, 1,1,0.9,0.99, 1, 0.9, 1, 0.8, 1,1,0.9,0.99,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Secuencia de opacidades
      }}
      transition={{
        duration: 10,           // Duración total de una secuencia de parpadeo
        repeat: Infinity,      // Repetir la animación para siempre
        repeatType: 'loop',    // Tipo de repetición
        ease: 'easeInOut',     // Suaviza el cambio entre opacidades
      }}
    >
      <a href='/' className="bg-cover font-extrabold text-8xl md:text-9xl tracking-wider font-caveat bg-clip-text">
        H
      </a>
    </motion.div>
  );
};

export default HSign;