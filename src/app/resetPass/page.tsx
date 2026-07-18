'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

export default function ResetPassPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Escuchamos el evento de recuperación de Supabase
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMessage('Por favor, ingresa tu nueva contraseña.');
      }
    });

    return () => data.subscription.unsubscribe();
  }, [supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage('¡Contraseña actualizada! Redirigiendo...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
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

            {message && <p className="text-center text-sm text-green-400">{message}</p>}
            {error && <p className="text-center text-sm text-red-500">{error}</p>}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="flex flex-col">
                <label htmlFor="newPassword" className="text-sm text-gray-400 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6} // Supabase exige mínimo 6 caracteres por defecto
                  placeholder="••••••••"
                  className="px-4 py-3 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Botón único manteniendo tu estilo */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}