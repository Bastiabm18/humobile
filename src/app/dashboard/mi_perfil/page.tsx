// app/dashboard/mi_perfil/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import ProfileManager from './components/PerfilContent';
import { getGeoData, getProfiles } from './actions/actions';
import PerfilContent from './components/PerfilContent';

export default async function MiPerfilPage() {
  let userData = null;

  try {
    // AWAIT cookies() → ES UNA PROMESA
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.get('supabaseAuthSession')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
      method: 'GET',
      cache: 'no-store',
      headers: cookieHeader
        ? { Cookie: `${'supabaseAuthSession'}=${cookieHeader}` }
        : {},
    });

    if (res.ok) {
      const data = await res.json();
      userData = data.user;
      console.log('DASHBOARD: UserData →', userData);
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }

  if (!userData) {
    redirect('/login');
  }

  const geoData = await getGeoData();
  console.log('Mi Perfil - UserData final →', userData);
  const initialProfiles = await getProfiles(userData.uid);

  console.log('Mi Perfil - Initial Profiles →', initialProfiles);
  return (
    <DashboardLayout
  
        userEmail={userData.email}
        userName={userData.name}
        userRole={userData.role}
    >
      <PerfilContent
        initialProfiles={initialProfiles}
        userEmail={userData.email || ''}
        userName={userData.name || ''}
        userId={userData.uid || ''}
        geoData={geoData}
      />
    </DashboardLayout>
  );
}