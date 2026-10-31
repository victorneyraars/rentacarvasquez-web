'use client';

import { useState } from 'react';

interface Props {
  estado: string;
}

const PASOS: Record<string, { titulo: string; icono: string; color: string; pasos: string[] }> = {
  pendiente: {
    titulo: '¿Qué hacer con esta reserva pendiente?',
    icono: '🟡',
    color: 'bg-yellow-50 ring-yellow-200 text-yellow-900',
    pasos: [
      'Verificá que el cliente tenga email verificado ✅ (si no, contactalo por WhatsApp)',
      'Revisá si el auto está disponible esas fechas (no tenga otra reserva confirmada)',
      'Contactá al cliente para confirmar detalles (pago, hora de retiro, documentación)',
      'Click en "Aceptar reserva" → el cliente recibe email automático con instrucciones',
    ],
  },
  confirmada: {
    titulo: 'Esta reserva está confirmada. Próximos pasos:',
    icono: '🟢',
    color: 'bg-green-50 ring-green-200 text-green-900',
    pasos: [
      'Coordiná el retiro con el cliente (fecha + hora exacta)',
      'Prepará el vehículo: limpieza, tanque lleno, documentación en orden',
      'El día del retiro: entregar llaves + contrato + verificar licencia del cliente',
      'Al devolver: revisar estado del auto, recibir llaves, cargar combustible si aplica',
    ],
  },
  cancelada: {
    titulo: 'Esta reserva fue rechazada',
    icono: '🔴',
    color: 'bg-red-50 ring-red-200 text-red-900',
    pasos: [
      'El cliente ya recibió un email automático notificando la cancelación',
      'El vehículo quedó liberado para esas fechas (podés recibir otras reservas)',
      'No requiere acción adicional',
    ],
  },
};

export default function GuiaContextual({ estado }: Props) {
  const [open, setOpen] = useState(true);
  const info = PASOS[estado] || {
    titulo: 'Estado desconocido',
    icono: '❓',
    color: 'bg-slate-50 ring-slate-200 text-slate-900',
    pasos: ['Consultá con el soporte técnico si necesitás ayuda'],
  };

  return (
    <div className={`mb-6 rounded-xl p-4 ring-1 ${info.color}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-sm font-bold">
          {info.icono} {info.titulo}
        </span>
        <span className="text-xs font-semibold opacity-70">
          {open ? 'Cerrar ▲' : 'Abrir ▼'}
        </span>
      </button>

      {open && (
        <ol className="mt-3 ml-5 list-decimal space-y-1.5 text-sm">
          {info.pasos.map((paso, i) => (
            <li key={i}>{paso}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
