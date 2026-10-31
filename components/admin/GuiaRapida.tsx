'use client';

import { useState } from 'react';

export default function GuiaRapida() {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-6 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-blue-900">
          📖 Guía rápida de operación
        </span>
        <span className="text-xs font-semibold text-blue-700">
          {open ? 'Cerrar ▲' : 'Abrir ▼'}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-sm text-blue-900">
          <div>
            <p className="font-semibold">Flujo de una reserva:</p>
            <ol className="mt-1 ml-5 list-decimal space-y-1">
              <li>
                Cliente reserva en la web → llega como <strong>Pendiente</strong> (amarillo)
              </li>
              <li>
                Revisás los datos → click en <strong>Aceptar</strong> o <strong>Rechazar</strong>
              </li>
              <li>
                El cliente recibe <strong>email automático</strong> con la decisión
              </li>
              <li>
                Al confirmar, el auto queda <strong>bloqueado</strong> para esas fechas
              </li>
            </ol>
          </div>

          <div>
            <p className="font-semibold">¿Qué significa cada estado?</p>
            <ul className="mt-1 ml-5 space-y-1">
              <li>
                🟡 <strong>Pendiente</strong>: espera tu aprobación
              </li>
              <li>
                🟢 <strong>Confirmada</strong>: ya aceptaste, el cliente fue notificado
              </li>
              <li>
                🔴 <strong>Cancelada</strong>: rechazaste, el auto quedó libre
              </li>
              <li>
                ⚠️ <strong>Vencida</strong>: pendiente con fecha pasada
              </li>
              <li>
                🟠 <strong>Para devolver</strong>: confirmada con fecha de fin pasada
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">Buenas prácticas:</p>
            <ul className="mt-1 ml-5 list-disc space-y-1">
              <li>
                Revisá si el cliente tiene <strong>email verificado</strong> (badge ✅)
              </li>
              <li>
                Si necesitás coordinar detalles, usá <strong>WhatsApp</strong> antes de decidir
              </li>
              <li>
                Después de confirmar, <strong>prepará el vehículo</strong> con anticipación
              </li>
              <li>
                Revisá las <strong>vencidas</strong> primero — son urgentes
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
