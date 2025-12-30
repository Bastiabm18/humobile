// components/ProfileTypeSelector.tsx
import { ProfileType } from '@/types/profile';
import { motion } from 'framer-motion';
import { 
  FaUser, 
  FaUsers, 
  FaBuilding 
} from 'react-icons/fa';
import { 
  HiOutlineUser, 
  HiOutlineUserGroup, 
  HiOutlineBuildingOffice2 
} from 'react-icons/hi2';

const types: { 
  type: ProfileType; 
  title: string; 
  desc: string;
  icon: React.ReactNode;
  gradient: string;
}[] = [
  { 
    type: 'artist', 
    title: 'Artista Solista', 
    desc: 'Cantante, músico, solista',
    icon: <FaUser className="w-8 h-8" />,
    gradient: 'from-red-500/10 via-red-600/5 to-transparent'
  },
  { 
    type: 'band', 
    title: 'Grupo / Banda', 
    desc: 'Múltiples integrantes',
    icon: <FaUsers className="w-8 h-8" />,
    gradient: 'from-green-500/10 via-green-600/5 to-transparent'
  },
  { 
    type: 'place', 
    title: 'Local / Establecimiento', 
    desc: 'Pub, teatro, estadio',
    icon: <FaBuilding className="w-8 h-8" />,
    gradient: 'from-neutral-700/10 via-neutral-800/5 to-transparent'
  },
];

export default function ProfileTypeSelector({ onSelect }: { onSelect: (type: ProfileType) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {types.map(({ type, title, desc, icon, gradient }, index) => (
        <motion.button
          key={type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.03,
            boxShadow: type === 'artist' 
              ? "0 20px 40px -10px rgba(239, 68, 68, 0.3)" 
              : type === 'band'
                ? "0 20px 40px -10px rgba(22, 163, 74, 0.3)"
                : "0 20px 40px -10px rgba(64, 64, 64, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(type)}
          className={`
            relative p-8 rounded-2xl 
            border-2 border-neutral-800
            bg-neutral-900
            text-left cursor-pointer
            transition-all duration-300
            group overflow-hidden
            hover:border-${type === 'artist' ? 'red' : type === 'band' ? 'green' : 'neutral'}-500/50
          `}
        >
          {/* Fondo con gradiente */}
          <div className={`
            absolute inset-0 bg-gradient-to-br ${gradient}
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500
          `} />
          
          {/* Borde glow en hover */}
          <div className={`
            absolute inset-0 rounded-2xl
            border-2 border-transparent
            group-hover:border-${type === 'artist' ? 'red' : type === 'band' ? 'green' : 'neutral'}-500/20
            transition-all duration-300
          `} />
          
          {/* Contenido */}
          <div className="relative z-10">
            {/* Icono */}
            <motion.div 
              className={`
                w-16 h-16 rounded-xl
                flex items-center justify-center mb-6
                ${type === 'artist' 
                  ? 'bg-red-600/20 text-red-400' 
                  : type === 'band'
                    ? 'bg-green-600/20 text-green-400'
                    : 'bg-neutral-800 text-neutral-400'
                }
                group-hover:scale-110
                transition-transform duration-300
              `}
              whileHover={{ rotate: 5 }}
            >
              {icon}
            </motion.div>
            
            {/* Título */}
            <h3 className={`
              text-2xl font-bold mb-3
              ${type === 'artist' 
                ? 'text-red-400 group-hover:text-red-300' 
                : type === 'band'
                  ? 'text-green-400 group-hover:text-green-300'
                  : 'text-neutral-300 group-hover:text-neutral-200'
              }
              transition-colors duration-300
            `}>
              {title}
            </h3>
            
            {/* Descripción */}
            <p className="text-neutral-400 group-hover:text-neutral-300 text-sm leading-relaxed transition-colors duration-300">
              {desc}
            </p>
            
            {/* Indicador de selección */}
            <motion.div 
              className={`
                absolute bottom-6 right-6
                w-10 h-10 rounded-full
                flex items-center justify-center
                ${type === 'artist' 
                  ? 'bg-red-600/20' 
                  : type === 'band'
                    ? 'bg-green-600/20'
                    : 'bg-neutral-800'
                }
                opacity-0 group-hover:opacity-100
                transition-all duration-300
              `}
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
            >
              <div className={`
                w-3 h-3 rounded-full
                ${type === 'artist' 
                  ? 'bg-red-500' 
                  : type === 'band'
                    ? 'bg-green-500'
                    : 'bg-neutral-600'
                }
              `} />
            </motion.div>
          </div>
          
          {/* Efecto de brillo */}
          <div className="
            absolute inset-0 rounded-2xl
            bg-gradient-to-r from-transparent via-white/0 to-transparent
            translate-x-[-100%] group-hover:translate-x-[100%]
            transition-transform duration-700
          " />
        </motion.button>
      ))}
    </div>
  );
}