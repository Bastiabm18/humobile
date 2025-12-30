// /app/api/auth/callback/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const REDIRECT_URL_SUCCESS = '/dashboard';
  const REDIRECT_URL_FAILURE = '/login?error=auth_failed';

  console.log('CALLBACK: Iniciado con code:', code ? 'SÍ' : 'NO');

  if (!code) {
    console.warn('CALLBACK: No hay código OAuth.');
    return NextResponse.redirect(new URL(REDIRECT_URL_FAILURE, requestUrl.origin));
  }

  // === AQUÍ ESTÁ LA CLAVE: await cookies() ===
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // No necesitamos que Supabase setee sus cookies
          // porque vos usás tu propia cookie custom
        },
        remove(name: string, options: any) {
          // Vacío intencionalmente
        },
      },
    }
  );

  try {
    console.log('CALLBACK: Intercambiando código por sesión...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error('CALLBACK ERROR:', error?.message || 'No session');
      return NextResponse.redirect(new URL(REDIRECT_URL_FAILURE, requestUrl.origin));
    }

    const accessToken = data.session.access_token;
    console.log('CALLBACK: Access token OK');

    // === TU LÓGICA CUSTOM SIGUE 100% IGUAL ===
    console.log('CALLBACK: Sincronizando sesión custom...');
    const sessionResponse = await fetch(`${requestUrl.origin}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken }),
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      console.error('CALLBACK: Error en /api/auth/session →', sessionResponse.status, errorText);
      return NextResponse.redirect(new URL('/login?error=sync_failed', requestUrl.origin));
    }

    const result = await sessionResponse.json();
    console.log('CALLBACK: Sesión custom OK. Rol:', result.role);

    const setCookieHeader = sessionResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.error('CALLBACK: No llegó set-cookie desde tu API');
      return NextResponse.redirect(new URL('/login?error=no_cookie', requestUrl.origin));
    }

    const redirectResponse = NextResponse.redirect(new URL(REDIRECT_URL_SUCCESS, requestUrl.origin));
    redirectResponse.headers.set('set-cookie', setCookieHeader);

    console.log('CALLBACK: Éxito total → /dashboard con tu cookie custom');
    return redirectResponse;

  } catch (e: any) {
    console.error('CALLBACK: Excepción:', e?.message || e);
    return NextResponse.redirect(new URL('/login?error=internal_error', requestUrl.origin));
  }
}