// Helper para extraer los canales de contacto visibles del perfil.
// El backend expone `canales_contacto` con los 8 emails + descripcion,
// pero solo los `visible_publico && activo` deben mostrarse en la web.

import type { PerfilCompleto } from './types';

export interface CanalEmail {
  tipo: string;
  direccion: string;
  descripcion: string;
  visible_publico: boolean;
  activo: boolean;
  override_destino: string | null;
  orden: number;
}

export function extractEmailsVisibles(
  perfil: PerfilCompleto | null,
): CanalEmail[] {
  if (!perfil) return [];
  const raw = (perfil as unknown as Record<string, unknown>).canales_contacto;
  if (!raw || typeof raw !== 'object') return [];
  const emails = ((raw as Record<string, unknown>).email as unknown[]) ?? [];
  return (emails as CanalEmail[])
    .filter((c) => c && c.visible_publico && c.activo)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
}
