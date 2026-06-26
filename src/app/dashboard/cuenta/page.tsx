// app/dashboard/serPremium/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardLayout from '@/app/components/DashboardLayout';
import CuentaContent from './components/CuentaContent';
import { getPermisosUser } from '@/app/actions/actions';


export default async function Cuenta() {
  let userData = null;
  let permisosUsuario = null;
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
    //console.log(data);

       try{
              const permisos = await getPermisosUser(userData.membresia.id)
      
              if(permisos){
      
                permisosUsuario = permisos;
            //   console.log('Permisos obtenidos:', permisosUsuario);
              }
      
            }catch(error){
      
            }
          
    

  } catch (error) {
    redirect('/login');
  }

  return (
    <DashboardLayout 
      userEmail={userData.email} 
      userName={userData.name} 
      userRole={userData.role}
      userMembresia={userData.membresia}
    >
     <CuentaContent userData={userData} usuarioPermisos={permisosUsuario} />
    </DashboardLayout>
  );
}