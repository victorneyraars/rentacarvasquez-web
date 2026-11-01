'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { AdminReserva } from '@/lib/admin-api';
import EstadoBadge from './EstadoBadge';

interface Props {
  reservas: AdminReserva[];
  onAccion: (id: string, accion: 'confirmada' | 'cancelada') => void;
  procesando: string | null;
}

function VehiculoThumbnail({
  url,
  patente,
  size = 40,
}: {
  url?: string | null;
  patente?: string | null;
  size?: number;
}) {
  const px = `${size}px`;
  if (url) {
    return (
      <img
        src={url}
        alt={patente || 'Vehículo'}
        width={size}
        height={size}
        loading="lazy"
        className="shrink-0 rounded-lg border border-slate-200 bg-slate-100 object-cover"
        style={{ width: px, height: px }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400"
      style={{ width: px, height: px }}
    >
      <span style={{ fontSize: `${size * 0.5}px` }}>🚗</span>
    </div>
  );
}

function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
  });
}

function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DataTable({ reservas, onAccion, procesando }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleAll = () => {
    if (selected.size === reservas.length) setSelected(new Set());
    else setSelected(new Set(reservas.map((r) => r.id)));
  };

  const toggleOne = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  return (
    <>
      {/* Tabla Desktop */}
      <div className="hidden overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === reservas.length && reservas.length > 0}
                  onChange={toggleAll}
                  className="rounded border-slate-300"
                />
              </th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Vehículo</th>
              <th className="px-4 py-3 text-left">Fechas</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservas.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    className="rounded border-slate-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">
                    {r.nombre_cliente || 'Sin nombre'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.email_cliente}
                    {r.email_verificado && ' ✅'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <VehiculoThumbnail
                      url={r.vehiculo_imagen_url}
                      patente={r.vehiculo_patente}
                      size={40}
                    />
                    <span className="text-slate-700">
                      {r.vehiculo_label || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatFecha(r.fecha_inicio)} → {formatFecha(r.fecha_fin)}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {formatCLP(r.precio_total)}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={r.estado} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {r.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => onAccion(r.id, 'confirmada')}
                          disabled={procesando === r.id}
                          title="Confirma la reserva y envía email al cliente."
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {procesando === r.id ? '...' : 'Aceptar'}
                        </button>
                        <button
                          onClick={() => onAccion(r.id, 'cancelada')}
                          disabled={procesando === r.id}
                          title="Cancela la reserva y envía email al cliente."
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {procesando === r.id ? '...' : 'Rechazar'}
                        </button>
                      </>
                    )}
                    <Link
                      href={`/admin/dashboard/${r.id}`}
                      title="Abre el detalle completo."
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Ver
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards Mobile */}
      <div className="space-y-3 md:hidden">
        {reservas.map((r) => (
          <div
            key={r.id}
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
          >
            <div className="flex items-start gap-3">
              <VehiculoThumbnail
                url={r.vehiculo_imagen_url}
                patente={r.vehiculo_patente}
                size={80}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">
                      {r.nombre_cliente || 'Sin nombre'}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {r.email_cliente}
                      {r.email_verificado && ' ✅'}
                    </div>
                  </div>
                  <EstadoBadge estado={r.estado} />
                </div>
                <div className="mt-2 space-y-0.5 text-sm">
                  {r.vehiculo_label && (
                    <div className="font-semibold text-slate-700">
                      {r.vehiculo_label}
                    </div>
                  )}
                  <div className="text-slate-700">
                    📅 {formatFecha(r.fecha_inicio)} → {formatFecha(r.fecha_fin)}
                  </div>
                  <div className="font-semibold text-slate-900">
                    💰 {formatCLP(r.precio_total)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {r.estado === 'pendiente' && (
                <>
                  <button
                    onClick={() => onAccion(r.id, 'confirmada')}
                    disabled={procesando === r.id}
                    className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => onAccion(r.id, 'cancelada')}
                    disabled={procesando === r.id}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </>
              )}
              <Link
                href={`/admin/dashboard/${r.id}`}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
