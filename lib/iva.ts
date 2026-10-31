/**
 * Desglose de IVA para precios finales.
 *
 * REGLA DEL PROYECTO: el `precio_dia` que carga Vásquez en la app YA INCLUYE IVA.
 * Este helper lo desglosa para mostrar transparencia al cliente (Ley 19.496).
 */
export const IVA_RATE = 0.19;

export interface IvaBreakdown {
  neto: number;
  iva: number;
  total: number;
}

/**
 * Desglosa un monto final (que YA incluye IVA) en Neto + IVA + Total.
 * Redondea al peso para evitar decimales raros.
 */
export function desglosarIva(totalConIva: number): IvaBreakdown {
  const total = Math.round(totalConIva);
  const neto = Math.round(total / (1 + IVA_RATE));
  const iva = total - neto;
  return { neto, iva, total };
}
