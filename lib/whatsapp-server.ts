// Server-only helper: no importar desde Client Components.
// Consulta /perfil-completo y extrae WhatsAppInfo; fallback si falla.
import { getPerfilCompleto } from '@/lib/api';
import { extractWhatsAppInfo, type WhatsAppInfo } from '@/lib/whatsapp';

const FALLBACK: WhatsAppInfo = {
  phone_e164: '+56941721688',
  phone_digits: '56941721688',
  templates: {
    home: 'Hola, vengo de rentacarvasquez.com. Quiero consultar por arriendo de un vehiculo.',
    vehiculo: 'Hola, me interesa el {marca} {modelo} ({patente}). Esta disponible?',
    reserva: 'Hola, quiero consultar por mi reserva.',
    app: 'Hola, vengo desde la app Baqueano.',
    _default: 'Hola, quiero hacer una consulta.',
  },
};

export async function getWhatsAppInfo(): Promise<WhatsAppInfo> {
  try {
    const perfil = await getPerfilCompleto();
    return extractWhatsAppInfo(perfil) ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
}
