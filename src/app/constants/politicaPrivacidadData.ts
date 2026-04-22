export interface SeccionPolitica {
  titulo: string;
  texto?: string;
  lista?: string[];
}

export const politicaPrivacidadData = {
  intro: "HUMOBILE SPA, en adelante “la Empresa”, respeta y protege la privacidad de los usuarios de su plataforma digital de agendamiento cultural, conforme a lo dispuesto en la Ley Nº 19.628 sobre Protección de la Vida Privada y demás normativa aplicable en Chile.",
  
  secciones: [
    {
      titulo: "1. Responsable del tratamiento",
      texto: "La Empresa es responsable del tratamiento de los datos personales recopilados a través de su sitio web y plataforma digital.\n\nRazón Social: HUMOBILE SpA\nRUT: 78.350.322-0\nDomicilio: Angol 436, Oficina 1004, Concepción, Chile"
    },
    {
      titulo: "2. Datos que recopilamos",
      texto: "Podemos recopilar los siguientes datos personales:",
      lista: [
        "Nombre y apellido",
        "RUT (cuando corresponda para efectos contractuales o tributarios)",
        "Correo electrónico",
        "Número de teléfono",
        "Información profesional o artística",
        "Datos de facturación",
        "Información bancaria (cuando sea necesaria para pagos o transferencias)",
        "Datos de navegación (cookies, IP, comportamiento en la plataforma)"
      ]
    },
    {
      titulo: "3. Finalidad del tratamiento",
      texto: "Los datos serán utilizados exclusivamente para:",
      lista: [
        "Gestionar el registro y uso de la plataforma",
        "Facilitar procesos de agendamiento y contratación",
        "Coordinar servicios y comunicaciones entre usuarios",
        "Emitir documentos tributarios cuando corresponda",
        "Enviar información relevante sobre el servicio",
        "Mejorar la experiencia del usuario y optimizar funcionalidades"
      ]
    },
    {
      titulo: "4. Base legal",
      texto: "El tratamiento de datos se realiza en virtud del consentimiento del titular y/o cuando sea necesario para la ejecución de un contrato o cumplimiento de obligaciones legales."
    },
    {
      titulo: "5. Almacenamiento y seguridad",
      texto: "La Empresa adopta medidas técnicas y organizativas para proteger los datos personales contra acceso no autorizado, pérdida, alteración o divulgación indebida.\n\nLos datos se almacenan en servidores seguros y solo el personal autorizado puede acceder a ellos."
    },
    {
      titulo: "6. Derechos del titular",
      texto: "El usuario podrá ejercer en cualquier momento los derechos de:",
      lista: [
        "Acceso a sus datos",
        "Rectificación",
        "Cancelación",
        "Oposición al tratamiento"
      ]
    },
    {
      titulo: "7. Transferencia de datos",
      texto: "La Empresa podrá compartir datos con proveedores tecnológicos o servicios asociados necesarios para el funcionamiento de la plataforma, bajo acuerdos de confidencialidad y seguridad.\n\nNo se realizarán transferencias internacionales sin cumplir las garantías legales correspondientes."
    },
    {
      titulo: "8. Uso de cookies",
      texto: "Nuestro sitio puede utilizar cookies para mejorar la experiencia del usuario, analizar tráfico y optimizar el servicio. El usuario puede configurar su navegador para rechazarlas."
    },
    {
      titulo: "9. Modificaciones",
      texto: "La Empresa se reserva el derecho de actualizar esta política para adaptarla a cambios normativos o mejoras en el servicio. Las modificaciones serán publicadas oportunamente en el sitio web."
    }
  ],

  fechaActualizacion: "Abril / 2026"
};