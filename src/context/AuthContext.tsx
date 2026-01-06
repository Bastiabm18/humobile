'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import Spinner from '@/app/components/Spinner';

// Interfaz para el usuario enriquecido (con el rol desde tu DB)
interface CustomUser extends User {
  role?: 'USER' | 'ADMIN';
  uid: string; // Añadido para consistencia con la respuesta del API GET
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  session: null,
  isAdmin: false,
  refetchUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = getSupabaseBrowser();

  // Función para obtener el estado del usuario/rol desde el servidor (leyendo la cookie HTTP-only)
  const fetchAuthStatusFromServer = async () => {
    try {
      // 1. Consulta el API para saber si la cookie HTTP-ONLY está presente y válida.
      const res = await fetch('/api/auth/session');

      if (res.ok) {
        const data = await res.json();
        
        if (data.user) {
          // El API devolvió un usuario válido (leyó la cookie y encontró el rol)
          const fetchedUser = data.user;
          
          // Nota: El objeto 'user' del API GET es un objeto enriquecido con role.
          // Lo usamos para el estado, asegurando que 'id' y 'uid' coincidan.
          const userWithRole: CustomUser = {
            ...fetchedUser,
            id: fetchedUser.uid, // Asegura que se respete el campo 'id' de la interfaz User
          };

          setUser(userWithRole);
          setIsAdmin(fetchedUser.role === 'ADMIN');
        } else {
          // No hay cookie o expiró, pero la llamada fue exitosa
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        console.error('API Error fetching auth status:', res.status);
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error fetching user role from server:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  // Sincroniza el access_token al servidor para que se establezca la cookie HTTP-only (POST /api/auth/session)
  const syncSessionCookie = async (accessToken: string) => {
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken }),
      });
    } catch (error) {
      console.error('Error syncing session cookie:', error);
    }
  };

  const refetchUser = async () => {
    // 1. Obtiene la sesión actual (de cliente o la que acabe de refrescar)
    const { data: { session: clientSession } } = await supabase.auth.getSession();
    setSession(clientSession);
    
    // 2. Si hay token en el cliente, sincronízalo con la cookie HTTP-only
    if (clientSession?.access_token) {
      await syncSessionCookie(clientSession.access_token);
    }
    
    // 3. Consulta el estado real de la sesión usando la cookie HTTP-only
    await fetchAuthStatusFromServer();
  };

  const logout = async () => {
    try {
      // 1. Llama al DELETE API para borrar la cookie HTTP-only
      await fetch('/api/auth/session', { method: 'DELETE' }); 
      // 2. Llama al signOut de Supabase para limpiar el estado de cliente
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    // Carga inicial: SIEMPRE checar el estado del servidor (la cookie HTTP-only)
    const initAuth = async () => {
      // Saca la sesión de Supabase client (solo para tener un 'session' objeto en el contexto)
      const { data: { session: clientSession } } = await supabase.auth.getSession();
      setSession(clientSession);
      
      // Si la sesión está en el cliente (ej. justo después del callback), sincroniza la cookie
      if (clientSession?.access_token) {
        await syncSessionCookie(clientSession.access_token);
      }
      
      // La clave: consulta el servidor para el estado real, que lee la cookie
      await fetchAuthStatusFromServer(); 
    };

    initAuth();

    // Escucha cambios de AuthState (ej. token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'INITIAL_SESSION') return;

        console.log('AUTH EVENT:', event, 'SESSION:', !!currentSession);
        setSession(currentSession);

        if (currentSession?.access_token) {
          // Si el cliente de Supabase tiene un nuevo token, sincroniza la cookie del servidor
          await syncSessionCookie(currentSession.access_token);
        }
        
        // Refresca el estado leyendo la cookie, que es la fuente de verdad
        await fetchAuthStatusFromServer();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex bg-neutral-900 justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, session, isAdmin, refetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);