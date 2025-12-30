// app/dashboard/agenda/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getProfiles } from './actions/actions';
import SolicitudesContent from './components/SolicitudesContent';

export default async function AgendaPage() {
  let userData = null;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('supabaseAuthSession')?.value;

    if (!sessionCookie) throw new Error('No session');

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
      headers: {
        Cookie: `supabaseAuthSession=${sessionCookie}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('No session');
    const data = await res.json();
    userData = data.user;

  } catch (error) {
    redirect('/login');
  }
//console.log('Agenda - UserData →', userData);
  const profiles = await getProfiles(userData.uid);
  console.log('SOLICITUDES - Profiles →', profiles);
    
  return (
    <DashboardLayout userEmail={userData.email} userName={userData.name} userRole={userData.role}>
      <SolicitudesContent initialProfiles={profiles} userId={userData.id} userName={userData.name} />
    </DashboardLayout>
  );
}