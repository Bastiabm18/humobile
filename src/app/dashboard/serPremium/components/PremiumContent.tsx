'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCrown, 
  FaCheck, 
  FaLock, 
  FaCreditCard,
  FaInfinity,
  FaCalendarAlt,
  FaUserFriends,
  FaStore,
  FaUserCircle,
  FaDatabase,
  FaShieldAlt,
  FaArrowCircleLeft,
  FaArrowLeft,
  FaCheckCircle
} from 'react-icons/fa';
import { GiSparkPlug } from "react-icons/gi";
import { useRouter } from 'next/navigation';
import { insertMembresia } from '../actions/actions';

interface PremiumContentProps {
  userData: {
    email: string;
    name: string;
    uid: string;
  };
}

export default function PremiumContent({ userData }: PremiumContentProps) {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'transfer'>('credit');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const router = useRouter();
  const pricing = {
    monthly: 3000,
    yearly: 30000
  };

  const currentPrice = billingCycle === 'monthly' ? pricing.monthly : pricing.yearly;
  const savings = billingCycle === 'yearly' ? 6000 : 0;

  const features = [
    { icon: <FaInfinity />, text: 'Eventos ilimitados', highlight: true },
    { icon: <FaCalendarAlt />, text: 'Bloqueo de agenda avanzado', highlight: true },
    { icon: <FaUserFriends />, text: 'Interacción con múltiples perfiles', highlight: true },
    { icon: <FaStore />, text: 'Locales múltiples y perfiles', highlight: true },
    { icon: <FaUserCircle />, text: 'Manejo de perfiles externos', highlight: true },
    { icon: <FaDatabase />, text: 'Storage ilimitado', highlight: true },
    { icon: <FaShieldAlt />, text: 'Seguridad avanzada', highlight: false },
  ];

  console.log('User data Premium',userData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    
    setLoading(true);
    
    try {
      // Aquí iría la integración con la pasarela de pagos
      console.log('Enviando a pasarela:', {
        amount: currentPrice,
        billingCycle,
        paymentMethod,
        userId: userData.uid
      });
      
      // Simulación de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Redirigiendo a pasarela de pago. Monto: $${currentPrice}`);
         // Llamar a la función para insertar la membresía
      const resultado = await insertMembresia(
        userData.uid,
        'PREMIUM',
        billingCycle
      );
        if (resultado.success) {
        setPagoExitoso(true); // <-- Marcar pago como exitoso
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert('¡Pago exitoso! Tu membresía PREMIUM ha sido activada.');
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }, 500);
        
      } else {
        throw new Error(resultado.error || 'Error al activar la membresía');
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error procesando tu solicitud');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

    // Si el pago fue exitoso, mostrar pantalla de éxito
  if (pagoExitoso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl p-8 text-center border border-emerald-200 dark:border-emerald-700"
        >
          <div className="mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <FaCheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              ¡Pago Exitoso!
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              Tu membresía PREMIUM ha sido activada
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                Plan: <span className="font-bold">PREMIUM {billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
              </p>
            </div>
            
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Serás redirigido al dashboard en unos segundos...
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg"
          >
            Ir al Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <motion.button
            whileTap={{ scale: 0.95 }}
               whileHover={{ scale: 1.05 }}
          onClick={()=> router.push('/dashboard')}
          className=' px-3 py-1 rounded-xl'>
            <FaArrowLeft size={32}/>
          </motion.button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <GiSparkPlug className="text-3xl text-amber-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
              Upgrade a Premium
            </h1>
            <FaCrown className="text-3xl text-amber-500" />
          </div>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Desbloquea todo el potencial de tu dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div>
            {/* Selector de Plan */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                Selecciona tu Plan
              </h2>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Mensual
                  <div className="text-sm font-bold mt-1">
                    {formatPrice(pricing.monthly)}
                  </div>
                </button>
                
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  Anual
                  <div className="text-sm font-bold mt-1">
                    {formatPrice(pricing.yearly)}
                  </div>
                  {savings > 0 && (
                    <div className="text-xs text-emerald-500 mt-1">
                      Ahorras {formatPrice(savings)}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Formulario de Pago */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-3">
                <FaLock className="text-blue-500" />
                Información de Pago
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Método de Pago */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                    Método de Pago
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'credit'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 justify-center">
                        <FaCreditCard className="text-xl text-blue-500" />
                        <span className="font-medium">Tarjeta</span>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'transfer'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 justify-center">
                        <span className="text-xl font-bold text-blue-500">TR</span>
                        <span className="font-medium">Transferencia</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Términos y Condiciones */}
                <div className="mb-6">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-blue-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      Acepto los{' '}
                      <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                        Términos de Servicio
                      </a>{' '}
                      y autorizo el cobro de{' '}
                      <span className="font-bold">
                        {formatPrice(currentPrice)}
                      </span>{' '}
                      por el Plan Premium
                    </span>
                  </label>
                </div>

                {/* Botón de Pago */}
                <button
                  type="submit"
                  disabled={loading || !agreeTerms || pagoExitoso}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    loading || !agreeTerms || pagoExitoso
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:shadow-2xl hover:shadow-amber-500/30 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                  ) : pagoExitoso ? (
                            <div className="flex items-center justify-center gap-3">
                              <FaCheckCircle />
                              <span>Pago Exitoso</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <FaCrown />
                              <span>
                                SUSCRIBIRME - {formatPrice(currentPrice)}
                              </span>
                            </div>
                          )}
                </button>
              </form>
            </div>
          </div>

          {/* Columna Derecha: Características */}
          <div>
            {/* Resumen */}
            <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl p-6 text-white mb-6">
              <h3 className="text-xl font-bold mb-4">Resumen del Pedido</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Plan Premium</span>
                  <span className="font-bold">{billingCycle === 'monthly' ? 'Mensual' : 'Anual'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(currentPrice)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between">
                    <span>Descuento</span>
                    <span className="font-bold text-emerald-300">-{formatPrice(savings)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>IVA (21%)</span>
                  <span className="font-bold">{formatPrice(Math.round(currentPrice * 0.21))}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-blue-400">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-bold">
                    {formatPrice(Math.round(currentPrice * 1.21))}
                  </span>
                </div>
              </div>
            </div>

            {/* Características Premium */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Características Premium
              </h3>
              
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      feature.highlight 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'bg-neutral-50 dark:bg-neutral-700/50'
                    }`}
                  >
                    <div className={`p-2 rounded-md ${
                      feature.highlight 
                        ? 'bg-blue-100 dark:bg-blue-800' 
                        : 'bg-neutral-200 dark:bg-neutral-600'
                    }`}>
                      <div className={feature.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-600 dark:text-neutral-400'}>
                        {feature.icon}
                      </div>
                    </div>
                    <span className={feature.highlight ? 'text-blue-800 dark:text-blue-300 font-medium' : 'text-neutral-700 dark:text-neutral-300'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Beneficios */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20">
                <div className="flex items-center gap-3">
                  <FaCheck className="text-emerald-500 text-xl" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                      Activación inmediata
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Acceso instantáneo tras confirmación de pago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}