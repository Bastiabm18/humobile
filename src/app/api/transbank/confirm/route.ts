import { insertMembresia,registrarCobroTransbank } from '@/app/dashboard/serPremium/actions/actions';
import { NextRequest, NextResponse } from 'next/server';
import { WebpayPlus, Options, Environment } from 'transbank-sdk';

// Lógica compartida para no repetir código
async function procesarConfirmacion(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // 1. Extraer el token (puede venir por POST body o por GET query string)
  let token_ws = '';
  
  if (req.method === 'POST') {
    const formData = await req.formData();
    token_ws = formData.get('token_ws') as string;
  } else {
    // Transbank suele redirigir con un GET y el token en la URL
    token_ws = searchParams.get('token_ws') as string;
  }

  if (!token_ws) {
    return NextResponse.redirect(new URL('/dashboard/serPremium?error=no_token', req.url));
  }

  // 2. Extraemos la data que metimos en el returnUrl
  const userId = searchParams.get('userId');
  const planNombre = searchParams.get('planNombre');

  if (!userId || !planNombre) {
    return NextResponse.redirect(new URL('/dashboard/serPremium?error=datos_faltantes', req.url));
  }

  // 3. Configurar Transbank
  const tx = new WebpayPlus.Transaction(new Options(
    process.env.TBK_COMMERCE_CODE!,
    process.env.TBK_API_KEY!,
    process.env.TBK_ENVIRONMENT === 'production' ? Environment.Production : Environment.Integration
  ));

  try {
    // 4. Confirmar la transacción (Commit)
    const response = await tx.commit(token_ws);

     // Calculamos la fecha de fin (30 días)
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 30);

    //  Verificar si el pago fue APROBADO
    if (response.status === 'AUTHORIZED') {
      console.log(' Pago APROBADO para usuario:', userId);

       // 1. Guardamos en el historial
      await registrarCobroTransbank({
        token_ws: token_ws,
        perfil_id: userId,
        plan_nombre: planNombre!,
        monto: response.amount,
        estado_transaccion: response.status,
        codigo_autorizacion: response.authorization_code,
        orden_compra: response.buy_order,
        fecha_fin: fechaFin.toISOString()
      });

      
      //2. Actualizamos la membresía en la base de datos
      await insertMembresia(userId, planNombre as any, 'monthly');

      // Redirigimos a su panel con un mensaje de éxito
      return NextResponse.redirect(new URL('/dashboard/serPremium?success=true', req.url));
      
    } else {
      // Pago rechazado (Ej: Saldo insuficiente, tarjeta inválida)
      console.log(' Pago RECHAZADO. Código:', response.response_code);
      return NextResponse.redirect(new URL(`/dashboard/serPremium?error=rechazado&code=${response.response_code}`, req.url));
    }

  } catch (error: any) {
    console.error('Error al hacer commit en Transbank:', error);
    return NextResponse.redirect(new URL('/dashboard/serPremium?error=error_servidor', req.url));
  }
}

// Manejador para POST (por si acaso alguna vez lo manda así)
export async function POST(req: NextRequest) {
  return procesarConfirmacion(req);
}

// Manejador para GET (Es como Transbank realmente devuelve el control)
export async function GET(req: NextRequest) {
  return procesarConfirmacion(req);
}