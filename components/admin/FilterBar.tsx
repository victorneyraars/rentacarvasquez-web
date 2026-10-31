'use client';

import { useState } from 'react';
import type { AdminVehiculo, ReservaFiltros } from '@/lib/admin-api';

interface Props {
  onFiltrosChange: (filtros: ReservaFiltros) => void;
  vehiculos: AdminVehiculo[];
}

export default function FilterBar({ onFiltrosChange, vehiculos }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');

  const aplicarFiltros = () => {
    onFiltrosChange({
      busqueda: busqueda.trim() || undefined,
      estado: estado === 'todas' ? undefined : estado,
      fecha_desde: fechaDesde || undefined,
      fecha_hasta: fechaHasta || undefined,
      vehiculo_id: vehiculoId || undefined,
    });
  };

  const limpiar = () => {
    setBusqueda('');
    setEstado('todas');
    setFechaDesde('');
    setFechaHasta('');
    setVehiculoId('');
    onFiltrosChange({});
  };

  return (
    <div className="mb-6 space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por nombre, email o patente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 sm:flex-1"
        />
        <div className="flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="flex-1 rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:flex-none"
          >
            Filtrar
          </button>
          <button
            onClick={limpiar}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Desde
          </label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Hasta
          </label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Vehículo
          </label>
          <select
            value={vehiculoId}
            onChange={(e) => setVehiculoId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marca} {v.modelo} ({v.patente})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
