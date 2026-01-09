// types/profile.ts
export type ProfileType = 'artist' | 'band' | 'place'|'representative'|'producer';

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
  type: ProfileType;
  data: ArtistData | BandData | PlaceData;  // ← TIPADO CORRECTO
  created_at: string;
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

  id_solicitud:string;
  respuesta_solicitud:boolean;
  motivo:string;
  id_banda:string;
  id_artista:string;
  tipo?:string;

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
  tipo: 'grupo';
  titulo: string;
  creador: string;
  fechaInicio: Date;
  fechaFin: Date;
  plazoRespuesta: Date;
  estado: "pendiente" | "aceptada" | "rechazada" | "expirada";
  id_perfil: string;
  id_banda: string;
  tipo_invitacion: string;
  descripcion: string;
  created_at: string;
  nombre_artista?: string;
  nombre_banda?: string;
  origen_tabla: string;
}