import Link from 'next/link';
import VehiculoCard from '@/components/VehiculoCard';
import HeroSearch from '@/components/HeroSearch';
import { getVehiculosDelPrestador } from '@/lib/api';

export const revalidate = 30;

interface VehiculosPageProps {
  searchParams: Promise<{ inicio?: string; fin?: string }>;
}

export default async function VehiculosPage({ searchParams }: VehiculosPageProps) {
  const sp = await searchParams;
  const inicio = typeof sp.inicio === 'string' ? sp.inicio : undefined;
  const fin = typeof sp.fin === 'string' ? sp.fin : undefined;
  const vehiculos = await getVehiculosDelPrestador();
  const conFechas = Boolean(inicio && fin);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            {conFechas ? 'Autos disponibles' : 'Nuestra flota'}
          </h1>
          {conFechas ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-lg text-slate-300">
                Del <strong className="text-white">{inicio}</strong> al <strong className="text-white">{fin}</strong>
              </p>
              <Link href="/vehiculos" className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/20">
                Cambiar fechas
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-lg text-slate-300">Elegí tus fechas y te mostramos disponibilidad</p>
          )}
          <div className="mt-6 max-w-3xl">
            <HeroSearch />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">
        {vehiculos.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 py-20 text-center">
            <p className="text-lg text-slate-500">No hay vehículos disponibles en este momento.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {vehiculos.map((v, i) => (
              <VehiculoCard key={v.id} vehiculo={v} index={i} inicio={inicio} fin={fin} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
