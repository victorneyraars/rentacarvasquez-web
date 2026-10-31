interface Props {
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'vencida' | 'para_devolver' | string;
  size?: 'sm' | 'md';
}

const ESTADOS: Record<string, { label: string; color: string; tooltip: string }> = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    tooltip: 'Espera tu aprobación. Aceptá o rechazá para notificar al cliente por email.',
  },
  confirmada: {
    label: 'Confirmada',
    color: 'bg-green-100 text-green-800',
    tooltip: 'Ya aceptaste. El cliente recibió email con instrucciones de retiro.',
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
    tooltip: 'Rechazaste esta reserva. El cliente fue notificado y el auto quedó libre.',
  },
  vencida: {
    label: 'Vencida',
    color: 'bg-red-100 text-red-800',
    tooltip: 'La fecha de inicio ya pasó y sigue pendiente. Considerá rechazarla.',
  },
  para_devolver: {
    label: 'Para devolver',
    color: 'bg-orange-100 text-orange-800',
    tooltip: 'La fecha de devolución ya pasó. Verificá si el cliente devolvió el auto.',
  },
};

export default function EstadoBadge({ estado, size = 'sm' }: Props) {
  const info = ESTADOS[estado] || {
    label: estado,
    color: 'bg-slate-100 text-slate-700',
    tooltip: estado,
  };
  const padding = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm';

  return (
    <span
      title={info.tooltip}
      aria-label={info.tooltip}
      className={`inline-block shrink-0 cursor-help rounded-full font-bold ${padding} ${info.color}`}
    >
      {info.label}
    </span>
  );
}
