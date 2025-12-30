// /app/api/auth/session/route.ts
import { NextResponse, NextRequest } from "next/server";
import { decode } from "jsonwebtoken";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/supabase-admin";
import { getSupabaseBrowser } from "@/lib/supabase/supabase-client";
import { UserWithMembership} from '@/types/profile'

const SESSION_COOKIE_NAME = "supabaseAuthSession";
const expiresIn = 60 * 60 * 24 * 5; // 5 días
// ===========================================
// POST: CREAR SESIÓN + SINCRONIZAR DB + DEVOLVER COOKIE
// ===========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        console.log("POST /api/auth/session → Iniciado");

        const body: { token?: string } = await request.json();
        const accessToken = body.token;

        if (!accessToken) {
            console.warn("POST: Falta token");
            return NextResponse.json({ success: false, message: "Token required" }, { status: 400 });
        }

        const decodedToken: any = decode(accessToken);
        if (!decodedToken?.sub || decodedToken.aud !== 'authenticated') {
            console.warn("POST: Token inválido");
            return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
        }

        const uid = decodedToken.sub;
        const email = decodedToken.email;
        const fullName = decodedToken.user_metadata?.full_name;
        const name = fullName ? fullName.trim() : email?.split('@')[0] || 'Usuario';

        console.log(`POST: UID=${uid}, Email=${email}, Name=${name}`);

        const supabaseAdmin = getSupabaseAdmin();
        let userRole = 'USER';
        let userId: string | null = null; 

        // === 1. BUSCAR ID DE MEMBRESÍA 'GRATIS' ===
        const { data: freeMembership, error: freeError } = await supabaseAdmin
            .from('Membership')
            .select('id_membership')
            .eq('nombre', 'GRATIS') // Usamos el nombre 'GRATIS'
            .single();

        if (freeError || !freeMembership) {
            console.error("ERROR CRÍTICO: No se pudo encontrar el ID de la membresía GRATIS. Verifique la tabla Membership.");
            return NextResponse.json({ success: false, message: "Critical setup error: Missing GRATIS membership" }, { status: 500 });
        }
        const freeMembershipId = freeMembership.id_membership;
        
        // === 2. BUSCAR USUARIO EN DB ===
        let { data: userRecord, error: dbError } = await supabaseAdmin
            .from('User')
            .select('id, role') 
            .eq('supabase_id', uid)
            .single();

        if (dbError && dbError.code === 'PGRST116') {
            console.log("POST: Usuario no existe → INSERTANDO");

            const newUser = {
                supabase_id: uid,
                email: email || 'nocorreo@disponible',
                name: name,
                role: 'user',
                // current_state_id se establece después
            };

            // 2.1. INSERTAR USUARIO
            const { data: inserted, error: insertError } = await supabaseAdmin
                .from('User')
                .insert([newUser])
                .select('id, role') // Seleccionar el PK 'id'
                .single();

            if (insertError) {
                console.error("INSERT ERROR:", insertError.message);
            } else {
                userRole = inserted?.role || 'USER';
                userId = inserted?.id; // 2.2. OBTENER PK DEL USUARIO

                if (userId) {
                    console.log("POST: Insertando estado de membresía GRATIS.");
                    
                    // 2.3. CREAR REGISTRO EN MEMBERSHIPSTATE
                    const newState = {
                        user_id: userId,
                        membership_id: freeMembershipId,
                        // fecha_fin es NULL por defecto (ilimitada para GRATIS)
                    };

                    const { data: stateInserted, error: stateError } = await supabaseAdmin
                        .from('MembershipState')
                        .insert([newState])
                        .select('id_state')
                        .single();

                    if (stateError) {
                        console.error("STATE INSERT ERROR:", stateError.message);
                    } else if (stateInserted) {
                        // 2.4. ACTUALIZAR USER CON CURRENT_STATE_ID
                        await supabaseAdmin
                            .from('User')
                            .update({ current_state_id: stateInserted.id_state })
                            .eq('id', userId);
                        console.log("POST: Usuario y Membresía GRATIS sincronizados.");
                    }
                }
            }
        } else if (userRecord) {
            userRole = userRecord.role;
            userId = userRecord.id;
            console.log("POST: Usuario encontrado → Rol:", userRole);
        } else if (dbError) {
            console.error("DB ERROR:", dbError.message);
        }

        // === 3. RESPUESTA CON set-cookie HEADER ===
        const response = NextResponse.json(
            { success: true, message: "Session synced", role: userRole },
            { status: 200 }
        );

        const cookieValue = `${SESSION_COOKIE_NAME}=${accessToken}; Path=/; HttpOnly; Max-Age=${expiresIn}; SameSite=Lax${
            process.env.NODE_ENV === "production" ? "; Secure" : ""
        }`;

        response.headers.set("set-cookie", cookieValue);
        console.log("POST: set-cookie HEADER ENVIADO →", SESSION_COOKIE_NAME);

        return response;

    } catch (error: any) {
        console.error("POST CRITICAL ERROR:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

// ===========================================
// GET: OBTENER USUARIO + ROL DESDE COOKIE
// ===========================================
export async function GET(): Promise<NextResponse> {
  try {
    console.log("GET /api/auth/session → Verificando cookie");

    const cookieStore = await cookies(); // ← CORRECTO
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie) {
      console.log("GET: No hay cookie");
      return NextResponse.json({ user: null });
    }

    const accessToken = sessionCookie.value;
    const decoded: any = decode(accessToken);

    if (!decoded?.sub) {
      console.log("GET: Token inválido");
      return NextResponse.json({ user: null });
    }

    const uid = decoded.sub;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: userRecord, error } = await supabaseAdmin
      .rpc('get_user_membresia', { user_uid: uid })
      .single() as {data: UserWithMembership | null; error:any} ;

    if (error || !userRecord) {
      console.error("GET: Error DB →", error?.message);
      return NextResponse.json({ user: null });
    }

        //console.log("DEBUG userRecord:", {
        //  role: userRecord.role,
        //  email: userRecord.email,
        //  membership_ini: userRecord.membership_ini,
        //  membership_fin: userRecord.membership_fin,
        //  membership_estado: userRecord.membership_estado,
        //  ALL_KEYS: Object.keys(userRecord)
        //});
    const user = {
      uid,
      email: userRecord.email || decoded.email, // ← email
      role: userRecord.role || 'ADMIN', // ← role
      name: decoded.user_metadata?.full_name || decoded.email?.split('@')[0] || 'Usuario',
      membresia: {
        id: userRecord.membership_id,
        nombre_membresia: userRecord.membership_nombre, // ← membership_name
        precio_membresia: userRecord.membership_precio, // ← membership_price
        fecha_ini_membresia: userRecord.membership_ini, // ← membership_start
        fecha_fin_membresia: userRecord.membership_fin, // ← membership_end
        estado_membresia: userRecord.membership_estado // ← membership_status
      }
    };
    console.log("GET: Usuario OK →", user.role);
    return NextResponse.json({ user });

  } catch (error: any) {
    console.error("GET ERROR:", error);
    return NextResponse.json({ user: null });
  }
}

// ===========================================
// DELETE: LOGOUT (BORRAR COOKIE)
// ===========================================
export async function DELETE(): Promise<NextResponse> {
  try {
    console.log("DELETE /api/auth/session → Logout iniciado");

    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();

    const response = NextResponse.json({ success: true, message: "Logged out" });
    response.cookies.delete(SESSION_COOKIE_NAME);

    console.log("DELETE: Cookie borrada");
    return response;

  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}