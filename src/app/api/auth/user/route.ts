// app/api/auth/user/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decode } from 'jsonwebtoken';
import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';

const SESSION_COOKIE_NAME = 'supabaseAuthSession';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const accessToken = sessionCookie.value;
  const decoded: any = decode(accessToken);

  if (!decoded?.sub) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const uid = decoded.sub;
  const email = decoded.email;
  const name = decoded.user_metadata?.full_name || email?.split('@')[0] || 'Usuario';

  const supabaseAdmin = getSupabaseAdmin();

  const { data: userRecord, error } = await supabaseAdmin
    .from('User')
    .select('role')
    .eq('supabase_id', uid)
    .single();

  const role = userRecord?.role || 'USER';

  if (!['USER', 'ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
  }

  return NextResponse.json({
    uid,
    email,
    name,
    role,
  });
}