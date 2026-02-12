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
      // No restamos la mitad del tamaño para que la "punta" 
      // del triángulo coincida exactamente con el click
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, a, .cursor-pointer")) setIsHovered(true);
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
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: cursorX,
        y: cursorY,
        // Rotamos un poco para que parezca un puntero real (apuntando arriba-izquierda)
        rotate: -15, 
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.5 : 1,
          rotate: isHovered ? 15 : 0, // Se endereza al hacer hover
        }}
        className={`w-6 h-9 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600
          shadow-[0_5px_15px_rgba(234,179,8,0.4)]`}
        style={{
          // Este es el "recorte" para formar el triángulo alargado (estilo flecha)
          clipPath: "polygon(0% 0%, 100% 70%, 40% 70%, 0% 100%)",
        }}
      />
    </motion.div>
  );
}