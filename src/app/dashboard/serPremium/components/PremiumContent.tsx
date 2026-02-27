'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCrown, FaCheck, FaLock, FaArrowLeft, FaCheckCircle, 
  FaStar, FaCalendarAlt, FaIdCard, FaGem, 
  FaClock
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { insertMembresia, getMembbresias, eliminarMembresia } from '../actions/actions';
import { UserData } from '@/types/profile';
import CancelarSuscripcionModal from './CancelarSuscripcionModal';
import { GiMoneyStack, GiPayMoney } from 'react-icons/gi';
interface Membership {
  id_membership: string;
  nombre: string;
  precio_mensual: string;
  duracion_dias: number | null;
}

const PLAN_FEATURES: Record<string, string[]> = {
  BASICO: ['1 Perfil', 'Agenda Personal', 'Link para eventos'],
  ESTANDAR: ['2 Perfiles', 'Agenda Personal', 'Agenda Compartida', 'Visibilización pública/privada', 'Confirmación agenda', 'Link para videos', 'Link para eventos'],
  PREMIUM: ['Perfiles Ilimitados', 'Agenda Personal Ilimitada', 'Agenda Compartida Ilimitada', 'Visibilización pública/privada', 'Administración agenda representante', 'Confirmación agenda', 'Link para videos', 'Link para eventos', 'Georeferenciación', 'Difusión']
};

