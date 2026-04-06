// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardLayout from '../components/DashboardLayout';
import DashboardContent from '../components/DashboardContent';
import { getPermisosDeMembresia } from './Configuracion/actions/actions';
import { getPermisosUser } from '../actions/actions';

export default async function DashboardPage() {
  let userData = null;
  let permisosUsuario = null;

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
//      console.log('DASHBOARD: UserData →', userData);
      try{
        const permisos = await getPermisosUser(userData.membresia.id)

        if(permisos){

          permisosUsuario = permisos;
    //    console.log('Permisos obtenidos:', permisosUsuario);
        }

      }catch(error){

      }
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
     userMembresia = {userData.membresia}
    >
      <DashboardContent
       userName={userData.name} 
       userRole={userData.role}
       userMembresia = {userData.membresia}
       usuario_permisos = {permisosUsuario}
       />
    </DashboardLayout>
  );
}