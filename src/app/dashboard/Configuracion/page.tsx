// app/dashboard/agenda/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getProfiles } from '../agenda/actions/actions';
import ConfiguracionContent from './components/ConfiguracionContent';

const SUPERADMIN_ROLES = process.env.NEXT_PUBLIC_SUPERADMIN 
  ? process.env.NEXT_PUBLIC_SUPERADMIN.split(',') 
  : ['USER'];

export default async function AgendaPage() {
  let userData = null;

 // console.log('config - SUPERADMIN_ROLES →', SUPERADMIN_ROLES)
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
   

    if(!SUPERADMIN_ROLES.includes(userData.role) ){
        redirect('/dashboard');
    }

  } catch (error) {
    redirect('/login');
  }
console.log('config - UserData →', userData);
  const profiles = await getProfiles(userData.uid);
// console.log('config - Profiles →', profiles);
    
  return (
    <DashboardLayout
         userEmail={userData.email} 
         userName={userData.name} 
         userRole={userData.role}
         userMembresia={userData.membresia}
         >
      <ConfiguracionContent userData={userData}  />
    </DashboardLayout>
  );
}