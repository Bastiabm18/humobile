'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

export async function enviarCorreoContacto(
  email: string,
  asunto: string,
  mensaje: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Contacto <no-reply@humobile.cl>', // Mientras no verifiques tu dominio, usá este
      to: 'contacto@humobile.cl',               // A quién llega el correo
      replyTo: email,                            // Para que puedas responderle directamente
      subject: `[Contacto HUMOBILE] ${asunto}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b;">Nuevo mensaje de contacto</h2>
          
          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #a3a3a3; margin: 0 0 8px 0; font-size: 14px;">De:</p>
            <p style="color: #fff; margin: 0; font-size: 16px;">${email}</p>
          </div>

          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #a3a3a3; margin: 0 0 8px 0; font-size: 14px;">Asunto:</p>
            <p style="color: #fff; margin: 0; font-size: 16px;">${asunto}</p>
          </div>

          <div style="background: #1a1a1a; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #a3a3a3; margin: 0 0 8px 0; font-size: 14px;">Mensaje:</p>
            <p style="color: #d4d4d4; margin: 0; white-space: pre-wrap;">${mensaje.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>

          <hr style="border-color: #333; margin: 24px 0;" />
          <p style="color: #666; font-size: 12px; margin: 0;">
            Enviado desde el formulario de contacto de humobile.cl
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error de Resend:', error);
      throw new Error('Error al enviar el correo');
    }

    return { success: true, id: data?.id };

  } catch (error: any) {
    console.error('Error en enviarCorreoContacto:', error);
    throw error;
  }
}