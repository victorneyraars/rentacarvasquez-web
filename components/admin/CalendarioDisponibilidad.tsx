'use client';

import { useEffect, useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, addDays, parseISO, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/style.css';
import {
  getBloqueos,
  crearBloqueo,
  eliminarBloqueo,
  type AdminBloqueo,
  type AdminVehiculo,
} from '@/lib/admin-api';

interface Props {
  vehiculos: AdminVehiculo[];
}

export default function CalendarioDisponibilidad({ vehiculos }: Props) {
  const [selectedVehiculo, setSelectedVehiculo] = useState<string>('');
  const [bloqueos, setBloqueos] = useState<AdminBloqueo[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);

  // 1. Cargar bloqueos al seleccionar vehículo
  useEffect(() => {
    if (!selectedVehiculo) return;
    setLoading(true);
    setError(null);
    getBloqueos(selectedVehiculo)
      .then(setBloqueos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedVehiculo]);

  // 2. Agrupar bloqueos por tipo para los "modifiers" del calendario
  const modifierReservas = bloqueos.filter((b) => b.tipo === 'reserva').flatMap((b) => {
    const start = parseISO(b.fecha_inicio);
    const end = addDays(parseISO(b.fecha_fin), -1); // El fin en backend es exclusivo
    const dates = [];
    for (let d = start; d <= end; d = addDays(d, 1)) dates.push(new Date(d));
    return dates;
  });

  const modifierMantenimiento = bloqueos.filter((b) => b.tipo === 'mantenimiento').flatMap((b) => {
    const start = parseISO(b.fecha_inicio);
    const end = addDays(parseISO(b.fecha_fin), -1);
    const dates = [];
    for (let d = start; d <= end; d = addDays(d, 1)) dates.push(new Date(d));
    return dates;
  });

  const modifierManual = bloqueos.filter((b) => b.tipo === 'manual').flatMap((b) => {
    const start = parseISO(b.fecha_inicio);
    const end = addDays(parseISO(b.fecha_fin), -1);
    const dates = [];
    for (let d = start; d <= end; d = addDays(d, 1)) dates.push(new Date(d));
    return dates;
  });

  // 3. Crear bloqueo manual
  async function handleCrearBloqueo(tipo: 'manual' | 'mantenimiento') {
    if (!range?.from || !range?.to || !selectedVehiculo) return;
    setCreando(true);
    setError(null);
    try {
      await crearBloqueo(selectedVehiculo, {
        fecha_inicio: format(range.from, 'yyyy-MM-dd'),
        fecha_fin: format(addDays(range.to, 1), 'yyyy-MM-dd'),
        tipo,
      });
      setRange(undefined);
      // Recargar
      const nuevos = await getBloqueos(selectedVehiculo);
      setBloqueos(nuevos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreando(false);
    }
  }

  // 4. Eliminar bloqueo (click en un día con bloqueo manual/mantenimiento)
  async function handleDiaClick(day: Date) {
    const bloqueo = bloqueos.find((b) => {
      const start = parseISO(b.fecha_inicio);
      const end = addDays(parseISO(b.fecha_fin), -1);
      return isWithinInterval(day, { start, end });
    });

    if (bloqueo && bloqueo.tipo !== 'reserva') {
      if (window.confirm(`¿Eliminar bloqueo de ${bloqueo.tipo}?`)) {
        try {
          await eliminarBloqueo(bloqueo.id);
          setBloqueos((prev) => prev.filter((b) => b.id !== bloqueo.id));
        } catch (e: any) {
          setError(e.message);
        }
      }
    }
  }

  const modificadores = {
    reserva: modifierReservas,
    mantenimiento: modifierMantenimiento,
    manual: modifierManual,
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl bg-white p-4 shadow sm:p-6">
      {/* Selector de Vehículo */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Seleccioná un vehículo
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-brand-600 focus:outline-none"
          value={selectedVehiculo}
          onChange={(e) => setSelectedVehiculo(e.target.value)}
        >
          <option value="">-- Seleccionar --</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.marca} {v.modelo} ({v.patente})
            </option>
          ))}
        </select>
      </div>

      {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {selectedVehiculo && (
        <>
          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-orange-500"></div> Reserva</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-slate-400"></div> Mantenimiento</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-blue-500"></div> Manual</div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-teal-500"></div> Selección</div>
          </div>

          {/* Calendario */}
          <div className="flex justify-center rounded-lg border border-slate-200 p-4">
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              locale={es}
              modifiers={modificadores}
              modifiersClassNames={{
                reserva: 'bg-orange-100 text-orange-900 font-bold',
                mantenimiento: 'bg-slate-200 text-slate-700 font-bold',
                manual: 'bg-blue-100 text-blue-900 font-bold',
              }}
              onDayClick={(day) => {
                // Si hace click en un día con bloqueo, intentar eliminar.
                // Si no, es para seleccionar rango.
                handleDiaClick(day);
              }}
              className="m-0"
            />
          </div>

          {/* Panel inferior dinámico */}
          {range?.from && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-3 text-sm text-slate-700">
                Rango seleccionado: <strong>{format(range.from, 'dd/MM/yyyy')}</strong> al{' '}
                <strong>{range.to ? format(range.to, 'dd/MM/yyyy') : '...'}</strong>
              </p>
              {range.to && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCrearBloqueo('manual')}
                    disabled={creando}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creando ? 'Guardando...' : 'Bloquear (Manual)'}
                  </button>
                  <button
                    onClick={() => handleCrearBloqueo('mantenimiento')}
                    disabled={creando}
                    className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {creando ? 'Guardando...' : 'Bloquear (Mantenimiento)'}
                  </button>
                  <button
                    onClick={() => setRange(undefined)}
                    className="ml-auto text-sm font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
          {loading && <p className="text-center text-sm text-slate-500">Cargando disponibilidad...</p>}
        </>
      )}
    </div>
  );
}
