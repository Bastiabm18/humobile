"use server"
// app/perfil/page.tsx
import { cookies } from 'next/headers';
import { getProfiles } from '../../dashboard/agenda/actions/actions'
import PerfilContent from './components/PerfilContent';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getPermisosUser } from '@/app/actions/actions';

export default async function PerfilPage() {
  let perfilesUsuarioLogueado = null;
  let userData=null;
  let permisosUsuario = null;

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('supabaseAuthSession')?.value;

    if (sessionCookie) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
        headers: {
          Cookie: `supabaseAuthSession=${sessionCookie}`,
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();

        if (data.user?.uid) {
          perfilesUsuarioLogueado = await getProfiles(data.user.uid);
        }
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
        
      }
    }
  } catch (error) {
    // Usuario no logueado - modo público
    perfilesUsuarioLogueado = null;
  }

  return (
     <DashboardLayout
         userEmail={userData.email} 
         userName={userData.name} 
         userRole={userData.role}
         userMembresia={userData.membresia}
         >

           <PerfilContent 
             perfilesUsuarioLogueado={perfilesUsuarioLogueado} usuarioPermisos={permisosUsuario}
           />
         </DashboardLayout>
  );
}