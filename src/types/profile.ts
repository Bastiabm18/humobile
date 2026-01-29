

// types/profile.ts
export type ProfileType = 'artista' | 'banda' | 'lugar'|'representante'|'productor';

// Tipos para la data geográfica
export interface GeoItem {
    id: string; // UUID de la tabla
    name: string;
    parentId?: string; // Para Comunas (apunta a Region) o Regiones (apunta a Pais)
}

// Estructura de la data geográfica completa
export interface GeoData {
    paises: GeoItem[];
    regiones: GeoItem[];
    comunas: GeoItem[];
}


export interface ParticipanteEvento {
  id_perfil: string;
  nombre: string;
  tipo: string;
}

export interface categoriaEvento{
  id_categoria: string;
  nombre_categoria: string;
  descripcion_categoria: string;
  estado: string;
}


export interface EventoGuardar {
  titulo: string;
  descripcion: string;
  fecha_hora_ini: string | Date;
  fecha_hora_fin?: string | Date | null;
  id_categoria?: string | null;
  flyer_url?: string | null;
  video_url?: string | null;
  id_creador: string;
  creador_tipo_perfil: ProfileType;
  id_lugar?: string | null;
  nombre_lugar?: string | null;
  direccion_lugar?: string | null;
  lat_lugar?: number | null;
  lon_lugar?: number | null;
  id_productor?: string | null;
  tickets_evento?: string | null;
  es_publico?: boolean | null;
  es_bloqueado?: boolean | null;
  motivo_bloqueo?: string | null;
}

export interface EventoActualizar  {
  id: string;
  titulo: string;
  descripcion?: string | null;
  fecha_hora_ini: string;
  fecha_hora_fin?: string | null;
  id_categoria?: string | null;
  flyer_url?: string | null;
  video_url?: string | null;
  tickets_evento?: string | null;
  es_publico: boolean;

  id_lugar?: string | null;
  nombre_lugar?: string | null;
  direccion_lugar?: string | null;
  lat_lugar?: number | null;
  lon_lugar?: number | null;

  participantes: Array<{
    id_perfil: string;
    nombre: string;
    tipo: string;
  }>;
};

export interface FiltrosEventos {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoEvento?: string;
  artista?: string;
}

export interface FiltrosPerfiles {
  artista: boolean;
  banda: boolean;
  lugar: boolean;
}



// Data para el formulario de Artista
export interface ArtistData {
    name: string;
    phone: string;
    email:string;
    // IDs Geográficos que se envían a la DB
    countryId: string;
    regionId: string;
    cityId: string; 
    image_url: string;
    updateAt: string;
    perfil_visible: boolean;
    tipo_perfil:string;
  
}

export interface BandData {
  band_name: string;
  style: string;
  music_type: string;
  is_tribute: boolean;
  contact_phone: string;
  cityId: string; // ID de la Comuna/Ciudad seleccionada
  regionId: string; // ID de la Región seleccionada
  countryId: string; // ID del País seleccionado
  photo_url?: string;
  video_url?: string;
  updateAt: string;
  integrante: [];
  tipo_perfil:string;
  email?:string;
}

export interface PlaceData {
  place_name: string;
  address: string;
  cityId: string;
  regionId: string;
  countryId: string;
  phone: string;
  place_type: 'pub' | 'bar' | 'event_center' | 'disco' | 'other';
  lat: number;
  lng: number;
  photo_url?: string;
  video_url?: string;
    singer: boolean;
    band: boolean;
    actor: boolean;
    comedian: boolean;
    impersonator: boolean;
    tribute: boolean;
    updateAt: string;
  perfil_visible: boolean;
  email?:string;
}

export interface Profile {
  id: string;
  tipo: ProfileType;
  nombre: string;
  email?: string;
  imagen_url?: string;
  video_url?: string;
  created_at: string;
  ciudad_id?: string;
  region_id?: string;
  pais_id?: string;
  telefono?:string;
  integrante?:string[];
  direccion?:string;
  lat?:number;
  lon?:number;
  pertenece_a_grupo?:ArtistaEnBanda[]
}

export interface ArtistaEnBanda{
  id_banda:string
  nombre_banda:string;
  tipo:string;
  desde:Date;
}

export interface BlockDateRangeParams {
  creator_profile_id: string;
  creator_type: 'artist' | 'band' | 'place';
  title: string;
  reason: string;
  fecha_hora_ini: Date;
  fecha_hora_fin: Date;
  is_blocked: boolean;
  blocked_reason: string;
  
}

export interface evento {

