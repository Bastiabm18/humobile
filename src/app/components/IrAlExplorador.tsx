'use client';

import { motion } from 'framer-motion';
import { FaArrowRight, FaSearch, FaUsers, FaMicrophone, FaGuitar, FaDrum } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleNavigation = () => {
    router.push(redirectTo);
  };

  const searchCategories = [
    { icon: <FaMicrophone />, label: "Cantantes", count: "85" },
    { icon: <FaGuitar />, label: "Guitarristas", count: "62" },
    { icon: <FaDrum />, label: "Bateristas", count: "48" },
    { icon: <FaUsers />, label: "Bandas", count: "50" },
  ];

  const stats = [
    { label: "Artistas", value: "200+" },
    { label: "Ciudades", value: "25" },
    { label: "Géneros", value: "15" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto px-4 py-6"
    >
      <div 
        onClick={handleNavigation}
        className="group relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-3xl cursor-pointer hover:border-sky-500/50 transition-all duration-500 shadow-2xl"
      >
        {/* Efecto de gradiente de fondo al hacer hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex flex-col lg:flex-row">
          
          {/* SECCIÓN PRINCIPAL (IZQUIERDA) */}
          <div className="flex-1 p-6 sm:p-10 z-10">
            <div className="flex flex-col h-full">
              
              {/* Header con Icono */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8">
                <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-sky-950/50 rounded-2xl flex items-center justify-center border border-sky-800/50 shadow-inner">
                  <FaSearch className="text-sky-400 text-2xl sm:text-3xl" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                    {title}
                  </h2>
                  <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed">
                    {message}
                  </p>
                </div>
              </div>

              {/* Grid de Categorías - Adaptable */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-4">
                  Categorías populares
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchCategories.map((cat, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-neutral-800/40 rounded-xl border border-neutral-700/50 group-hover:bg-neutral-800/80 transition-all"
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-sky-900/20 text-sky-400 rounded-lg">
                        {cat.icon}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{cat.label}</div>
                        <div className="text-[11px] text-gray-500">{cat.count} perfiles</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats & CTA */}
              <div className="mt-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-8 border-t border-neutral-800/60">
                <div className="flex gap-6">
                  {stats.map((stat, i) => (
                    <div key={i}>
                      <div className="text-xl font-bold text-white leading-none">{stat.value}</div>
                      <div className="text-[10px] text-gray-500 uppercase mt-1 tracking-tighter">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition-all shadow-lg shadow-sky-900/20 active:scale-95">
                  <span className="font-bold">{ctaText}</span>
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* PANEL LATERAL (DERECHA) - Oculto en móviles pequeños, visible desde LG */}
          <div className="hidden lg:flex w-[320px] bg-neutral-950/50 border-l border-neutral-800 p-8 flex-col">
            <h3 className="text-sm font-semibold text-gray-300 mb-6 uppercase tracking-widest">Filtros Inteligentes</h3>
            
            <div className="space-y-4">
              {['Ubicación', 'Género', 'Presupuesto', 'Disponibilidad'].map((filter, i) => (
                <div key={i} className="group/item">
                  <div className="text-[10px] text-gray-500 mb-1.5 ml-1">{filter}</div>
                  <div className="w-full h-10 bg-neutral-900 rounded-lg border border-neutral-800 group-hover/item:border-neutral-600 transition-colors flex items-center px-3">
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 60 + 20}%` }}
                        className="h-full bg-sky-500/50"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6">
              <div className="bg-sky-950/20 border border-sky-900/30 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sky-400 text-sm font-bold">42 En línea</span>
                </div>
                <p className="text-[11px] text-gray-500">Listos para contratar hoy</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}