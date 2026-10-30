// Helper para extraer y formatear el bloque `transparencia` del perfil.
// El backend ya devuelve el objeto con defaults regionales, pero acá
// tipamos y resolvemos labels para UI.

import type { PerfilCompleto } from './types';

export interface Transparencia {
  visible: boolean;
  deposito_clp?: number | null;
  kilometraje?: string | null;
  kilometraje_km_dia?: number | null;
  combustible?: string | null;
  cancelacion?: string | null;
  cancelacion_detalle?: string | null;
  edad_minima?: number | null;
  licencia_requerida?: string | null;
  notas_extra?: string | null;
}

const KM_LABELS: Record<string, string> = {
  ilimitado: 'Ilimitado',
  limitado_dia: 'Limitado por día',
  limitado_total: 'Limitado total',
};

const COMB_LABELS: Record<string, string> = {
  lleno_lleno: 'Lleno / Lleno',
  lleno_vacio: 'Lleno / Vacío',
  cargo_por_uso: 'Cargo por uso',
};

const CANC_LABELS: Record<string, string> = {
  gratis_48h: 'Gratis hasta 48h antes',
  gratis_24h: 'Gratis hasta 24h antes',
  no_reembolsable: 'No reembolsable',
  personalizada: 'Personalizada',
};

const LIC_LABELS: Record<string, string> = {
  chilena_o_internacional: 'Chilena o internacional',
  solo_chilena: 'Solo chilena',
  solo_internacional: 'Solo internacional',
};

export function extractTransparencia(
  perfil: PerfilCompleto | null,
): Transparencia | null {
  if (!perfil) return null;
  const raw = (perfil as unknown as Record<string, unknown>).transparencia;
  if (!raw || typeof raw !== 'object') return null;
  return raw as Transparencia;
}

export function formatDeposito(t: Transparencia): string | null {
  if (t.deposito_clp === null || t.deposito_clp === undefined) return null;
  if (t.deposito_clp === 0) return 'Sin depósito';
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(t.deposito_clp);
}

export function formatKilometraje(t: Transparencia): string | null {
  if (!t.kilometraje) return null;
  const label = KM_LABELS[t.kilometraje] ?? t.kilometraje;
  if (t.kilometraje_km_dia) return `${label} (${t.kilometraje_km_dia} km/día)`;
  return label;
}

export function formatCombustible(t: Transparencia): string | null {
  if (!t.combustible) return null;
  return COMB_LABELS[t.combustible] ?? t.combustible;
}

export function formatCancelacion(t: Transparencia): string | null {
  if (!t.cancelacion) return null;
  return CANC_LABELS[t.cancelacion] ?? t.cancelacion;
}

export function formatEdad(t: Transparencia): string | null {
  if (t.edad_minima === null || t.edad_minima === undefined) return null;
  return `${t.edad_minima} años`;
}

export function formatLicencia(t: Transparencia): string | null {
  if (!t.licencia_requerida) return null;
  return LIC_LABELS[t.licencia_requerida] ?? t.licencia_requerida;
}
