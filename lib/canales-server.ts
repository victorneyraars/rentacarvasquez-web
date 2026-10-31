// Server-only helper: consulta /perfil-completo y filtra emails visibles.
// Usado por home (footer) y /contacto.
import { getPerfilCompleto } from '@/lib/api';
import { extractEmailsVisibles, type CanalEmail } from '@/lib/canales';

export async function getEmailsVisibles(): Promise<CanalEmail[]> {
  try {
    const perfil = await getPerfilCompleto();
    return extractEmailsVisibles(perfil);
  } catch {
    return [];
  }
}
