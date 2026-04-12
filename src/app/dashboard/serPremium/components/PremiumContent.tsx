'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCrown, FaCheck, FaCheckCircle, 
  FaCalendarAlt, FaStar, FaClock, FaGem
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { 
  insertMembresia, 
  eliminarMembresia, 
  obtenerMembresiasDisponibles,
} from '../actions/actions';
import { MembresiaConPermisos, UserData } from '@/types/profile';
import CancelarSuscripcionModal from './CancelarSuscripcionModal';
import { GiPayMoney } from 'react-icons/gi';

export default function PremiumContent({ userData }: { userData: UserData }) {
  const [planes, setPlanes] = useState<MembresiaConPermisos[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembresiaConPermisos | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const hasActivePlan = userData.membresia && 
                        userData.membresia.nombre_membresia !== 'GRATIS' && 
                        userData.membresia.estado_membresia === 'ACTIVO';

  // Cargamos la data de la DB siempre para tener los permisos actualizados
  useEffect(() => {
    const cargarDatos = async () => {
      const res = await obtenerMembresiasDisponibles();
      if (res.success && res.data) {
        // Si no tiene plan activo, preparamos la tienda
        if (!hasActivePlan) {
          const filtrados = res.data
            .filter(p => p.nombre !== 'GRATIS')
            .sort((a, b) => Number(a.precio_mensual) - Number(b.precio_mensual));
          setPlanes(filtrados);
        } else {
          // Si TIENE plan, guardamos la data completa para mostrar sus permisos
          setPlanes(res.data);
        }
      }
    };
    cargarDatos();
  }, [hasActivePlan]);

  // Buscamos la data completa del plan actual del usuario
  const miPlanActual = planes.find(p => p.nombre === userData.membresia?.nombre_membresia);

  const handleWebPayPayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const res = await insertMembresia(userData.uid, selectedPlan.nombre as any, 'monthly');
      if (res.success) setPagoExitoso(true);
      window.location.reload();
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
      if(!res.success) throw new Error(res.error);
      //alert('Suscripción cancelada exitosamente');
      setModalOpen(false);
      window.location.reload();
    } catch (error) {
      //alert('Error al cancelar la suscripción');
    } finally {
      setCancelling(false);
    }
  };

  // --- VISTA: PLAN ACTIVO ---
  if (hasActivePlan && !pagoExitoso) {
    const { nombre_membresia, fecha_fin_membresia, estado_membresia } = userData.membresia;
    const dias = fecha_fin_membresia 
      ? Math.ceil((new Date(fecha_fin_membresia).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
      : 0;

    return (
      <>
        <div className="w-[95vw] md:max-w-[60vw] mx-auto p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 rounded-3xl border border-neutral-800 overflow-hidden"
          >
            <div className="bg-blue-600 p-8 text-white relative">
              <FaGem className="absolute right-8 top-8 text-6xl opacity-20" />
              <h2 className="text-sm font-bold uppercase mb-2 opacity-80">Suscripción Actual</h2>
              <h1 className="text-4xl font-black flex items-center gap-3">
                Plan {nombre_membresia} <FaCrown className="text-amber-400" />
              </h1>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <FaCheckCircle className="text-emerald-500 text-xl" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold">Estado</p>
                    <p className="font-bold text-white">{estado_membresia}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <FaCalendarAlt className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold">Vencimiento</p>
                    <p className="font-bold text-white">
                      {new Date(fecha_fin_membresia!).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <FaClock className="text-orange-500 text-xl" />
                  <div>
                    <p className="text-xs text-neutral-500 uppercase font-bold">Días restantes</p>
                    <p className="font-bold text-white">{dias} días</p>
                  </div>
                </div>
              </div>

              {/* LISTADO REAL DE PERMISOS DESDE LA DB */}
              <div className="bg-neutral-800/50 p-6 rounded-2xl border border-neutral-700">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                  <FaStar className="text-amber-500" /> Beneficios Activos
                </h3>
                <ul className="space-y-3">
                  {miPlanActual?.permisos.map((permiso) => (
                    <li key={permiso.id_permiso} className="flex flex-col border-b border-neutral-700/50 pb-2 last:border-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
                        <FaCheck className="text-emerald-500 text-xs" />
                        <span>{permiso.nombre_permiso}</span>
                        {permiso.limite && permiso.limite !== '999' && (
                          <span className="text-blue-400 text-xs font-mono">[{permiso.limite}]</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 ml-5 italic">{permiso.descripcion}</p>
                      <p className="text-[10px] text-neutral-500 ml-5 italic">+{permiso.limite}</p>
                    </li>
                  ))}
                  {!miPlanActual && <p className="text-neutral-500 text-sm">Cargando beneficios...</p>}
                </ul>
              </div>
            </div>

            <div className="p-6 bg-neutral-800 border-t  border-neutral-700 flex flex-col md:flex-row gap-4 justify-center">
              <button onClick={() => setModalOpen(true)} className="px-8 py-3 cursor-pointer bg-red-900/20 text-red-500 rounded-xl font-bold">
                Cancelar Suscripción
              </button>
              <button onClick={() => router.push('/dashboard')} className="px-8 cursor-pointer py-3 bg-white text-black rounded-xl font-bold">
                Ir al Inicio
              </button>
            </div>
          </motion.div>
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

  // --- VISTA: TIENDA (Solo si es Gratis o Inactivo) ---
  return (
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
              onClick={handleWebPayPayment} disabled={loading}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><GiPayMoney size={28} /> Pagar con Webpay</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}