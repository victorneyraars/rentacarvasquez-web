// Server-only helper: consulta /perfil-completo y devuelve Transparencia.
// - Si el backend falla -> FALLBACK (defaults regionales, sitio sigue funcionando)
// - Si el prestador no configuro nada -> FALLBACK
// - Si marco visible:false -> null (ocultar bloque)
import { getPerfilCompleto } from '@/lib/api';
import { extractTransparencia, type Transparencia } from '@/lib/transparencia';

const FALLBACK: Transparencia = {
  visible: true,
  deposito_clp: 100000,
  kilometraje: 'ilimitado',
  combustible: 'lleno_lleno',
  cancelacion: 'gratis_48h',
  edad_minima: 21,
  licencia_requerida: 'chilena_o_internacional',
};

export async function getTransparencia(): Promise<Transparencia | null> {
  try {
    const perfil = await getPerfilCompleto();
    const t = extractTransparencia(perfil);
    if (t === null) return FALLBACK;
    if (t.visible === false) return null;
    return t;
  } catch {
    return FALLBACK;
  }
}
