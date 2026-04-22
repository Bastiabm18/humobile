'use client';

import { HiX } from 'react-icons/hi';
import { terminosContratoData } from '@/app/constants/terminosContratoData';

interface TerminosContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TerminosContratoModal({ isOpen, onClose }: TerminosContratoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-950 rounded-t-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Términos, Condiciones y Políticas
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-neutral-800">
            <HiX size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 text-gray-300 leading-relaxed text-sm">
          
          {/* Info Prestador */}
          <div className="bg-neutral-800/60 p-4 rounded-xl border border-neutral-700">
            <h3 className="font-bold text-sky-400 mb-2">Identificación del prestador</h3>
            <p>Razón Social: <span className="text-white font-semibold">{terminosContratoData.prestador.razonSocial}</span></p>
            <p>RUT: <span className="text-white font-semibold">{terminosContratoData.prestador.rut}</span></p>
            <p>Domicilio: <span className="text-white font-semibold">{terminosContratoData.prestador.domicilio}</span></p>
          </div>

          {/* Secciones */}
          {terminosContratoData.secciones.map((seccion, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-lg font-semibold text-white">{seccion.titulo}</h3>
              
              {seccion.texto && <p>{seccion.texto}</p>}

              {seccion.lista && (
                <ul className="list-none space-y-2 pl-4 border-l-2 border-neutral-700">
                  {seccion.lista.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-sky-500 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* La condición expresa destacada */}
              {seccion.lista_expresa && (
                <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 space-y-2">
                  <p className="font-bold text-red-400 text-xs uppercase tracking-wider">Condición Expresa:</p>
                  <ul className="space-y-1.5">
                    {seccion.lista_expresa.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-red-200/80 text-xs">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {seccion.textoFinal && <p className="mt-2 italic text-gray-400">{seccion.textoFinal}</p>}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-neutral-700 bg-neutral-950 rounded-b-2xl">
          <button onClick={onClose} className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold transition-colors">
            Cerrar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
}