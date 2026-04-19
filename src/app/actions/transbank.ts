'use server';

import { WebpayPlus, Options, Environment } from 'transbank-sdk';

export async function iniciarTransaccionWebpay(monto: number, planNombre: string, userId: string) {
  const environment = process.env.TBK_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Integration;

  const tx = new WebpayPlus.Transaction(new Options(
    process.env.TBK_COMMERCE_CODE!,
    process.env.TBK_API_KEY!,
    environment
  ));

  try {
    // Generamos claves
    const buyOrder = `O-${Date.now().toString(36).toUpperCase()}`; // Ej: O-LZ1K2M3 
    const sessionId = `S-${Math.random().toString(36).substring(2, 10)}`; // Ej: S-x8f2a1b9 

    // El userId va en la URL, NO en la odc 
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/transbank/confirm?userId=${userId}&planNombre=${planNombre}`;

    const response = await tx.create(buyOrder, sessionId, monto, returnUrl);

    return {
      success: true,
      token: response.token,
      url: response.url
    };
  } catch (error: any) {
    console.error('Error Transbank:', error);
    return {
      success: false,
      message: error.message || 'Error al conectar con Transbank'
    };
  }
}