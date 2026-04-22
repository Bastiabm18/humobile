'use client';

import { HiX } from 'react-icons/hi';
import { politicaPrivacidadData } from '../constants/politicaPrivacidadData';

interface PoliticaPrivacidadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PoliticaPrivacidadModal({ isOpen, onClose }: PoliticaPrivacidadModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-950 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            Política de Protección de Datos Personales
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-neutral-800"
          >
            <HiX size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 text-gray-300 leading-relaxed">
          
          {/* Introducción */}
          <p className="text-lg font-medium text-gray-200 border-l-4 border-sky-500 pl-4">
            {politicaPrivacidadData.intro}
          </p>

          {/* Secciones */}
          {politicaPrivacidadData.secciones.map((seccion, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xl font-semibold text-sky-400">
                {seccion.titulo}
              </h3>
              
              {seccion.texto && (
                <p className="whitespace-pre-line">
                  {seccion.texto}
                </p>
              )}

              {seccion.lista && (
                <ul className="list-none space-y-2 pl-4 border-l-2 border-neutral-700">
                  {seccion.lista.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-sky-500 mt-1.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-700 bg-neutral-950 rounded-b-2xl text-center">
          <p className="text-sm text-gray-500">
            Fecha de última actualización: {politicaPrivacidadData.fechaActualizacion}
          </p>
        </div>
      </div>
    </div>
  );
}