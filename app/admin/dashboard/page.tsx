'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getReservas,
  cambiarEstadoReserva,
  type AdminReserva,
} from '@/lib/admin-api';

type Filtro = 'todas' | 'pendiente' | 'confirmada' | 'cancelada';

export default function DashboardPage() {
  const [reservas, setReservas] = useState<AdminReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('pendiente');
  const [procesando, setProcesando] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const estado = filtro === 'todas' ? undefined : filtro;
      const data = await getReservas(estado);
      setReservas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  async function handleAccion(id: string, estado: 'confirmada' | 'cancelada') {
    setProcesando(id);
    try {
      await cambiarEstadoReserva(id, estado);
      await cargar();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setProcesando(null);
    }
  }

  function formatFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
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

  function badgeEstado(estado: string) {
    const styles: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
      finalizada: 'bg-slate-100 text-slate-700',
    };
    return styles[estado] || 'bg-slate-100 text-slate-700';
  }

  const filtros: { key: Filtro; label: string }[] = [
    { key: 'pendiente', label: 'Pendientes' },
    { key: 'confirmada', label: 'Confirmadas' },
    { key: 'cancelada', label: 'Canceladas' },
    { key: 'todas', label: 'Todas' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">Reservas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gestión de reservas de tu flota
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === f.key
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={cargar}
          disabled={loading}
          className="ml-auto rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : '↻ Recargar'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Lista */}
      {loading && reservas.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="text-3xl">⏳</div>
          <p className="mt-2 text-sm text-slate-600">Cargando reservas...</p>
        </div>
      ) : reservas.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="text-4xl">📭</div>
          <p className="mt-3 text-sm text-slate-600">
            No hay reservas {filtro !== 'todas' ? `en estado "${filtro}"` : ''}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Cliente</th>
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
                    <div className="font-semibold text-slate-900">
                      {r.nombre_cliente || 'Sin nombre'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {r.email_cliente}
                      {r.email_verificado && ' ✅'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatFecha(r.fecha_inicio)} →{' '}
                    {formatFecha(r.fecha_fin)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {formatCLP(r.precio_total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${badgeEstado(r.estado)}`}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {r.estado === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleAccion(r.id, 'confirmada')}
                            disabled={procesando === r.id}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {procesando === r.id ? '...' : 'Aceptar'}
                          </button>
                          <button
                            onClick={() => handleAccion(r.id, 'cancelada')}
                            disabled={procesando === r.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {procesando === r.id ? '...' : 'Rechazar'}
                          </button>
                        </>
                      )}
                      <Link
                        href={`/admin/dashboard/${r.id}`}
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
      )}
    </div>
  );
}
