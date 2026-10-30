// WhatsApp utilities - reutilizable para cualquier vertical
// El backend expone whatsapp en /perfil-completo con templates por contexto

export type WhatsAppContext =
  | 'home'
  | 'vehiculo'
  | 'reserva'
  | 'app'
  | '_default';

export interface WhatsAppInfo {
  phone_e164: string;
  phone_digits: string;
  templates: Record<string, string>;
}

/**
 * Reemplaza {var} en el template con los valores dados.
 * Si una variable falta, deja el placeholder intacto para debug.
 */
export function interpolateTemplate(
  template: string,
  vars: Record<string, string | number | undefined> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key];
    return value !== undefined && value !== null ? String(value) : `{${key}}`;
  });
}

/**
 * Construye una URL wa.me con el mensaje codificado.
 * phoneDigits: solo digitos sin + (ej: 56941721688)
 */
export function buildWhatsAppUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}

/**
 * Obtiene el mensaje interpolado para un contexto dado.
 * Fallback: template _default o string vacio si no existe.
 */
export function getWhatsAppMessage(
  info: WhatsAppInfo,
  context: WhatsAppContext,
  vars: Record<string, string | number | undefined> = {}
): string {
  const template = info.templates[context] ?? info.templates._default ?? '';
  return interpolateTemplate(template, vars);
}

/**
 * Atajo: mensaje interpolado + URL wa.me para un contexto + vars.
 */
export function buildContextWhatsAppUrl(
  info: WhatsAppInfo,
  context: WhatsAppContext,
  vars: Record<string, string | number | undefined> = {}
): string {
  return buildWhatsAppUrl(info.phone_digits, getWhatsAppMessage(info, context, vars));
}

/**
 * Extrae WhatsAppInfo desde la respuesta de /perfil-completo.
 * Devuelve null si no hay datos validos.
 */
export function extractWhatsAppInfo(perfil: unknown): WhatsAppInfo | null {
  if (!perfil || typeof perfil !== 'object') return null;
  const wa = (perfil as Record<string, unknown>).whatsapp;
  if (!wa || typeof wa !== 'object') return null;
  const { phone_e164, phone_digits, templates } = wa as Record<string, unknown>;
  if (typeof phone_digits !== 'string' || !phone_digits) return null;
  if (!templates || typeof templates !== 'object') return null;
  return {
    phone_e164: typeof phone_e164 === 'string' ? phone_e164 : '',
    phone_digits,
    templates: templates as Record<string, string>,
  };
}
