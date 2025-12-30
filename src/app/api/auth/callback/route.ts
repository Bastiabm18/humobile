// /app/api/auth/callback/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function getCookieFromHeaders(request: NextRequest, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : undefined;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const REDIRECT_URL_SUCCESS = '/dashboard';
  const REDIRECT_URL_FAILURE = '/login?error=auth_failed';

  console.log('CALLBACK: Iniciado con code:', code ? 'SÍ' : 'NO');

  if (!code) {
    console.warn('CALLBACK: No hay código OAuth. Redirigiendo a login.');
    return NextResponse.redirect(new URL(REDIRECT_URL_FAILURE, request.url));
  }

  const supabaseServer = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => getCookieFromHeaders(request, name),
        set: () => {},
        remove: () => {},
      },
    }
  );

  try {
    console.log('CALLBACK: Intercambiando código por sesión...');
    const { data, error } = await supabaseServer.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      console.error('CALLBACK ERROR:', error?.message || 'No session');
      return NextResponse.redirect(new URL(REDIRECT_URL_FAILURE, request.url));
    }

    const accessToken = data.session.access_token;
    console.log('CALLBACK: Access token OK');

    console.log('CALLBACK: Llamando a /api/auth/session...');
    const sessionResponse = await fetch(`${requestUrl.origin}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken }),
    });

    if (!sessionResponse.ok) {
      const errorText = await sessionResponse.text();
      console.error('CALLBACK: Error en /api/auth/session →', sessionResponse.status, errorText);
      return NextResponse.redirect(new URL('/login?error=sync_failed', request.url));
    }

    const result = await sessionResponse.json();
    console.log('CALLBACK: Sesión sincronizada. Rol:', result.role);

    // === COPIAR set-cookie ===
    const setCookieHeader = sessionResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      console.error('CALLBACK: NO HAY set-cookie');
      return NextResponse.redirect(new URL('/login?error=no_cookie', request.url));
    }

    const redirectResponse = NextResponse.redirect(new URL(REDIRECT_URL_SUCCESS, request.url));
    redirectResponse.headers.set('set-cookie', setCookieHeader);
    console.log('CALLBACK: Redirigiendo con cookie → /dashboard');

    return redirectResponse;

  } catch (e: any) {
    console.error('CALLBACK: Excepción:', e?.message || e);
    return NextResponse.redirect(new URL('/login?error=internal_error', request.url));
  }
}