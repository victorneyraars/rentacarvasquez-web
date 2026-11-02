"use client";

import type { Disponibilidad } from "@/lib/types";

interface Props {
  disponibilidad: Disponibilidad | null;
  desde?: string;
  hasta?: string;
}

export default function DisponibilidadBadge({ disponibilidad, desde, hasta }: Props) {
  if (!disponibilidad) return null;

  if (disponibilidad.disponible) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="flex items-center gap-2 font-semibold text-green-800">
          <span className="text-lg">✅</span>
          <span>Disponible para tus fechas</span>
        </p>
        {desde && hasta && (
          <p className="mt-1 text-sm text-green-700">
            Del {desde} al {hasta} — sin reservas ni bloqueos
          </p>
        )}
      </div>
    );
  }

  // No disponible: listar bloqueos
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="flex items-center gap-2 font-semibold text-amber-900">
        <span className="text-lg">⚠️</span>
        <span>No disponible para todo tu rango</span>
      </p>
      <p className="mt-1 text-sm text-amber-800">
        Ya hay {disponibilidad.bloqueos.length}{" "}
        {disponibilidad.bloqueos.length === 1 ? "reserva o bloqueo" : "reservas o bloqueos"} en esas fechas.
        Podés elegir otras fechas o consultar por WhatsApp.
      </p>
      {disponibilidad.bloqueos.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-amber-900">
          {disponibilidad.bloqueos.map((b) => {
            const tipoLabel =
              b.tipo === "reserva" ? "Reservado" : b.tipo === "mantenimiento" ? "Mantenimiento" : "Bloqueado";
            return (
              <li key={b.id} className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                <span className="font-semibold">{tipoLabel}:</span>
                <span>{b.fecha_inicio} → {b.fecha_fin}</span>
                {b.motivo && <span className="italic text-amber-700">({b.motivo})</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