  id: string;
  creator_profile_id: string;
  creator_type: 'artist' | 'band' | 'place';
  id_artista: string;
  nombre_artista: string;
  id_tipo_artista: string;
  title: string;
  description: string;
  fecha_hora_ini: Date;
  fecha_hora_fin: Date;
  place_profile_id: string;
  custom_place_name: string;
  address:string;
  organizer_name:string;
  organizer_contact:string;
  ticket_link:string;
  instagram_link:string;
  flyer_url:string;
  category:string;
  status: string;
  created_at:string;
  updated_at:string;
  is_blocked: boolean;
  blocked_reason: string;
  integrantes?: string[]; // IDs de integrantes si aplica

}
export interface eventoCompleto {
  // Campos de events
  id: string;
  creator_profile_id: string;
  creator_type: 'artist' | 'band' | 'place';
  title: string;
  description: string;
  place_profile_id: string | null;
  custom_place_name: string | null;
  address: string | null;
  organizer_name: string;
  organizer_contact: string | null;
  ticket_link: string | null;
  instagram_link: string | null;
  flyer_url: string | null;
  category: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
  fecha_hora_ini: string;
  fecha_hora_fin: string;
  is_blocked: boolean;
  blocked_reason: string | null;
  id_artista: string | null;
  id_tipo_artista: string | null;
  nombre_artista: string | null;
  
  // Arrays (usamos any como pediste)
  participantes: any[];
  artistas: any[];
  bandas: any[];
  lugares: any[];
  integrantes: any[];
}

// Interfaz principal que representa la tabla 'perfil'
export interface Perfil {
  // IDENTIFICACIÓN
  id_perfil: string;
  usuario_id: string;
  tipo_perfil: 'artista' | 'banda' | 'local' | 'productor' | 'representante';
  
  // DATOS BÁSICOS COMUNES
  nombre: string;
  email: string | null;
  direccion: string | null;
  lat: number | null;
  lon: number | null;
  telefono_contacto: string | null;
  imagen_url: string | null;
  video_url: string | null;
  perfil_visible: boolean;
  
  // UBICACIÓN (IDs)
  id_comuna: string;
  id_region: string;
  id_pais: string;
  
  // METADATOS
  creado_en: string;
  actualizado_en: string;
  
  // DATOS ESPECÍFICOS POR TIPO (JSONB)
  artista_data: Record<string, any>;  // JSON object
  banda_data: Record<string, any>;    // JSON object
  local_data: Record<string, any>;    // JSON object
  productor_data: Record<string, any>; // JSON object
  representante_data: Record<string, any>; // JSON object

  //DATOS PARA BANDA Y REPRESENTANTE
  integrantes_perfil?: string[]; // Array de IDs de integrantes del perfil
  representados_perfil?: string[]; // Array de IDs de perfiles representados
  nombre_integrantes?: string[]; // Nombres de los integrantes del perfil
  nombre_representados?: string[]; // Nombres de los representados del perfil
  integrantes_eliminar?: string[]; // IDs de integrantes a eliminar
  representados_eliminar?: string[]; // IDs de representados a eliminar
  bandas_ids?: string[]; // IDs de las bandas asociadas (si aplica)
  bandas_nombres?: string[]; // Nombres de las bandas asociadas (si aplica)
  representantes_ids?: string[]; // IDs de los representantes asociados (si aplica)
  representantes_nombres?: string[]; // Nombres de los representantes asociados (si aplica)
}
export interface PerfilConIntegrantes {
  // IDENTIFICACIÓN
  id_perfil: string;
  usuario_id: string;
  tipo_perfil: 'artista' | 'banda' | 'local' | 'productor' | 'representante';
  
  // DATOS BÁSICOS COMUNES
  nombre: string;
  email: string | null;
  direccion: string | null;
  lat: number | null;
  lon: number | null;
  telefono_contacto: string | null;
  imagen_url: string | null;
  video_url: string | null;
  perfil_visible: boolean;
  
  // UBICACIÓN (IDs)
  id_comuna: string;
  id_region: string;
  id_pais: string;
  
  // METADATOS
  creado_en: string;
  actualizado_en: string;
  
  // DATOS ESPECÍFICOS POR TIPO (JSONB)
  artista_data: Record<string, any>;  // JSON object
  banda_data: Record<string, any>;    // JSON object
  local_data: Record<string, any>;    // JSON object
  productor_data: Record<string, any>; // JSON object
  representante_data: Record<string, any>; // JSON object

  //DATOS PARA BANDA Y REPRESENTANTE
  integrantes_perfil?: string[]; // Array de IDs de integrantes del perfil
  representados_perfil?: string[]; // Array de IDs de perfiles representados
  nombre_integrantes?: string[]; // Nombres de los integrantes del perfil
  nombre_representados?: string[]; // Nombres de los representados del perfil
  representantes_ids?: string[]; // IDs de los representantes asociados (si aplica)
  representantes_nombres?: string[]; // Nombres de los representantes asociados (si aplica)
  bandas_ids?: string[]; // IDs de las bandas asociadas (si aplica)
  bandas_nombres?: string[]; // Nombres de las bandas asociadas (si aplica)

}