export default function PremiumContent({ userData }: { userData: UserData }) {
  const [plans, setPlans] = useState<Membership[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const router = useRouter();
// --- ESTADOS PARA EL MODAL cancelar suscripcion ---
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  // Verificamos si el usuario ya tiene una membresía activa que no sea "GRATIS"
  const hasActivePlan = userData.membresia && 
                        userData.membresia.nombre_membresia !== 'GRATIS' && 
                        userData.membresia.estado_membresia === 'ACTIVO';

  useEffect(() => {
    if (!hasActivePlan) {
      const fetchPlans = async () => {
        const res = await getMembbresias();
        if (res.success && res.data) {
          setPlans(res.data.filter((p: Membership) => p.nombre !== 'GRATIS'));
        }
      };
      fetchPlans();
    }
  }, [hasActivePlan]);

  const handleWebPayPayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const res = await insertMembresia(userData.uid, selectedPlan.nombre as any, 'monthly');
      if (res.success) setPagoExitoso(true);
    } catch (error) {
      alert('Error en el proceso de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarSuscripcion = async () => {
    setCancelling(true);
    try {
      
      const res = await eliminarMembresia(userData.uid);
     
      if(!res.success) {
        throw new Error(res.error || 'Error desconocido al cancelar la suscripción');
      }else {
        alert('Suscripción cancelada exitosamente');
      }

      
      setModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert('Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };


  // --- VISTA: USUARIO YA TIENE PLAN ACTIVO ---
  if (hasActivePlan && !pagoExitoso) {
    const { nombre_membresia, fecha_fin_membresia, estado_membresia, fecha_ini_membresia } = userData.membresia;
    
    const dias = fecha_fin_membresia && fecha_ini_membresia
    ? Math.ceil((new Date(fecha_fin_membresia).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : 0;
    
    
    return (
      <>
      <div className=" w-[95vw] md:max-w-[60vw] mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 rounded-3xl border border-neutral-800 shadow-xl overflow-hidden"
        >
          <div className="bg-blue-600 p-8 text-white relative">
            <FaGem className="absolute right-8 top-8 text-6xl opacity-20" />
            <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Suscripción Actual</h2>
            <h1 className="text-4xl font-black flex items-center gap-3">
              Plan {nombre_membresia} <FaCrown className="text-amber-400" />
            </h1>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/30 rounded-2xl">
                  <FaCheckCircle className="text-emerald-600 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold">Estado</p>
                  <p className="font-bold text-white">{estado_membresia}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-2xl">
                  <FaCalendarAlt className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase font-bold">Desde el</p>
                  <p className="font-bold text-white">
                    {new Date(fecha_ini_membresia).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
 
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-900/30 rounded-2xl">
                  <FaCalendarAlt className="text-blue-600 text-xl" />
                </div>
                <div>
                
                  <p className="text-xs text-neutral-500 uppercase font-bold">Vence el</p>
                  <p className="font-bold text-white">
                    {new Date(fecha_fin_membresia).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900/30 rounded-2xl">
                  <FaClock className="text-orange-600 text-xl" />
                </div>
                <div>
                
                  <p className="text-xs text-neutral-500 uppercase font-bold">Dias restantes</p>
                  <p className="font-bold text-white">
                    {dias}
                  </p>
                </div>
              </div>
            <div className=" hidden md:flex items-center gap-4 pt-8">
               <button 
             onClick={() => setModalOpen(true)}
              className="px-8 py-3 bg-red-900 text-red-300 rounded-xl font-bold transition-transform active:scale-95"
            >
            Cancelar Suscripción 
            </button>
            </div>

            </div>

            <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FaStar className="text-amber-500" /> Tus Beneficios Activos
              </h3>
              <ul className="text-sm space-y-2 text-neutral-400">
                {PLAN_FEATURES[nombre_membresia]?.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaCheck className="text-emerald-500 text-xs" /> {f}
                  </li>
                ))}
                <li className="pt-2 font-medium text-blue-600">...y más funcionalidades activas.</li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-neutral-800 border-t border-neutral-700 text-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-white text-neutral-900  rounded-xl font-bold transition-transform active:scale-95"
            >
              Ir al Inicio
            </button>
          </div>
        </motion.div>

        <div className=' flex flex-row items-center justify-center pt-10'>
             <div className=" flex md:hidden items-center justify-center gap-4 pt-20">
               <button 
             onClick={() => setModalOpen(true)}
              className="px-8 py-3 bg-red-900 text-red-300 rounded-xl font-bold transition-transform active:scale-95"
            >
            Cancelar Suscripción 
            </button>
            </div>
        </div>
      </div>
      <CancelarSuscripcionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onConfirm={handleEliminarSuscripcion}
        loading={cancelling}
      />
      </>
    );
  }

  // --- VISTA: ÉXITO TRAS COMPRA ---
  if (pagoExitoso) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <FaCheckCircle className="text-8xl text-emerald-500 mb-6" />
            </motion.div>
            <h2 className="text-4xl font-black">¡Pago Procesado!</h2>
            <p className="text-neutral-500 mt-2 text-lg">Tu cuenta ha sido actualizada a <strong>{selectedPlan?.nombre}</strong></p>
            <button onClick={() => window.location.reload()} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30">
              Comenzar ahora
            </button>
        </div>
    );
  }

  // --- VISTA: TIENDA DE PLANES (Si es Gratis o Inactivo) ---
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* ... (Botón volver y Header igual que antes) */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4 italic">HUMOBILE PREMIUM</h1>
        <p className="text-neutral-500">No tienes una suscripción activa. Elige un plan para desbloquear todas las herramientas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <motion.div
            key={plan.id_membership}
            whileHover={{ y: -10 }}
            className={`relative p-8 rounded-3xl border-2 transition-all cursor-pointer ${
              selectedPlan?.id_membership === plan.id_membership 
              ? 'border-blue-500 bg-blue-900/10 shadow-2xl scale-105 z-10' 
              : 'border-neutral-800 bg-neutral-900 opacity-80 hover:opacity-100'
            }`}
            onClick={() => setSelectedPlan(plan)}
          >
            {plan.nombre === 'PREMIUM' && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-1 rounded-full text-xs font-black flex items-center gap-2 shadow-lg">
                <FaCrown /> EL MEJOR VALOR
              </span>
            )}
            
            <h3 className="text-2xl font-black mb-1">{plan.nombre}</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">${Number(plan.precio_mensual).toLocaleString('es-CL')}</span>
              <span className="text-neutral-400 text-xs font-bold">NETO / MES</span>
            </div>

            <ul className="space-y-4 mb-8 border-t border-neutral-800 pt-6">
              {PLAN_FEATURES[plan.nombre]?.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium">
                  <FaCheck className="text-blue-500 mt-1 flex-shrink-0" />
                  <span className="text-neutral-300">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Selector Webpay (Solo aparece si seleccionó algo) */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md mx-auto bg-neutral-800 p-8 rounded-3xl border-2 border-blue-500 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-center font-black text-xl mb-6">Resumen de Compra</h3>
              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Plan Mensual {selectedPlan.nombre}</span>
                  <span>${Number(selectedPlan.precio_mensual).toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>IVA (19%)</span>
                  <span>+ ${(Number(selectedPlan.precio_mensual) * 0.19).toLocaleString('es-CL')}</span>
                </div>
                <div className="pt-3 border-t border-neutral-700 flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span className="text-blue-600">${(Number(selectedPlan.precio_mensual) * 1.19).toLocaleString('es-CL')}</span>
                </div>
              </div>

              <button
                onClick={handleWebPayPayment}
                disabled={loading}
                className="w-full py-4 bg-[#f15a24] hover:bg-[#d1491b] text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-[#f15a24]/30 transition-all hover:-translate-y-1"
              >
                {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : (
                  <>
                   <GiPayMoney size={32} className='text-neutral-400'/>    Pagar con Webpay
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}