'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function AeropuertoPNTPage() {
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
        <div className="absolute inset-0 bg-[url('https://pub-26428d066b4c4eeab91fc8fedf8c036c.r2.dev/rentacar/vehiculos/ca922544-2532-4935-9ff0-a4e802bea619/60be13e814e944e2b9baf1c4e604c8b9.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-6 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Arriendo de Autos en el Aeropuerto de Puerto Natales (PNT)
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            Retirá tu auto apenas bajes del avión. Coordinamos la entrega en el Aeropuerto Teniente Julio Gallardo para que empieces tu viaje sin demoras.
          </p>
          <Link href="/#flota" className="inline-block rounded-xl bg-green-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-700">
            Reservar Auto para el Aeropuerto →
          </Link>
        </div>
      </section>

      {/* Info de Entrega */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">¿Cómo funciona el retiro en el aeropuerto?</h2>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-sm flex-shrink-0">1</span>
                <span><strong>Reservás online:</strong> Elegí tu vehículo y completá la reserva con fecha y número de vuelo.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-sm flex-shrink-0">2</span>
                <span><strong>Monitoreamos tu vuelo:</strong> Si el vuelo se retrasa, nosotros lo sabemos y ajustamos la entrega.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-sm flex-shrink-0">3</span>
                <span><strong>Entrega en mano:</strong> Un representante te esperará en el sector de llegadas con las llaves de tu auto.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 font-bold text-sm flex-shrink-0">4</span>
                <span><strong>Devolución flexible:</strong> Podés devolverlo en el aeropuerto o en nuestra oficina del centro (Miraflores 708).</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Ventajas de retirar en el PNT</h2>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>Sin costo adicional:</strong> La entrega en el aeropuerto está incluida en tu tarifa.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>Ahorro de tiempo:</strong> No tenés que tomar un taxi o bus hasta el centro de Natales.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span>
                <span><strong>Directo al parque:</strong> Podés salir del aeropuerto directo hacia Torres del Paine.</span>
              </li>
            </ul>
            <div className="mt-8 rounded-lg bg-blue-50 p-4 border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> El Aeropuerto Teniente Julio Gallardo (PNT) está a solo 15 minutos del centro de Puerto Natales. Si preferís retirar en nuestra oficina, también es posible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-10 text-center text-3xl font-extrabold text-slate-900">Vehículos Disponibles en el Aeropuerto</h2>
        {loading ? (
          <p className="text-center text-slate-500">Cargando vehículos...</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehiculos.map((v: any) => (
              <div key={v.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 transition hover:shadow-md">
                <div className="h-48 overflow-hidden bg-slate-100">
                  {v.imagen_url ? (
                    <img src={v.imagen_url} alt={`${v.marca} ${v.modelo} en Aeropuerto PNT`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