// Interfaz para perfil básico
export interface PerfilSelect {
  id_perfil: string;
  nombre: string;
  tipo_perfil: string;
  perfil_visible: boolean;
}


export interface InvitacionData {
  id_perfil:string;
  id_banda:string;
  fecha_invitacion:string;
  fecha_vencimiento:string;
  nombre_banda: string;
  invitacion: string;
  descripcion: string;
  tabla_origen:string;
}

export interface User{

  id: string;
  supabase_id: string;
  name: string;
  role: string;
  email: string;
  telefono: string;
  createdAt: string;
  updatedAt: string;
  membresia: string;
  perfiles: string;
  perfil_artista: number;
  perfil_banda: number;
  perfil_lugar: number;
  estado: string;
  membership_precio: number;
  membership_inicio: string | null;
  membership_fin: string | null;
  membership_estado: string;
}

export type UserWithMembership = {
 
  role: string;
  email: string;
  supabase_id: string;
  membership_id: string;
  membership_nombre: string;
  membership_precio: number;
  membership_ini: string;
  membership_fin: string | null;
  membership_estado: string;
};

export interface EventoCalendario {

  id:string;
  titulo:string;
  descripcion:string;
  inicio:Date;
  fin:Date;
  id_categoria:string;
  nombre_categoria:string;
  flyer_url?:string;
  video_url?:string;
  id_creador:string;
  nombre_creador:string;
  tipo_perfil_creador:string;
  id_lugar:string;
  nombre_lugar:string;
  direccion_lugar:string;
  lat_lugar:string;
  lon_lugar:string;
  id_productor?:string;
  nombre_productor?:string;
  tickets_evento:string;
  es_publico:boolean;
  es_bloqueo:boolean;
  motivo_bloqueo?:string;
  created_at:Date;
  updated_at:Date;

  //Participantes extras

 participantes:IntegranteBandaEvento [];


  // Estadísticas de participación
  total_participantes?: number;
  pendientes?: number;
  confirmados?: number;
  rechazados?: number;
  porcentaje_aprobacion?: number;
  estado_participacion?: string;

  // indica si es evento de los integrantes en caso de ser banda 

  es_evento_integrante?:boolean;




}

export interface IntegranteBandaEvento {

  id_participante:string;
  nombre_participante:string;
  tipo_perfil_participante:string;
  integrantes_banda?:{
      id_integrante:string;
      nombre_integrante:string;
      } []; // el [] para que sea un array de integrantes si son N cantidad
}

// types/calendar.ts
export interface CalendarEvent {
  // Campos obligatorios para react-big-calendar
  id: string;
  title: string;
  start: Date;
  end: Date;
  
  // Campos adicionales opcionales para el calendario
  description?: string;
  category?: string;
  status?: string;
  allDay?: boolean;
  tipo:string;
  // Objeto con todos los datos originales
  resource: {
    creator_profile_id: string;
    creator_type: 'artist' | 'band' | 'place';
    fecha_hora_ini: Date;
    fecha_hora_fin: Date;
    place_profile_id: string;
    custom_place_name: string;
    address: string;
    organizer_name: string;
    organizer_contact: string;
    ticket_link: string;
    instagram_link: string;
    flyer_url: string;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
    is_blocked: boolean;
    blocked_reason: string;
  };
}

export interface AceptarRechazarEvento{
  id_evento:string;
  motivo:string;
  id_perfil:string;

}

export interface AceptarRechazarSolicitud{

    id_solicitud: string;
    codigo_solicitud:string;
    id_evento_solicitud:string;
    id_invitado:string;
    id_creador:string;
    motivo_rechazo?:string

}
type TipoSolicitud = "grupo" | "evento" | "booking";

export interface Solicitud {
  id: string;
  tipo: TipoSolicitud;
  titulo: string;
  creador: string;
  fechaInicio: Date;
  fechaFin: Date;
  plazoRespuesta: Date;
  estado: "pendiente" | "aceptada" | "rechazada" | "expirada";
  solicitudData?: any;
}


export interface SolicitudRespuesta {
  id: string;
  id_tipo_solicitud: string;
  tipo_solicitud: string;
  codigo_solicitud: string;
  nombre_solicitud: string;
  descripcion_solicitud: string;
  creador_id: string;
  creador_nombre: string;
  creador_tipo: string;
  invitado_id: string;
  invitado_nombre: string;
  invitado_tipo: string;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  plazoRespuesta: Date;
  estado: string;
  motivo_rechazo: string;
  id_evento_solicitud: string;
  evento_titulo?: string;
  evento_fecha_inicio?: Date;
  evento_fecha_fin?: Date;
  es_invitacion_banda?: boolean;
  nombre_banda_asociada?: string;
}