// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardLayout from '../components/DashboardLayout';
import DashboardContent from '../components/DashboardContent';

export default async function DashboardPage() {
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

  return (
    <DashboardLayout
      userEmail={userData.email}
      userName={userData.name}
      userRole={userData.role}
     
    >
      <DashboardContent userName={userData.name} userRole={userData.role} />
    </DashboardLayout>
  );
}