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
  vehiculo_patente?: string | null;
  vehiculo_marca?: string | null;
  vehiculo_modelo?: string | null;
  vehiculo_imagen_url?: string | null;
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

// ── Colaboradores ─────────────────────────────────────────────
export async function aceptarInvitacion(prestadorId: string, token: string) {
  const jwt = obtenerJwt();
  if (!jwt) throw new Error('No hay sesión activa');

  const res = await fetch(
    `${API_URL}/api/v1/mis-prestadores/${prestadorId}/colaboradores/aceptar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ token }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al aceptar invitación');
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════
// FASE 6: COLABORADORES + AUDITORÍA
// ═══════════════════════════════════════════════════════════════

export interface AdminColaborador {
  email: string;
  nombre: string;
  whatsapp: string | null;
  invitado_por: string;
  invitado_at: string;
  activado_at: string | null;
  rol: string;
}

export interface InvitarColaboradorPayload {
  email: string;
  nombre: string;
  whatsapp?: string;
}

export interface AdminAuditLogEntry {
  id: string;
  user_email: string;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AdminAuditLogPage {
  data: AdminAuditLogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditLogFiltros {
  page?: number;
  page_size?: number;
  entidad?: string;
  accion?: string;
}

export interface MiPrestador {
  id: string;
  slug: string;
  nombre: string;
  es_owner: boolean;
}

/**
 * Obtiene el prestador principal del usuario logueado.
 * Devuelve null si no tiene prestadores.
 */
export async function getMiPrestador(): Promise<MiPrestador | null> {
  const res = await authFetch('/api/v1/mis-prestadores');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  const json = await res.json();
  const items = json.items || json;
  if (!Array.isArray(items) || items.length === 0) return null;
  const p = items[0];
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    es_owner: p.es_owner === true,
  };
}

export async function getColaboradores(
  prestadorId: string,
): Promise<AdminColaborador[]> {
  const res = await authFetch(
    `/api/v1/mis-prestadores/${prestadorId}/colaboradores`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function invitarColaborador(
  prestadorId: string,
  payload: InvitarColaboradorPayload,
): Promise<AdminColaborador> {
  const res = await authFetch(
    `/api/v1/mis-prestadores/${prestadorId}/colaboradores/invitar`,
    { method: 'POST', body: JSON.stringify(payload) },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}

export async function eliminarColaborador(
  prestadorId: string,
  email: string,
): Promise<void> {
  const res = await authFetch(
    `/api/v1/mis-prestadores/${prestadorId}/colaboradores/${encodeURIComponent(email)}`,
    { method: 'DELETE' },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
}

export async function getAuditLog(
  prestadorId: string,
  filtros: AuditLogFiltros = {},
): Promise<AdminAuditLogPage> {
  const params = new URLSearchParams();
  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value));
  });
  const res = await authFetch(
    `/api/v1/mis-prestadores/${prestadorId}/audit-log?${params.toString()}`,
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}


// =========================================================
// BLOQUEOS DE VEHÍCULOS (Calendario de Disponibilidad)
// =========================================================

export interface AdminBloqueo {
  id: string;
  vehiculo_id: string;
  reserva_id: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  tipo: 'reserva' | 'mantenimiento' | 'manual';
  motivo: string | null;
  created_at: string;
}

export async function getBloqueos(
  vehiculoId: string,
  desde?: string,
  hasta?: string,
): Promise<AdminBloqueo[]> {
  let url = `/api/v1/mis-vehiculos-rentacar/${vehiculoId}/bloqueos`;
  const params = new URLSearchParams();
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await authFetch(url);
  if (!res.ok) throw new Error('Error al cargar bloqueos');
  return res.json();
}

export async function crearBloqueo(
  vehiculoId: string,
  payload: { fecha_inicio: string; fecha_fin: string; tipo: string; motivo?: string },
): Promise<AdminBloqueo> {
  const res = await authFetch(`/api/v1/mis-vehiculos-rentacar/${vehiculoId}/bloqueos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al crear bloqueo');
  }
  return res.json();
}

export async function eliminarBloqueo(bloqueoId: string): Promise<void> {
  const res = await authFetch(`/api/v1/mis-vehiculos-rentacar/bloqueos/${bloqueoId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al eliminar bloqueo');
  }
}
