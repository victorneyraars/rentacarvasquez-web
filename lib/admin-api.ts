import { API_URL } from './api';
import { obtenerJwt } from './auth-api';

// =========================================================
// Tipos
// =========================================================
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

// =========================================================
// Fetch helper con auth
// =========================================================
async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = obtenerJwt();
  if (!token) {
    throw new Error('No autenticado');
  }
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

// =========================================================
// Endpoints
// =========================================================
export async function getMe(): Promise<AdminUser> {
  const res = await authFetch('/api/v1/auth/me');
  if (!res.ok) {
    if (res.status === 401) throw new Error('Sesion expirada');
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export async function getReservas(estado?: string): Promise<AdminReserva[]> {
  const qs = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  const res = await authFetch(`/api/v1/mis-vehiculos-rentacar/reservas${qs}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
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
