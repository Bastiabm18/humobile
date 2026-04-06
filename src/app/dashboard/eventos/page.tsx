// app/dashboard/agenda/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getProfiles } from '../agenda/actions/actions';
import EventoContent from './components/EventoContent';
import { getPermisosUser } from '@/app/actions/actions';


export default async function AgendaPage() {
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

                 try{
                    const permisos = await getPermisosUser(userData.membresia.id)
            
                    if(permisos){
            
                      permisosUsuario = permisos;
                  //   console.log('Permisos obtenidos:', permisosUsuario);
                    }
            
                  }catch(error){
                    console.error('Error al obtener permisos:', error);
                  }
    

  } catch (error) {
    redirect('/login');
  }
//console.log('Agenda - UserData →', userData);
  const typedProfiles = await getProfiles(userData.uid);

  //console.log('Agenda - Profiles →', typedProfiles);
    
  return (
    <DashboardLayout 
        userEmail={userData.email} 
        userName={userData.name} 
        userRole={userData.role}
        userMembresia={userData.membresia}
        >
      <EventoContent initialProfiles={typedProfiles} userId={userData.id} userName={userData.name} usuarioPermisos={permisosUsuario} />
    </DashboardLayout>
  );
}