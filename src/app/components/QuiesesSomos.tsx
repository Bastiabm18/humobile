'use client';

import { motion } from 'framer-motion';
import { MdEmojiPeople, MdEventAvailable, MdStars } from 'react-icons/md';
import { quienesSomosData } from '../constants/quienesSomos';
// Animación reutilizable para no repetir código
const fadeInUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6, delay, ease: 'easeOut' as const } // sin as const typescript adivina que: LLORA!
});

export default function QuienesSomos() {
  const { parrafos, seccionAgenda, pilares } = quienesSomosData;

  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-20">
      
      {/* ========================================= */}
      {/* 1. QUIENES SOMOS                          */}
      {/* ========================================= */}
      <div className="text-center space-y-8">
        <motion.h1 {...fadeInUp(0)} className="text-4xl md:text-5xl flex items-center justify-center gap-3 font-bold text-gray-400">
          <MdEmojiPeople size={32} className="text-sky-600" />
          {quienesSomosData.titulo}
        </motion.h1>

        {parrafos.map((texto, index) => (
          <motion.p 
            key={index} 
            {...fadeInUp(0.2 * (index + 1))} // Delay escalonado
            className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto"
          >
            {texto}
          </motion.p>
        ))}
      </div>

      {/* ========================================= */}
      {/* 2. SOFTWARE DE AGENDAMIENTO              */}
      {/* ========================================= */}
      <div className="space-y-10">
        <motion.h2 {...fadeInUp(0)} className="text-3xl md:text-4xl font-bold text-center text-sky-500 uppercase tracking-wider flex items-center justify-center gap-3">
          <MdEventAvailable size={36} />
          {seccionAgenda.titulo}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seccionAgenda.subsecciones.map((item, index) => (
            <motion.div 
              key={index}
              {...fadeInUp(0.1 * index)}
              className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 hover:border-sky-600/50 transition-colors duration-300"
            >
              <h3 className="text-xl font-semibold text-sky-400 mb-3">
                {item.subtitulo}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {item.texto}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ========================================= */}
      {/* 3. PILARES ESTRATÉGICOS                   */}
      {/* ========================================= */}
      <div className="space-y-10">
        <motion.h2 {...fadeInUp(0)} className="text-3xl md:text-4xl font-bold text-center text-green-500 uppercase tracking-wider flex items-center justify-center gap-3">
          <MdStars size={36} />
          {pilares.titulo}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pilares.items.map((item, index) => (
            <motion.div 
              key={index}
              {...fadeInUp(0.1 * index)}
              // El último item (Valores) ocupa todo el ancho si quieres, o queda en grid. Aquí lo dejamos en grid normal.
              className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-green-400 mb-4 border-b border-neutral-800 pb-2">
                {item.nombre}
              </h3>
              
              {/* Si es lista (VALORES), iteramos. Si es texto normal, mostramos párrafo */}
              {'esLista' in item && item.esLista ? (
                <ul className="space-y-3">
                  {item.lista.map((valor, i) => (
                    <li key={i} className="flex items-start text-gray-300">
                      <span className="text-green-500 mr-3 mt-1">•</span>
                      <span className="leading-relaxed">{valor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-300 leading-relaxed text-lg">
                  {item.texto}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}