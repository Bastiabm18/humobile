// lib/emailjs.ts

import { ParametrosEmail, RespuestaEmail } from "@/types/externo";



const SERVICIO_ID = process.env.EMAILJS_SERVICE_ID!;
const PLANTILLA_INVITACION = process.env.EMAILJS_TEMPLATE_INVITACION!;
const PLANTILLA_RESPUESTA = process.env.EMAILJS_TEMPLATE_RESPUESTA!;
const CLAVE_PUBLICA = process.env.EMAILJS_PUBLIC_KEY!;
const CLAVE_PRIVADA = process.env.EMAILJS_PRIVATE_KEY!;

async function enviarEmailJS(
  plantillaId: string, 
  parametros: ParametrosEmail
): Promise<RespuestaEmail> {
  try {
    const respuesta = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICIO_ID,
        template_id: plantillaId,
        user_id: CLAVE_PUBLICA,
        template_params: parametros,
        accessToken: CLAVE_PRIVADA,
      }),
    });

    // LEER COMO TEXTO PRIMERO para evitar el crash si EmailJS devuelve error en texto plano
    const textoRespuesta = await respuesta.text();

    // Si el status no es 200, imprimimos el error real y frenamos
    if (!respuesta.ok) {
      console.error('Error de API EmailJS (Status:', respuesta.status, '):', textoRespuesta);
      return { exito: false, mensaje: `Error de EmailJS: ${textoRespuesta}` };
    }

    // Si es exitoso, intentamos parsear el JSON
    try {
      const datos = JSON.parse(textoRespuesta);
      return { exito: true, mensaje: 'Email enviado correctamente' };
    } catch (e) {
      // Si el status es 200 pero no es JSON, asumimos que funcionó
      return { exito: true, mensaje: 'Email procesado' };
    }

  } catch (error: any) {
    console.error('Error en la peticion fetch:', error);
    return { exito: false, mensaje: error.message };
  }
}

// ==========================================
// FUNCION 1: INVITACION A EVENTO
// ==========================================
export async function enviarEmailInvitacionEvento({
  emailInvitado,
  nombreInvitado,
  tituloEvento,
  fechaEvento,
  nombreCreador,
}: {
  emailInvitado: string;
  nombreInvitado: string;
  tituloEvento: string;
  fechaEvento: string;
  nombreCreador: string;
}) {
  return enviarEmailJS(PLANTILLA_INVITACION, {
    to_email: emailInvitado,
    to_name: nombreInvitado,
    from_name: nombreCreador,
    subject: `Invitacion a evento: ${tituloEvento}`,
    message: `Has sido invitado al evento "${tituloEvento}".`,
    titulo_evento: tituloEvento,
    fecha_evento: fechaEvento,
  });
}

// ==========================================
// FUNCION 2: CONFIRMACION O RECHAZO
// ==========================================
export async function enviarEmailRespuestaParticipacion({
  emailParticipante,
  nombreParticipante,
  tituloEvento,
  fechaEvento,
  esConfirmacion,
}: {
  emailParticipante: string;
  nombreParticipante: string;
  tituloEvento: string;
  fechaEvento: string;
  esConfirmacion: boolean;
}) {
  return enviarEmailJS(PLANTILLA_RESPUESTA, {
    to_email: emailParticipante,
    to_name: nombreParticipante,
    from_name: 'Sistema de Eventos',
    subject: `Respuesta de participacion: ${tituloEvento}`,
    message: esConfirmacion ? 'Tu participacion ha sido confirmada.' : 'Has rechazado la invitacion.',
    titulo_evento: tituloEvento,
    fecha_evento: fechaEvento,
    es_confirmacion: esConfirmacion ? 'true' : 'false',
  });
}