// lib/auth-service.ts
import { cookies } from 'next/headers';
import { decode } from 'jsonwebtoken';
import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';
import { Profile } from '@/types/profile';

const SESSION_COOKIE_NAME = 'supabaseAuthSession';

export async function getAuthUser(): Promise<Profile | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) return null;

    // Decodificamos el JWT que guardaste en la cookie para sacar el uid (sub)
    const decoded: any = decode(sessionCookie.value);
    if (!decoded?.sub) return null;

    const supabaseAdmin = getSupabaseAdmin();

    // Llamamos al RPC usando el uid del token
    // Nota: El RPC devuelve una TABLE, por eso usamos .rpc()... y manejamos el array
    const { data, error } = await supabaseAdmin
      .rpc('get_usuario_dashboard', { p_supabase_id: decoded.sub });

    if (error || !data || data.length === 0) {
      console.error('Error cargando perfil desde RPC:', error?.message);
      return null;
    }

    // Retornamos la primera fila mapeada  Profile
    return data[0] as Profile;

  } catch (e) {
    console.error('Auth Service Error:', e);
    return null;
  }
}