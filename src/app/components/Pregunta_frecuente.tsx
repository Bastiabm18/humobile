// @/components/pregunta_frecuente.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaQuestionCircle, FaSearch } from 'react-icons/fa';
import { getPreguntasFrecuentes } from '../actions/actions';
import { pregunta_frecuente } from '@/types/externo';
import NeonSign from './NeonSign';

export default function PreguntaFrecuente() {
  const [preguntasFrecuentes, setPreguntasFrecuentes] = useState<pregunta_frecuente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [indiceAbierto, setIndiceAbierto] = useState<number | null>(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [preguntasFiltradas, setPreguntasFiltradas] = useState<pregunta_frecuente[]>([]);

  useEffect(() => {
    async function cargarPreguntasFrecuentes() {
      setCargando(true);
      try {
        const data = await getPreguntasFrecuentes();
        setPreguntasFrecuentes(data);
        setPreguntasFiltradas(data);
      } catch (error) {
        console.error('Error cargando preguntas frecuentes:', error);
      } finally {
        setCargando(false);
      }
    }
    cargarPreguntasFrecuentes();
  }, []);

  useEffect(() => {
    if (terminoBusqueda.trim() === '') {
      setPreguntasFiltradas(preguntasFrecuentes);
    } else {
      const filtradas = preguntasFrecuentes.filter(pregunta =>
        pregunta.pregunta.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        pregunta.respuesta.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
      setPreguntasFiltradas(filtradas);
      setIndiceAbierto(null);
    }
  }, [terminoBusqueda, preguntasFrecuentes]);

  const togglePregunta = (indice: number) => {
    setIndiceAbierto(indiceAbierto === indice ? null : indice);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-800 py-12 px-4">
        <NeonSign/>
      </div>
    );
  }

  return (
    <div className="min-h-auto  py-12 px-4">
      <div className=" w-[90vw] mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <FaQuestionCircle className="text-sky-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-300">
              Preguntas Frecuentes
            </h1>
          </div>
          <p className="text-gray-400 text-lg mb-8">
            Encuentra respuestas a las dudas más comunes
          </p>

          {/* Barra de búsqueda */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              placeholder="Buscar en preguntas y respuestas..."
              className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-600 text-gray-300 placeholder-gray-500"
            />
          </div>

    
        </div>

        {/* Lista de preguntas frecuentes */}
        {preguntasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <FaQuestionCircle className="text-gray-700 mx-auto mb-4" size={64} />
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">
              No se encontraron preguntas
            </h3>
            <p className="text-gray-500">
              {terminoBusqueda ? 'Intenta con otros términos de búsqueda' : 'No hay preguntas frecuentes disponibles'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {preguntasFiltradas.map((pregunta, indice) => (
              <div
                key={pregunta.id}
                className="bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700"
              >
                {/* Pregunta */}
                <button
                  onClick={() => togglePregunta(indice)}
                  className="w-full p-6 text-left focus:outline-none focus:ring-1 focus:ring-sky-600"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <FaQuestionCircle className="text-sky-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-300">
                          {pregunta.pregunta}
                        </h3>
            
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: indiceAbierto === indice ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="ml-4 flex-shrink-0"
                    >
                      <FaChevronDown className="text-sky-600" size={20} />
                    </motion.div>
                  </div>
                </button>

                {/* Respuesta */}
                <AnimatePresence>
                  {indiceAbierto === indice && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-neutral-700 pt-6">
                          <p className="text-gray-400">
                            {pregunta.respuesta}
                          </p>
                          <div className="mt-4 pt-4 border-t border-neutral-700 text-sm text-gray-500">
                            <span>Creado: {new Date(pregunta.created_at).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="mb-2">
            ¿No encuentras lo que buscas? Contáctanos para más información.
          </p>
            
        </div>
      </div>
    </div>
  );
}