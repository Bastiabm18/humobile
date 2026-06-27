import { motion } from 'framer-motion';

interface CustomArrowIconProps {
  className?: string;
}

const CustomArrowIcon: React.FC<CustomArrowIconProps> = ({ className }) => {
  return (
    <motion.svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Línea diagonal delgada */}
      <path d="M7 17L17 7" />
      {/* Cabeza de la flecha más notoria */}
      <path d="M17 7H11" />
      <path d="M17 7V13" />
    </motion.svg>
  );
};

export default CustomArrowIcon;
