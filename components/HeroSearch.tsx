'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function defaultReturnISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function HeroSearch() {
  const router = useRouter();
  const today = todayISO();
  const [inicio, setInicio] = useState(today);
  const [fin, setFin] = useState(defaultReturnISO());
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!inicio || !fin) {
      setError('Selecciona fechas válidas');
      return;
    }
    if (fin <= inicio) {
      setError('La devolución debe ser después del retiro');
      return;
    }
    const params = new URLSearchParams({ inicio, fin });
    router.push(`/?${params.toString()}#flota`);
  };

  return (
    <form onSubmit={onSubmit} className="mt-10 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Retiro</span>
          <input type="date" value={inicio} min={today} onChange={(e) => setInicio(e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">Devolución</span>
          <input type="date" value={fin} min={inicio || today} onChange={(e) => setFin(e.target.value)} required className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30" />
        </label>
        <button type="submit" className="rounded-lg bg-accent-500 px-6 py-3 text-base font-bold text-white shadow-lg transition-all hover:bg-accent-600 sm:self-end">
          Buscar autos
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
