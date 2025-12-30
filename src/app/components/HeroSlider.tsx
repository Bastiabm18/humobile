// components/HeroSlider.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
// motion y AnimatePresence ya no son necesarios para este método, 
// pero se mantienen por si los quieres usar para otros efectos
import { motion, AnimatePresence } from 'framer-motion'; 
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import Image from 'next/image';
import Link from 'next/link';

const desktopSlides = [
  '/desk_slide_1.jpg',
  '/desk_slide_2.jpg',
  '/desk_slide_3.png',
  '/desk_slide_4.png',
];

const mobileSlides = [
  '/mobile_slide_2.jpg',
  '/mobile_slide_3.jpg',
  '/mobile_slide_4.jpg',
  '/mobile_slide_5.jpg',
];

const razones = [
  {
    title: "DESCUBRE TALENTO",
    description: "Explora artistas emergentes asi como artistas globales, sus agendas exclusivas en Humobile, la plataforma que conecta fans con el futuro de la música.",
  },
  {
    title: "AGENDA EN VIVO",
    description: "No te pierdas ningún evento: encuentra fechas de presentaciones, tours y shows en tiempo real con notificaciones personalizadas.",
  },
  {
    title: "LUGARES ICÓNICOS",
    description: "Descubre lugares legendarios y nuevos spots para música en vivo, con mapas interactivos y recomendaciones basadas en tus gustos.",
  },
  {
    title: "COMUNIDAD MUSICAL",
    description: "Únete a fans apasionados, comparte experiencias y crea conexiones en la red definitiva para amantes de la música.",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true); // Nuevo estado para controlar la transición suave
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPaused = useRef(false);

  const currentSlides = isDesktop ? desktopSlides : mobileSlides;
  const slideCount = currentSlides.length;

  // 1. Detección de tamaño de pantalla y reinicio de índice
  useEffect(() => {
    const checkScreenSize = () => {
      // Detección de 'md' (768px)
      const newIsDesktop = window.innerWidth >= 768;
      if (newIsDesktop !== isDesktop) {
        setIsDesktop(newIsDesktop);
        // Reiniciar el índice al cambiar de vista para evitar un índice fuera de rango
        setIndex(0); 
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isDesktop]);

  // Función auxiliar para saltar al inicio sin animación
  const goToFirstSlide = () => {
    // 1. Deshabilitar transición
    setIsTransitioning(false); 
    // 2. Mover el slide al índice 0
    setIndex(0);
    
    // 3. Reactivar la transición después de un tiempo muy corto (async)
    // Esto asegura que el navegador aplique el cambio de 'transform: 0%' antes de reactivar la animación
    setTimeout(() => {
      setIsTransitioning(true);
    }, 50); 
  };

  // 2. Lógica para avanzar diapositiva con bucle suave
  const nextSlide = () => {
    if (slideCount <= 1) return;
    
    const nextIndex = index + 1;

    if (nextIndex >= slideCount) {
      // Si estamos en la última, usa la función para saltar a la primera sin transición
      goToFirstSlide();
    } else {
      // Avanzar normalmente con transición
      setIndex(nextIndex);
    }
  };

  // 3. Lógica para retroceder diapositiva
  const prevSlide = () => {
    if (slideCount <= 1) return;
    
    // Si estamos en la primera, salta a la última sin transición para un loop inverso suave
    if (index === 0) {
      // 1. Deshabilitar transición
      setIsTransitioning(false); 
      // 2. Mover el slide al último índice
      setIndex(slideCount - 1);
      
      // 3. Reactivar la transición
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50); 
    } else {
      // Retroceder normalmente con transición
      setIndex((prev) => prev - 1);
    }
  };

  // 4. AUTO SLIDE - Usa la lógica de nextSlide
  useEffect(() => {
    if (slideCount <= 1) return; 

    intervalRef.current = setInterval(() => {
      if (!isPaused.current) {
        // Usamos la función nextSlide() que ya contiene la lógica de bucle suave
        setIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          if (nextIndex >= slideCount) {
            // Cuando la animación termina y va a comenzar el nuevo ciclo
            goToFirstSlide();
            return 0; // Se vuelve al índice 0 inmediatamente después del salto
          } else {
            return nextIndex;
          }
        });
      }
    }, 4000); 

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slideCount]); // Dependencia en slideCount para que se reajuste al cambiar de desktop/mobile
  
  // Pausar en hover
  const handleMouseEnter = () => {
    isPaused.current = true;
  };

  const handleMouseLeave = () => {
    isPaused.current = false;
  };

  const transitionStyle = isTransitioning 
    ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' 
    : 'none';


  return (
    <section
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* SLIDER CONTINUO */}
      <div className="absolute inset-0">
        
        {/* Desktop */}
        <div className="hidden md:block w-full h-full">
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: transitionStyle, // Aplica el estilo condicional
            }}
          >
            {desktopSlides.map((src, i) => (
              <div key={i} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0} // Solo prioridad para la primera imagen
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden w-full h-full">
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: transitionStyle, // Aplica el estilo condicional
            }}
          >
            {mobileSlides.map((src, i) => (
              <div key={i} className="relative w-full h-full flex-shrink-0">
                <Image
                  src={src}
                  alt={`Slide ${i + 1}`}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAPA OSCURA */}
      <div className="absolute inset-0 bg-black/20 z-10" />

{/* TEXTO CENTRADO DINÁMICO */}
<div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-6">
  <AnimatePresence mode="wait">  {/* Para fade out/in suave */}
    <motion.div
      key={index} 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}   
      transition={{ duration: 0.5, ease: 'easeInOut' }}  
      className="w-auto md:max-w-3xl max-w-[70vw] px-4 py-6 md:px-8 md:py-8  border-white bg-black/10 backdrop-blur-xs rounded-lg"
    >
      {/* Título de la razón */}
      <h3 className="text-4xl md:text-6xl font-bold text-white tracking-wider mb-4">
        {razones[index].title}
      </h3>
      
      {/* Descripción corta */}
      <p className="text-lg md:text-2xl text-white/80 mb-6 max-w-md mx-auto">
        {razones[index].description}
      </p>
      
      {/* Botón ÚNETE */}
      <Link href="/login">  {/* Cambiá a /dashboard si es para usuarios logueados */}
        <motion.button
          whileHover={{ scale: 1.05 }}  
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-sky-500/70 text-black font-bold rounded-full hover:bg-sky-500/90 transition"
        >
          SE PARTE DE HUMOBILE
        </motion.button>
      </Link>
    </motion.div>
  </AnimatePresence>
</div>

      {/* BOTONES */}
      {slideCount > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
            aria-label="Anterior"
          >
            <HiChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition"
            aria-label="Siguiente"
          >
            <HiChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* INDICADORES - Mapea el array correcto */}
      {slideCount > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {currentSlides.map((_, i) => (
            <button
              key={i}
              // El setIndex en el indicador debe reactivar la transición si fue desactivada
              onClick={() => {
                setIsTransitioning(true);
                setIndex(i);
              }}
              className={`w-2 h-2 rounded-full transition ${
                i === index ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}