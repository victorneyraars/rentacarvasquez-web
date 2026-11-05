'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function TorresDelPainePage() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/public/rentacar/vehiculos?prestador_id=c9aa7037-a4de-4217-b6dc-fa5893062657`)
      .then(res => res.json())
      .then(data => {
        setVehiculos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-24 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://pub-26428d066b4c4eeab91fc8fedf8c036c.r2.dev/rentacar/vehiculos/061fdf82-304b-4f65-b266-3ba3116646dd/515196d320e7417faeb3efc716866829.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Arriendo de Autos para Torres del Paine
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            Llegá al fin del mundo sin límites. Vehículos 4x4 y SUV preparados para los caminos de la Patagonia. Kilometraje ilimitado incluido.
          </p>
          <Link href="/#flota" className="inline-block rounded-xl bg-green-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-700">
            Ver Vehículos para el Parque →
          </Link>
        </div>
      </section>

      {/* Info del Parque */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Tu aventura comienza en Natales</h2>
            <p className="mb-4 text-slate-600">
              Torres del Paine está a solo 2 horas de Puerto Natales. Nuestra flota incluye vehículos altos y 4x4 ideales para el ripio y el viento patagónico.
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>Kilometraje libre:</strong> Recorré todo el parque sin costos ocultos.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>Seguro premium:</strong> Cobertura total contra todo riesgo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>Entrega temprana:</strong> Salí rumbo al parque desde las 07:00 AM.</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Distancias dentro del Parque</h2>
            <ul className="space-y-4 text-slate-600">
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span>Portería Sarmiento</span>
                <span className="font-semibold text-slate-900">2h 15m desde Natales</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span>Portería Laguna Amarga</span>
                <span className="font-semibold text-slate-900">2h 30m desde Natales</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-2">
                <span>Lago Grey</span>
                <span className="font-semibold text-slate-900">3h desde Natales</span>
              </li>
              <li className="flex justify-between pb-2">
                <span>Administración CONAF</span>
                <span className="font-semibold text-slate-900">2h desde Natales</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-slate-900">Nuestra Flota para la Patagonia</h2>
        {loading ? (
          <p className="text-center text-slate-500">Cargando vehículos...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehiculos.map((v: any) => (
              <div key={v.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition hover:shadow-md">
                <div className="h-48 overflow-hidden bg-slate-100">
                  {v.imagen_url ? (
                    <img src={v.imagen_url} alt={`${v.marca} ${v.modelo} para Torres del Paine`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">Sin imagen</div>
                  )}
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-green-600">{v.categoria}</span>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{v.marca} {v.modelo}</h3>
                  <p className="mt-1 text-sm text-slate-500">{v.anio}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-slate-900">${v.precio_dia.toLocaleString('es-CL')}</span>
                      <span className="text-sm text-slate-500">/día</span>
                    </div>
                    <Link href={`/vehiculos/${v.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                      Reservar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
