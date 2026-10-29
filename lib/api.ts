// Cliente API con ISR (Incremental Static Regeneration).
// Revalida cada 30s, coincidiendo con el Cache-Control del backend.

import type { Vehiculo } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-dev.baqueanonatales.com';
const PRESTADOR_ID = process.env.NEXT_PUBLIC_PRESTADOR_ID ?? '';

export const REVALIDATE_SECONDS = 30;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

export async function getVehiculos(): Promise<Vehiculo[]> {
  return fetchJson<Vehiculo[]>('/api/v1/public/rentacar/vehiculos');
}

export async function getVehiculosDelPrestador(): Promise<Vehiculo[]> {
  if (!PRESTADOR_ID) return [];
  return fetchJson<Vehiculo[]>(
    `/api/v1/public/rentacar/prestadores/${PRESTADOR_ID}/vehiculos`,
  );
}

export async function getVehiculo(id: string): Promise<Vehiculo | null> {
  try {
    return await fetchJson<Vehiculo>(`/api/v1/public/rentacar/vehiculos/${id}`);
  } catch {
    return null;
  }
}

export const PRESTADOR = {
  id: PRESTADOR_ID,
  slug: process.env.NEXT_PUBLIC_PRESTADOR_SLUG ?? 'rentacar-vasquez',
  nombre: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Rent a Car Vasquez',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentacarvasquez.com',
  telefono: process.env.NEXT_PUBLIC_SITE_PHONE ?? '',
  email: process.env.NEXT_PUBLIC_SITE_EMAIL ?? '',
  ciudad: process.env.NEXT_PUBLIC_SITE_CITY ?? 'Puerto Natales',
};

export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value);
}

import type { ReservaCreate, ReservaResponse } from './types';

export async function createReserva(
  data: ReservaCreate,
): Promise<ReservaResponse> {
  const res = await fetch(`${API_URL}/api/v1/public/rentacar/reservas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json() as Promise<ReservaResponse>;
}

// =========================================================
// Perfil completo (fuente única de verdad para NAP/JSON-LD)
// =========================================================
import type { PerfilCompleto } from './types';

/**
 * Obtiene el perfil completo del prestador desde el backend.
 *
 * Es la fuente única de verdad para:
 * - NAP (Name, Address, Phone) consistente con GBP
 * - JSON-LD AutoRental completo
 * - Metadata de Open Graph
 * - Manifest PWA
 *
 * Si el endpoint falla (500, timeout, red), retorna null.
 * Los consumidores deben usar fallback a `SITE` o `PRESTADOR`.
 */
export async function getPerfilCompleto(): Promise<PerfilCompleto | null> {
  const slug = PRESTADOR.slug;
  if (!slug) return null;
  try {
    return await fetchJson<PerfilCompleto>(
      `/api/v1/prestadores/${slug}/perfil-completo`,
    );
  } catch (e) {
    console.error('[getPerfilCompleto] fallo, usando fallback:', e);
    return null;
  }
}
