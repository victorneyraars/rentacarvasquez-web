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
  telefono_cliente: string;
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
