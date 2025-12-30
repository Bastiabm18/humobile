// components/QuienesSomos.tsx
'use client';

import { motion } from 'framer-motion';

export default function QuienesSomos() {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
      {/* TÍTULO */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl md:text-5xl font-bold text-center text-gray-400 mb-12"
      >
        Quiénes Somos
      </motion.h1>

      {/* PRIMER PÁRRAFO */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="text-lg md:text-xl text-gray-200 leading-relaxed text-center max-w-4xl mx-auto mb-10"
      >
        Somos un equipo dedicado a ofrecer soluciones de agenda personal y compartida para ayudarte a optimizar tu tiempo compatibilizando la eficiencia y tu vida personal.
        Con nuestras herramientas, podrás organizar tu día de forma eficiente, potenciar tu actividad comercial y maximizar tus ingresos.
        Innovación y confiabilidad son los pilares que guían todo lo que hacemos.
      </motion.p>

      {/* SUBTÍTULO */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        className="text-2xl md:text-3xl font-semibold text-center text-gray-400 mb-6 uppercase tracking-wider"
      >
        Software de Agendamiento
      </motion.h2>

      {/* SEGUNDO PÁRRAFO */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
        className="text-lg md:text-xl text-gray-200 leading-relaxed text-center max-w-4xl mx-auto"
      >
        Optimiza tu tiempo, potencia tu negocio y alcanza tus metas.
        Somos un equipo apasionado por ayudarte a organizar tu día con una agenda personal y compartida que se adapta a tu ritmo.
        Con nuestras soluciones, podrás gestionar tu tiempo de forma inteligente, impulsar tu actividad comercial y maximizar tus ingresos.
        Innovación, confianza y resultados reales: eso es lo que nos mueve.
      </motion.p>
    </section>
  );
}