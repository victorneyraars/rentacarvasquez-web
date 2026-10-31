'use client';

import { useEffect, useState } from 'react';
import {
  getReservas,
  getStats,
  getVehiculos,
  cambiarEstadoReserva,
  type AdminReserva,
  type AdminStats,
  type AdminVehiculo,
  type ReservaFiltros,
} from '@/lib/admin-api';
import StatCard from '@/components/admin/StatCard';
import FilterBar from '@/components/admin/FilterBar';
import DataTable from '@/components/admin/DataTable';
import SectionHeader from '@/components/admin/SectionHeader';
import GuiaRapida from '@/components/admin/GuiaRapida';

export default function DashboardPage() {
  const [reservas, setReservas] = useState<AdminReserva[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [vehiculos, setVehiculos] = useState<AdminVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<ReservaFiltros>({});

  async function cargarDatos() {
    setLoading(true);
    setError(null);
    try {
      const [reservasData, statsData, vehiculosData] = await Promise.all([
        getReservas({ ...filtros, page: 1, page_size: 50 }),
        getStats().catch(() => null),
        getVehiculos().catch(() => []),
      ]);
      setReservas(reservasData.data);
      setStats(statsData);
      setVehiculos(vehiculosData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  async function handleAccion(id: string, estado: 'confirmada' | 'cancelada') {
    setProcesando(id);
    try {
      await cambiarEstadoReserva(id, estado);
      await cargarDatos();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div>
      <SectionHeader
        title="Reservas"
        description="Revisá y gestioná las reservas de tu flota. Las pendientes esperan tu aprobación. Al aceptar o rechazar, el cliente recibe un email automático."
        help="Cada reserva que llega desde la web aparece acá. Aceptá o rechazá para notificar al cliente."
      />

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon="🟡"
            label="Pendientes"
            value={stats.reservas_pendientes}
          />
          <StatCard
            icon="🟢"
            label="Confirmadas"
            value={stats.reservas_confirmadas}
          />
          <StatCard
            icon="💰"
            label="Ingresos Mes"
            value={`$${stats.ingresos_mes.toLocaleString('es-CL')}`}
          />
          <StatCard
            icon="📊"
            label="Ocupación"
            value={`${stats.ocupacion_pct}%`}
          />
        </div>
      )}

      <GuiaRapida />

      <FilterBar onFiltrosChange={setFiltros} vehiculos={vehiculos} />

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="text-3xl">⏳</div>
          <p className="mt-2 text-sm text-slate-600">Cargando reservas...</p>
        </div>
      ) : reservas.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <div className="text-4xl">📭</div>
          <p className="mt-3 text-sm text-slate-600">
            No hay reservas que coincidan con los filtros.
          </p>
        </div>
      ) : (
        <DataTable
          reservas={reservas}
          onAccion={handleAccion}
          procesando={procesando}
        />
      )}
    </div>
  );
}
