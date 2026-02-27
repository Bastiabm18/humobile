// components/ModalVerificarRut.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaIdCard } from 'react-icons/fa';

interface PropsModalVerificarRut {
  estaAbierto: boolean;
  alCerrar: () => void;
  onGuardar: (rut: string) => Promise<void>;
}

export default function ModalVerificarRut({ 
  estaAbierto, 
  alCerrar, 
  onGuardar 
}: PropsModalVerificarRut) {
  const [rut, setRut] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Función para formatear RUT mientras se escribe
  const formatearRut = (valor: string) => {
    // Eliminar puntos y guiones
    let limpio = valor.replace(/[.-]/g, '');
    
    // Limitar a 9 caracteres (8 números + 1 dígito verificador)
    if (limpio.length > 9) limpio = limpio.slice(0, 9);
    
    // Si está vacío, retornar vacío
    if (limpio.length === 0) return '';
    
    // Separar cuerpo y dígito verificador
    let cuerpo = limpio.slice(0, -1);
    let dv = limpio.slice(-1).toUpperCase();
    
    // Formatear cuerpo con puntos
    if (cuerpo.length > 0) {
      cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    return `${cuerpo}-${dv}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formateado = formatearRut(e.target.value);
    setRut(formateado);
  };

  const validarRut = (rutCompleto: string): boolean => {
    const rutLimpio = rutCompleto.replace(/[.-]/g, '');
    if (rutLimpio.length < 8) return false;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    // Validar dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dvCalculado === dv;
  };

 const handleGuardar = async () => {
  if (!rut) {
    setError('Debes ingresar un RUT');
    return;
  }

  // Validar que tenga guión
  if (!rut.includes('-')) {
    setError('El RUT debe incluir guión');
    return;
  }

  // Validar formato completo (puntos y guión)
  const formatoValido = /^\d{1,2}\.\d{3}\.\d{3}-[\dKk]$/.test(rut);
  if (!formatoValido) {
    setError('Formato inválido. Debe ser: 12.345.678-9');
    return;
  }

  try {
    setCargando(true);
    setError('');
    await onGuardar(rut); // El RUT se guarda exactamente como está formateado
    alCerrar();
    setRut('');
  } catch (err: any) {
    setError(err.message || 'Error al guardar RUT');
  } finally {
    setCargando(false);
  }
};

  return (
    <AnimatePresence>
      {estaAbierto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={alCerrar}
            className="fixed inset-0 bg-black/70 z-50"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      w-full max-w-md
                      bg-neutral-800 rounded-xl border border-neutral-700 
                      z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FaIdCard className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Verificar RUT
                  </h2>
                  <p className="text-neutral-400 text-sm">
                    Ingresa tu RUT para verificar tu identidad
                  </p>
                </div>
              </div>
              <button
                onClick={alCerrar}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-700"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={rut}
                    onChange={handleChange}
                    placeholder="12.345.678-9"
                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg 
                             text-white placeholder-neutral-400 text-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Formato: 12.345.678-9 o 12.345.678-K
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-neutral-700 bg-neutral-900/50">
              <button
                onClick={alCerrar}
                className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 
                         text-white font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={cargando}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 
                         disabled:bg-blue-600/50 disabled:cursor-not-allowed
                         text-white font-medium rounded-lg transition-colors
                         flex items-center justify-center gap-2"
              >
                {cargando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FaCheck />
                    Verificar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}