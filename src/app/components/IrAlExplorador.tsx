'use client';

import { motion } from 'framer-motion';
import { FaArrowRight, FaSearch, FaUsers, FaMusic, FaMapMarkerAlt, FaMicrophone, FaGuitar, FaDrum } from 'react-icons/fa';

interface IrAlExploradorProps {
  title?: string;
  message?: string;
  ctaText?: string;
  redirectTo?: string;
}

export default function IrAlExplorador({
  title = "Explorador de Talentos",
  message = "Descubre artistas, bandas y locales para tus eventos. Filtra por género, ubicación y tipo de talento.",
  ctaText = "Buscar Ahora",
  redirectTo = "/busqueda"
}: IrAlExploradorProps) {
  const handleClick = () => {
    window.location.href = redirectTo;
  };

  const searchCategories = [
    { icon: <FaMicrophone />, label: "Cantantes", count: "85" },
    { icon: <FaGuitar />, label: "Guitarristas", count: "62" },
    { icon: <FaDrum />, label: "Bateristas", count: "48" },
    { icon: <FaUsers />, label: "Bandas", count: "50" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-[80vw] h-[40vh] min-h-[320px] max-w-[1000px] mx-auto"
    >
      <div 
        onClick={handleClick}
        className="h-full bg-neutral-900 border border-neutral-800 rounded-2xl cursor-pointer hover:border-sky-700 transition-colors duration-300 group overflow-hidden"
      >
        <div className="h-full flex">
          {/* Lado izquierdo - Contenido */}
          <div className="flex-1 p-8">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-neutral-800 rounded-xl flex items-center justify-center border border-neutral-700">
                    <FaSearch className="text-sky-400 text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{title}</h2>
                    <p className="text-gray-300 text-lg">{message}</p>
                  </div>
                </div>
              </div>

              {/* Categorías de búsqueda */}
              <div className="mb-8">
                <div className="text-sm text-gray-400 mb-3">Busca por categoría:</div>
                <div className="grid grid-cols-2 gap-3">
                  {searchCategories.map((cat, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 hover:border-sky-700 transition-colors"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-sky-900/30 rounded-lg">
                        <div className="text-sky-400">{cat.icon}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{cat.label}</div>
                        <div className="text-xs text-gray-400">{cat.count} disponibles</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-bold">200+</div>
                    <div className="text-xs text-gray-400">Artistas totales</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-bold">25</div>
                    <div className="text-xs text-gray-400">Ciudades</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-bold">15</div>
                    <div className="text-xs text-gray-400">Géneros</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-auto pt-6 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Encuentra el talento perfecto para tu evento
                  </div>
                  <div className="flex items-center gap-3 px-5 py-3 bg-sky-900 border border-sky-800 rounded-lg hover:bg-sky-800 transition-colors">
                    <span className="font-semibold text-sky-200">{ctaText}</span>
                    <FaArrowRight className="text-sky-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho - Filtros de ejemplo */}
          <div className="w-[35%] bg-neutral-950 border-l border-neutral-800 p-8">
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Filtros disponibles</h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="text-xs text-gray-400 mb-1">Ubicación</div>
                    <div className="text-white text-sm">Santiago Centro</div>
                  </div>
                  
                  <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="text-xs text-gray-400 mb-1">Género</div>
                    <div className="text-white text-sm">Rock, Pop, Jazz</div>
                  </div>
                  
                  <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="text-xs text-gray-400 mb-1">Tipo</div>
                    <div className="text-white text-sm">Artistas & Bandas</div>
                  </div>
                  
                  <div className="p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div className="text-xs text-gray-400 mb-1">Disponibilidad</div>
                    <div className="text-white text-sm">Próximas 2 semanas</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Resultados de ejemplo:</div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-sky-400 rounded-full animate-pulse"></div>
                    <div className="text-sky-400 text-sm font-medium">42 resultados encontrados</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}