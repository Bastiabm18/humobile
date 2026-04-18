'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCrown, FaCheck, FaCheckCircle, 
  FaCalendarAlt, FaStar, FaClock, FaGem, FaTimes
} from 'react-icons/fa';
import { 
  insertMembresia, 
  eliminarMembresia, 
  obtenerMembresiasDisponibles,
} from '../actions/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { MembresiaConPermisos, UserData } from '@/types/profile';
import CancelarSuscripcionModal from './CancelarSuscripcionModal';
import { GiPayMoney } from 'react-icons/gi';

import { iniciarTransaccionWebpay } from '@/app/actions/transbank';

export default function PremiumContent({ userData }: { userData: UserData }) {
  const [planes, setPlanes] = useState<MembresiaConPermisos[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MembresiaConPermisos | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pagoSuccess = searchParams.get('success') === 'true';
  const pagoError = searchParams.get('error');
  const pagoErrorCode = searchParams.get('code');

  const cerrarAlerta = () => {
    router.replace('/dashboard/serPremium');
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const hasActivePlan = userData.membresia && 
                        userData.membresia.nombre_membresia !== 'GRATIS' && 
                        userData.membresia.estado_membresia === 'ACTIVO';

  useEffect(() => {
    const cargarDatos = async () => {
      const res = await obtenerMembresiasDisponibles();
      if (res.success && res.data) {
        if (!hasActivePlan) {
          const filtrados = res.data
            .filter(p => p.nombre !== 'GRATIS')
            .sort((a, b) => Number(a.precio_mensual) - Number(b.precio_mensual));
          setPlanes(filtrados);
        } else {
          setPlanes(res.data);
        }
      }
    };
    cargarDatos();
  }, [hasActivePlan]);

  const miPlanActual = planes.find(p => p.nombre === userData.membresia?.nombre_membresia);

  const handleWebPayPayment = async () => {
    if (!selectedPlan) return;
    setLoading(true);

    try {
      const montoBruto = Math.round(Number(selectedPlan.precio_mensual) * 1.19);

      const result = await iniciarTransaccionWebpay(
        montoBruto, 
        selectedPlan.nombre, 
        userData.uid 
      );

      if (result.success && result.url && result.token) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = result.url;

        const inputToken = document.createElement('input');
        inputToken.type = 'hidden';
        inputToken.name = 'token_ws';
        inputToken.value = result.token;

        form.appendChild(inputToken);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        alert(result.message || 'No se pudo iniciar la conexión con Transbank.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error al pagar:', error);
      alert('Ocurrió un error al procesar el pago.');
      setLoading(false);
    }
  };

  const handleEliminarSuscripcion = async () => {
    setCancelling(true);
    try {
      const res = await eliminarMembresia(userData.uid);
      if(!res.success) throw new Error(res.error);
      setModalOpen(false);
      window.location.reload();
    } catch (error) {
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      {/* ===== ALERTAS TRANSBANK ===== */}
      <div className="max-w-7xl mx-auto p-4 pt-0">
        <AnimatePresence>
          {pagoSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mb-8 bg-emerald-900/30 border border-emerald-500/50 rounded-2xl p-6 relative"
            >
              <button onClick={cerrarAlerta} className="absolute top-4 right-4 text-emerald-400 hover:text-white transition-colors">
                <FaTimes size={18} />
              </button>
              <div className="flex items-start gap-4">
                <div className="bg-emerald-600 p-3 rounded-xl">
                  <FaCheckCircle size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-emerald-300 mb-1">¡Pago Exitoso!</h3>
                  <p className="text-emerald-200/80 text-sm">
                    Tu plan Premium ha sido activado correctamente. Ya puedes disfrutar de todos los beneficios.
                  </p>
                  <button 
                    onClick={() => { cerrarAlerta(); router.push('/dashboard'); }}
                    className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Ir al Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {pagoError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto mb-8 bg-red-900/30 border border-red-500/50 rounded-2xl p-6 relative"
            >
              <button onClick={cerrarAlerta} className="absolute top-4 right-4 text-red-400 hover:text-white transition-colors">
                <FaTimes size={18} />
              </button>
              <div className="flex items-start gap-4">
                <div className="bg-red-600 p-3 rounded-xl">
                  <FaTimes size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-1">Pago Rechazado</h3>
                  <p className="text-red-200/80 text-sm mb-2">
                    La transacción no fue aprobada. Esto puede ocurrir por saldo insuficiente, tarjeta expirada o datos incorrectos.
                  </p>
                  {pagoErrorCode && (
                    <p className="text-xs text-red-400/60 font-mono">Código de error: {pagoErrorCode}</p>
                  )}
                  <button 
                    onClick={cerrarAlerta}
                    className="mt-4 px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* ========================================== */}

      {/* --- VISTA: PLAN ACTIVO --- */}
      {hasActivePlan && !pagoExitoso && (
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
                  Plan {userData.membresia.nombre_membresia} <FaCrown className="text-amber-400" />
                </h1>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <FaCheckCircle className="text-emerald-500 text-xl" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase font-bold">Estado</p>
                      <p className="font-bold text-white">{userData.membresia.estado_membresia}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaCalendarAlt className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase font-bold">Vencimiento</p>
                      <p className="font-bold text-white">
                        {new Date(userData.membresia.fecha_fin_membresia!).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <FaClock className="text-orange-500 text-xl" />
                    <div>
                      <p className="text-xs text-neutral-500 uppercase font-bold">Días restantes</p>
                      <p className="font-bold text-white">
                        {Math.ceil((new Date(userData.membresia.fecha_fin_membresia!).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} días
                      </p>
                    </div>
                  </div>
                </div>

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
                      </li>
                    ))}
                    {!miPlanActual && <p className="text-neutral-500 text-sm">Cargando beneficios...</p>}
                  </ul>
                </div>
              </div>

              <div className="p-6 bg-neutral-800 border-t border-neutral-700 flex flex-col md:flex-row gap-4 justify-center">
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
      )}

      {/* --- VISTA: TIENDA (Solo si es Gratis o Inactivo) --- */}
      {!hasActivePlan && (
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
      )}
    </>
  );
}