"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function CustomPointer() {
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      // Ajuste fino: si es la mano, la movemos un poco para que el dedo 
      // coincida con el punto exacto del click
      const offsetX = isHovered ? 10 : 0;
      const offsetY = isHovered ? 2 : 0;
      
      mouseX.set(e.clientX - offsetX);
      mouseY.set(e.clientY - offsetY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Detecta enlaces, botones o cualquier cosa con la clase cursor-pointer
      if (target.closest("button, a, .cursor-pointer, input[type='submit']")) {
        setIsHovered(true);
      }
    };

    const handleOut = () => setIsHovered(false);

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mouseout", handleOut);

    return () => {
      window.removeEventListener("mousemove", moveMouse);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mouseout", handleOut);
    };
  }, [isHovered, mouseX, mouseY]);

  return (
    <motion.div
      className="hidden md:flex fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    >
      {/* CONTENEDOR ANIMAL CON LOGICA DE CAMBIO */}
      <motion.div
        animate={{
          scale: isHovered ? 1.2 : 1,
          rotate: isHovered ? 0 : -15, // El triángulo rota, la mano se queda recta
        }}
        className="relative"
      >
        {isHovered ? (
          /* --- LA MANO DORADA (Hover) --- */
          <img 
            src="/mano-dorada.png" 
            alt="Pointer"
            className="w-15 h-15 object-contain drop-shadow-[0_5px_10px_rgba(234,179,8,0.4)]"
          />
        ) : (
          /* --- EL TRIÁNGULO DORADO (Normal) --- */
          <div
            className="w-6 h-9 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600
                       shadow-[0_5px_15px_rgba(234,179,8,0.4)]"
            style={{
              clipPath: "polygon(0% 0%, 100% 70%, 40% 70%, 0% 100%)",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}