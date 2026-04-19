export interface pregunta_frecuente {
  id: string;
  pregunta: string;
  respuesta: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParametrosEmail {
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
  [key: string]: string;
}

export interface RespuestaEmail {
  exito: boolean;
  mensaje: string;
}
