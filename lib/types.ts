// Tipos TypeScript compartidos para Rent a Car Vásquez.

export interface Vehiculo {
  id: string;
  prestador_id: string;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  categoria: string;
  precio_dia: number;
  disponible: boolean;
  imagen_url?: string | null;
}

export interface Prestador {
  id: string;
  nombre: string;
  slug: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  descripcion?: string;
  sitio_web?: string;
  comuna: string;
  region: string;
}

export interface Reserva {
  id: string;
  vehiculo_id: string;
  cliente_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  metodo_pago: string;
  precio_total: number;
  estado: string;
}

export interface ReservaCreate {
  vehiculo_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente?: string | null;
  metodo_pago: string;
  precio_total: number;
}

export interface ReservaResponse {
  id: string;
  vehiculo_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  metodo_pago: string;
  precio_total: number;
  estado: string;
}

export interface PerfilCompleto {
  id: string;
  slug: string;
  nombre: string;
  razon_social: string | null;
  categoria: { slug: string | null; nombre: string | null };
  descripcion: string | null;
  nap: {
    name: string;
    phone_e164: string;
    phone_display: string;
    address_single: string;
    address_postal: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
  };
  contacto: {
    telefono: string | null;
    whatsapp: string | null;
    whatsapp_mensaje: string | null;
    email: string | null;
    sitio_web: string | null;
  };
  gbp_place_id: string | null;
  gbp_maps_url: string | null;
  latitud: number | null;
  longitud: number | null;
  precio_desde: number | null;
  brand_kit_slug: string | null;
  perfil_negocio: {
    direccion_estructurada?: Record<string, string | undefined>;
    coordenadas?: { lat: number; lng: number };
    horario?: Record<string, Array<{ abre: string; cierra: string }>>;
    categorias_gbp?: { principal?: string; secundarias?: string[] };
    atributos_gbp?: Record<string, string[]>;
    pagos?: { metodos?: string[]; monedas?: string[] };
    precio_rango?: string;
    area_servicio?: { radio_km?: number; regiones?: string[]; ciudades?: string[] };
    redes?: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
      youtube?: string;
      google_business?: string;
      tripadvisor?: string;
    };
    descripciones?: { corta?: string; gbp?: string; larga?: string };
    fotos?: {
      logo_512?: string;
      portada?: string;
      galeria?: Array<{ url: string; tipo?: string; alt?: string }>;
    };
    reserva?: {
      booking_url?: string;
      mensajeria_habilitada?: boolean;
      tiempo_respuesta_horas?: number;
    };
    vertical_atributos?: Record<string, unknown>;
  } | null;
  redes_sociales: Record<string, unknown>;
  servicios: Array<{ nombre: string; descripcion: string | null; precio_desde: number | null }>;
  calificacion_promedio: number;
  total_resenas: number;
  verificado: boolean;
}
