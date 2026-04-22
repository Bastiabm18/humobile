export interface SeccionTermo {
  titulo: string;
  texto?: string;
  lista?: string[];
  lista_expresa?: string[]; // Para la condición expresa de reembolso
}

export const terminosContratoData = {
  prestador: {
    razonSocial: "HUMOBILE SpA",
    rut: "78.350.322-0",
    domicilio: "Angol 436, Oficina 1004, Concepción, Chile"
  },
  
  secciones: [
    {
      titulo: "1. Descripción del servicio",
      texto: "HUMOBILE SpA es una plataforma digital que ofrece:",
      lista: [
        "Membresías mensuales y anuales según perfiles de usuario.",
        "Difusión y promoción de eventos publicados por usuarios o terceros con convenio."
      ]
    },
    {
      titulo: "2. Membresías y condiciones de pago",
      texto: "Las membresías podrán ser mensuales o anuales, diferenciadas según tipo de perfil. El pago de la membresía otorga acceso a funcionalidades específicas dentro de la plataforma.",
      lista_expresa: [
        "No existe derecho a reembolso una vez efectuada la compra de la membresía.",
        "El usuario acepta que el servicio es de acceso inmediato y consumo digital.",
        "Las suscripciones podrán renovarse automáticamente salvo cancelación previa."
      ],
      textoFinal: "Todos los pagos constituyen contraprestación por servicios digitales."
    },
    {
      titulo: "3. Eventos y publicaciones",
      texto: "Los eventos podrán ser publicados por usuarios de la plataforma o terceros con convenio comercial con HUMOBILE SpA.",
      lista: [
        "HUMOBILE SpA no garantiza la realización, calidad ni condiciones de los eventos publicados por terceros.",
        "La responsabilidad del evento recae exclusivamente en el organizador."
      ]
    },
    {
      titulo: "4. Condiciones tributarias (SII)",
      texto: "HUMOBILE SpA emitirá boletas o facturas electrónicas conforme a la normativa del Servicio de Impuestos Internos (SII). Los ingresos derivados de membresías, servicios digitales y convenios con terceros serán debidamente declarados como actividades afectas a tributación vigente. El usuario acepta recibir documentación tributaria electrónica."
    },
    {
      titulo: "5. Uso prohibido y control de fraude",
      texto: "Se prohíbe:",
      lista: [
        "Simulación de eventos",
        "Manipulación de publicaciones",
        "Generación de cobros indebidos",
        "Colusión entre usuarios y terceros"
      ],
      textoFinal: "HUMOBILE SpA podrá suspender cuentas, eliminar contenidos, retener accesos e iniciar acciones legales."
    },
    {
      titulo: "6. Limitación de responsabilidad",
      texto: "HUMOBILE SpA no será responsable por cancelaciones de eventos por terceros, pérdidas económicas derivadas de publicaciones ni fallas tecnológicas o interrupciones. El uso de la plataforma es bajo responsabilidad del usuario."
    },
    {
      titulo: "7. Legislación aplicable",
      texto: "Este documento se rige por las leyes de la República de Chile. Cualquier controversia será sometida a tribunales ordinarios de justicia."
    }
  ]
};