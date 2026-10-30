"use client";

import { useState } from "react";
import type { Vehiculo } from "@/lib/types";
import { formatCLP, createReserva } from "@/lib/api";

interface Props {
  vehiculo: Vehiculo;
  inicioInicial?: string;
  finInicial?: string;
}

export default function ReservaForm({ vehiculo, inicioInicial, finInicial }: Props) {
  const [fechaInicio, setFechaInicio] = useState(inicioInicial ?? "");
  const [fechaFin, setFechaFin] = useState(finInicial ?? "");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dias = calcularDias(fechaInicio, fechaFin);
  const precioTotal = dias * vehiculo.precio_dia;

  function calcularDias(inicio: string, fin: string): number {
    if (!inicio || !fin) return 0;
    const d1 = new Date(inicio).getTime();
    const d2 = new Date(fin).getTime();
    if (d2 <= d1) return 0;
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (dias <= 0) {
      setError("Selecciona fechas válidas");
      return;
    }
    setLoading(true);
    try {
      const reserva = await createReserva({
        vehiculo_id: vehiculo.id,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        nombre_cliente: nombre,
        email_cliente: email,
        telefono_cliente: telefono,
        metodo_pago: metodoPago,
        precio_total: precioTotal,
      });
      setSuccess(`¡Reserva creada! Código: ${reserva.id.slice(0, 8)}`);
      setNombre("");
      setEmail("");
      setTelefono("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reservar");
    } finally {
      setLoading(false);
    }
  }

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200/50">
      <div className="mb-6">
        <div className="text-sm text-slate-500">Precio por día</div>
        <div className="text-3xl font-extrabold text-slate-900">
          {formatCLP(vehiculo.precio_dia)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            min={hoy}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Fecha de fin
          </label>
          <input
            type="date"
            value={fechaFin}
            min={fechaInicio || hoy}
            onChange={(e) => setFechaFin(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        {dias > 0 && (
          <div className="rounded-lg bg-brand-50 p-4">
            <div className="flex justify-between text-sm text-slate-600">
              <span>
                {dias} {dias === 1 ? "día" : "días"} ×{" "}
                {formatCLP(vehiculo.precio_dia)}
              </span>
              <span className="font-bold text-slate-900">
                {formatCLP(precioTotal)}
              </span>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Nombre completo
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Teléfono
          </label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="+56 9 1234 5678"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Método de pago
          </label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            <option value="transferencia">Transferencia bancaria</option>
            <option value="efectivo">Efectivo al retirar</option>
            <option value="mercadopago">MercadoPago</option>
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            ✅ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || dias <= 0}
          className="w-full rounded-xl bg-accent-500 py-3 text-base font-bold text-white shadow-lg transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {loading ? "Reservando..." : `Reservar por ${formatCLP(precioTotal)}`}
        </button>

        <p className="text-center text-xs text-slate-500">
          Pago presencial o transferencia. Te contactaremos para confirmar.
        </p>
      </form>
    </div>
  );
}
