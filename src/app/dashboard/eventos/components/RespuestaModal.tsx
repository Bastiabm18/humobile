'use client';

import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

interface RespuestaModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  onClose: () => void;
}

export default function RespuestaModal({
  isOpen,
  type,
  title,
  message,
  onClose
}: RespuestaModalProps) {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle className="text-green-400 text-4xl" />,
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          icon: <FaTimesCircle className="text-red-400 text-4xl" />,
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle className="text-yellow-400 text-4xl" />,
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <div className="fixed inset-0 flex z-[9999] items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`bg-neutral-900 rounded-xl border ${typeConfig.borderColor} w-full max-w-md overflow-hidden`}>
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-700">
          <div className="flex items-center gap-3">
            {typeConfig.icon}
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className={`${typeConfig.bgColor} p-4 rounded-lg`}>
            <p className="text-white font-medium">{message}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-700">
          <button
            onClick={onClose}
            className={`w-full py-3 ${typeConfig.buttonColor} text-white font-bold rounded-lg transition`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}