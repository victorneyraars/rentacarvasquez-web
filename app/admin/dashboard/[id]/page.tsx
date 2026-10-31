'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getReserva,
  cambiarEstadoReserva,
  type AdminReserva,
} from '@/lib/admin-api';

export default function ReservaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const reservaId = params.id as string;

  const [reserva, setReserva] = useState<AdminReserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionando, setAccionando] = useState(false);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await getReserva(reservaId);
      setReserva(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar reserva');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservaId]);

  async function handleAccion(estado: 'confirmada' | 'cancelada') {
    if (!reserva) return;
    const ok = confirm(
      estado === 'confirmada'
        ? '¿Confirmar esta reserva? Se notificará al cliente.'
        : '¿Rechazar esta reserva? Se notificará al cliente.',
    );
    if (!ok) return;
    setAccionando(true);
    try {
      const updated = await cambiarEstadoReserva(reserva.id, estado);
      setReserva(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setAccionando(false);
    }
  }

  function formatFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatCLP(n: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(n);
  }

  function diasReserva(): number {
    if (!reserva) return 0;
    const d1 = new Date(reserva.fecha_inicio).getTime();
    const d2 = new Date(reserva.fecha_fin).getTime();
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="text-3xl">⏳</div>
        <p className="mt-2 text-sm text-slate-600">Cargando reserva...</p>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div>
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-block text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          ← Volver a reservas
        </Link>
        <div className="rounded-xl bg-red-50 p-6 text-sm text-red-700">
          {error || 'Reserva no encontrada'}
        </div>
      </div>
    );
  }

  const wa = reserva.telefono_cliente?.replace(/\D/g, '') || '';
  const waUrl = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        `Hola ${reserva.nombre_cliente || ''}, te escribimos de Rent a Car Vasquez sobre tu reserva del ${formatFecha(reserva.fecha_inicio)}.`,
      )}`
    : null;

  return (
    <div>
      <Link
        href="/admin/dashboard"
        className="mb-4 inline-block text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        ← Volver a reservas
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Reserva #{reserva.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {reserva.nombre_cliente || 'Cliente'}
          </p>
        </div>
        <span
          className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${
            reserva.estado === 'pendiente'
              ? 'bg-yellow-100 text-yellow-800'
              : reserva.estado === 'confirmada'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {reserva.estado.toUpperCase()}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cliente */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold text-slate-900">👤 Cliente</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nombre
              </dt>
              <dd className="mt-0.5 text-slate-900">
                {reserva.nombre_cliente || 'Sin nombre'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email
              </dt>
              <dd className="mt-0.5">
                {reserva.email_cliente ? (
                  <a
                    href={`mailto:${reserva.email_cliente}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {reserva.email_cliente}
                  </a>
                ) : (
                  <span className="text-slate-500">No proporcionado</span>
                )}
                {reserva.email_verificado && (
                  <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                    ✅ Verificado
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Teléfono
              </dt>
              <dd className="mt-0.5">
                {reserva.telefono_cliente ? (
                  <span className="text-slate-900">
                    {reserva.telefono_cliente}
                  </span>
                ) : (
                  <span className="text-slate-500">No proporcionado</span>
                )}
              </dd>
            </div>
          </dl>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              💬 Contactar por WhatsApp
            </a>
          )}
        </div>

        {/* Reserva */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            📅 Detalle de reserva
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Retiro
              </dt>
              <dd className="mt-0.5 text-slate-900">
                {formatFecha(reserva.fecha_inicio)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Devolución
              </dt>
              <dd className="mt-0.5 text-slate-900">
                {formatFecha(reserva.fecha_fin)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Duración
              </dt>
              <dd className="mt-0.5 text-slate-900">
                {diasReserva()} {diasReserva() === 1 ? 'día' : 'días'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Método de pago
              </dt>
              <dd className="mt-0.5 capitalize text-slate-900">
                {reserva.metodo_pago}
              </dd>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total (IVA incluido)
              </dt>
              <dd className="mt-1 text-2xl font-extrabold text-slate-900">
                {formatCLP(reserva.precio_total)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Acciones */}
      {reserva.estado === 'pendiente' && (
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            ⚡ Acciones
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            Al confirmar o rechazar, se notificará automáticamente al cliente
            por email.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAccion('confirmada')}
              disabled={accionando}
              className="rounded-xl bg-green-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {accionando ? 'Procesando...' : '✅ Aceptar reserva'}
            </button>
            <button
              onClick={() => handleAccion('cancelada')}
              disabled={accionando}
              className="rounded-xl bg-red-600 px-8 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {accionando ? 'Procesando...' : '❌ Rechazar reserva'}
            </button>
          </div>
        </div>
      )}

      {reserva.estado !== 'pendiente' && (
        <div className="mt-6 rounded-xl bg-slate-100 p-6 text-center text-sm text-slate-600">
          Esta reserva ya fue <strong>{reserva.estado}</strong>. No se puede
          cambiar el estado.
        </div>
      )}
    </div>
  );
}
