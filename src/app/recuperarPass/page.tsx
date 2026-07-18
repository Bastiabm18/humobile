'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

export default function RecuperarPassPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = getSupabaseBrowser();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Fíjate que redirige a /resetPass
        redirectTo: `${window.location.origin}/resetPass`, 
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-y-hidden flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Cuadro envolvente grande */}
        <div className="bg-neutral-800 rounded-2xl p-8 shadow-2xl">
          {/* Cuadro interno claro */}
          <div className="bg-neutral-700 rounded-xl p-6 space-y-6 border border-gray-700">
            
            <h1 className="text-3xl font-bold text-center text-gray-200 tracking-wider">
              HUMOBILE
            </h1>
            <p className="text-center text-sm text-gray-400">
              Ingresa tu correo y te enviaremos un enlace para recuperar tu cuenta.
            </p>

            {success ? (
              <div className="text-center space-y-4 pt-4">
                <p className="text-green-400 font-medium">¡Correo enviado!</p>
                <p className="text-sm text-gray-400">Revisa tu bandeja de entrada y haz clic en el enlace.</p>
                <Link
                  href="/login"
                  className="text-blue-500 hover:text-blue-400 font-medium transition-colors block mt-4"
                >
                  Volver al Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm text-gray-400 mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tu@email.com"
                    className="px-4 py-3 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Botones idénticos a tu login */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Enlace'}
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 rounded-lg transition-colors text-center flex items-center justify-center"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}