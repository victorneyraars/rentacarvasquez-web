import { API_URL } from './api';
import { obtenerJwt } from './auth-api';

export interface AdminUser {
  id: string;
  email: string | null;
  nombre: string | null;
  rol: string;
  verificado: boolean;
  activo: boolean;
  avatar_url: string | null;
  created_at: string;
  ultimo_login: string | null;
}

export interface AdminReserva {
  id: string;
  vehiculo_id: string;
  vehiculo_label?: string;
  fecha_inicio: string;
  fecha_fin: string;
  metodo_pago: string;
  precio_total: number;
  estado: string;
  nombre_cliente: string | null;
  email_cliente: string | null;
  telefono_cliente: string | null;
  email_verificado: boolean;
}

export interface AdminStats {
  reservas_pendientes: number;
  reservas_confirmadas: number;
  ingresos_mes: number;
  vehiculos_disponibles: number;
  ocupacion_pct: number;
}

export interface AdminVehiculo {
  id: string;
  marca: string;
  modelo: string;
  patente: string;
}

export interface ReservaFiltros {
  estado?: string;
  busqueda?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  vehiculo_id?: string;
  page?: number;
  page_size?: number;
}

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = obtenerJwt();
  if (!token) throw new Error('No autenticado');
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getMe(): Promise<AdminUser> {
  const res = await authFetch('/api/v1/auth/me');
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesion expirada');
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export async function getReservas(
  filtros: ReservaFiltros = {},
): Promise<{ data: AdminReserva[]; total: number }> {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value));
  });
  const res = await authFetch(
    `/api/v1/mis-vehiculos-rentacar/reservas?${params.toString()}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  const json = await res.json();
  // El backend puede devolver array directo o {data, total}
  if (Array.isArray(json)) return { data: json, total: json.length };
  return json;
}

export async function getReserva(id: string): Promise<AdminReserva> {
  const res = await authFetch(`/api/v1/mis-vehiculos-rentacar/reservas/${id}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function cambiarEstadoReserva(
  id: string,
  estado: 'confirmada' | 'cancelada',
): Promise<AdminReserva> {
  const res = await authFetch(
    `/api/v1/mis-vehiculos-rentacar/reservas/${id}/estado`,
    {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function getStats(): Promise<AdminStats> {
  const res = await authFetch('/api/v1/mis-vehiculos-rentacar/stats');
  if (!res.ok) throw new Error('Error al cargar stats');
  const data = await res.json();

  // Shape real del backend:
  // { vehiculos_total, vehiculos_disponibles, reservas_pendientes,
  //   reservas_confirmadas, ingresos_mes_actual, ... }
  const total = data.vehiculos_total ?? 0;
  const disp = data.vehiculos_disponibles ?? 0;
  const ocupacion = total > 0 ? Math.round(((total - disp) / total) * 100) : 0;

  return {
    reservas_pendientes: data.reservas_pendientes ?? 0,
    reservas_confirmadas: data.reservas_confirmadas ?? 0,
    ingresos_mes: data.ingresos_mes_actual ?? 0,
    vehiculos_disponibles: disp,
    ocupacion_pct: ocupacion,
  };
}

export async function getVehiculos(): Promise<AdminVehiculo[]> {
  const res = await authFetch('/api/v1/mis-vehiculos-rentacar');
  if (!res.ok) throw new Error('Error al cargar vehiculos');
  return res.json();
}
