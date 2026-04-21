'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import { obtenerMembresiasDisponibles } from '../dashboard/serPremium/actions/actions';
import { MembresiaConPermisos } from '@/types/profile';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function PlanesPage() {
  const [planes, setPlanes] = useState<MembresiaConPermisos[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembresiaConPermisos | null>(null);
  const router = useRouter();

  useEffect(() => {
    const cargarDatos = async () => {
      const res = await obtenerMembresiasDisponibles();
      if (res.success && res.data) {
        const filtrados = res.data
          .filter(p => p.nombre !== 'GRATIS')
          .sort((a, b) => Number(a.precio_mensual) - Number(b.precio_mensual));
        setPlanes(filtrados);
      }
    };
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2 italic uppercase">Humobile Premium</h1>
          <p className="text-neutral-500">Desbloquea el máximo potencial de tu carrera.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {planes.map((plan) => (
            <div
              key={plan.id_membership}
              onClick={() => setSelectedPlan(plan)}
              className={`p-8 rounded-3xl border-2 transition-all cursor-pointer ${
                selectedPlan?.id_membership === plan.id_membership 
                ? 'border-blue-600 bg-blue-900/10' 
                : 'border-neutral-800 bg-neutral-900'
              }`}
            >
              <h3 className="text-2xl font-black text-white mb-1 uppercase">{plan.nombre}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-white">${Number(plan.precio_mensual).toLocaleString('es-CL')}</span>
                <span className="text-neutral-500 text-[10px] font-bold uppercase">Neto / Mes</span>
              </div>

              <ul className="space-y-4 border-t border-neutral-800 pt-6">
                {plan.permisos.map((permiso) => (
                  <li key={permiso.id_permiso} className="flex flex-col gap-1">
                    <div className="flex items-start gap-3 text-sm font-semibold text-neutral-200">
                      <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                      <span>
                        {permiso.nombre_permiso} 
                        {permiso.limite && permiso.limite !== '999' && (
                           <span className="ml-1 text-neutral-500">({permiso.limite})</span>
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {selectedPlan && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="max-w-md mx-auto bg-neutral-900 p-8 rounded-3xl border border-blue-600"
            >
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between text-neutral-400">
                  <span>Plan Mensual {selectedPlan.nombre}</span>
                  <span>${Number(selectedPlan.precio_mensual).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-emerald-500 font-bold italic">
                  <span>IVA (19%)</span>
                  <span>+ ${(Number(selectedPlan.precio_mensual) * 0.19).toLocaleString('es-CL')}</span>
                </div>
                <div className="pt-3 border-t border-neutral-800 flex justify-between text-2xl font-black text-white">
                  <span>Total</span>
                  <span className="text-blue-500">${(Number(selectedPlan.precio_mensual) * 1.19).toLocaleString('es-CL')}</span>
                </div>
              </div>

            <button
              onClick={() => router.push('/dashboard/serPremium')}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black flex items-center justify-center gap-3 transition-colors"
            >
              <Image
                  src="/2.WebpayPlus_FN_300px.png" 
                alt="Pagar con Webpay" 
                width={120} 
                height={40} 
                className="h-8 w-auto object-contain "
              />
            </button>
            </motion.div>
          )}
        </AnimatePresence>
         {/* SELLO DE PAGO SEGURO */}
        <div className="mt-16 flex items-center justify-center gap-2 md:opacity-60 md:hover:opacity-100 transition-opacity">
          <span className="text-gray-400  text-xs uppercase tracking-widest">Pagos seguros con</span>
          <Image 
            src="/2.WebpayPlus_FN_300px.png" 
            alt="Webpay Plus" 
            width={80} 
            height={30} 
            className="h-8 w-auto object-contain  "
          />
        </div>
      </div>
    </div>
  );
}