
// app/perfil/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getProfiles } from '../../dashboard/agenda/actions/actions';
import PerfilContent from './components/PerfilContent';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getPermisosUser } from '@/app/actions/actions';



export default async function PerfilPage() {
  let userData = null;
  let permisosUsuario = null;
  let perfilesUsuarioLogueado = null;

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.get('supabaseAuthSession')?.value;

    // 1. Obtener Sesión
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/session`, {
      method: 'GET',
      cache: 'no-store',
      headers: cookieHeader
        ? { Cookie: `supabaseAuthSession=${cookieHeader}` }
        : {},
    });

    if (res.ok) {
      const data = await res.json();
      userData = data.user;
    }

    // 2. Obtener Permisos (solo si hay usuario y membresía)
    if (userData?.membresia?.id) {
      try {
        const permisos = await getPermisosUser(userData.membresia.id);
        if (permisos) {
          permisosUsuario = permisos;
        }
      } catch (error) {
        console.error('Error al obtener permisos:', error);
      }
    }
  } catch (error) {
    console.error('Error fetching user session:', error);
  }

  // 3. Validación Temprana (Evita errores de "reading properties of null")
  if (!userData) {
    redirect('/login');
  }

  // 4. Carga de datos adicionales (Ahora es seguro porque userData existe)
  try {
    perfilesUsuarioLogueado = await getProfiles(userData.uid);
  } catch (error) {
    console.error('Error fetching profiles:', error);
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