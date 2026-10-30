import type { Transparencia } from '@/lib/transparencia';
import {
  formatCancelacion,
  formatCombustible,
  formatDeposito,
  formatEdad,
  formatKilometraje,
  formatLicencia,
} from '@/lib/transparencia';

interface Props {
  transparencia: Transparencia;
}

interface Item {
  icon: string;
  label: string;
  value: string;
  hint?: string;
}

function buildItems(t: Transparencia): Item[] {
  const items: Item[] = [];

  const dep = formatDeposito(t);
  if (dep) items.push({ icon: '💰', label: 'Depósito', value: dep, hint: 'Reembolsable' });

  const km = formatKilometraje(t);
  if (km) items.push({ icon: '🛣️', label: 'Kilometraje', value: km });

  const comb = formatCombustible(t);
  if (comb) items.push({ icon: '⛽', label: 'Combustible', value: comb });

  const canc = formatCancelacion(t);
  if (canc) items.push({ icon: '📅', label: 'Cancelación', value: canc, hint: t.cancelacion_detalle ?? undefined });

  const edad = formatEdad(t);
  if (edad) items.push({ icon: '👤', label: 'Edad mínima', value: edad });

  const lic = formatLicencia(t);
  if (lic) items.push({ icon: '🪪', label: 'Licencia', value: lic });

  return items;
}

export default function TransparenciaBlock({ transparencia }: Props) {
  if (!transparencia.visible) return null;
  const items = buildItems(transparencia);
  if (items.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-bold text-green-800">
            ✓ Transparencia total
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            Sin sorpresas al momento de reservar
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
            Todas las condiciones de tu arriendo, claras desde el inicio.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </div>
                  <div className="mt-1 text-base font-bold text-slate-900">
                    {item.value}
                  </div>
                  {item.hint && (
                    <div className="mt-1 text-xs text-slate-500">{item.hint}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {transparencia.notas_extra && (
          <p className="mx-auto mt-8 max-w-3xl rounded-lg bg-slate-100 p-4 text-center text-sm text-slate-700">
            ℹ️ {transparencia.notas_extra}
          </p>
        )}
      </div>
    </section>
  );
}
