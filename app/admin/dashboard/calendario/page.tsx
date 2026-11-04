'use client';

import { useEffect, useState } from 'react';
import { getVehiculos, type AdminVehiculo } from '@/lib/admin-api';
import CalendarioDisponibilidad from '@/components/admin/CalendarioDisponibilidad';
import SectionHeader from '@/components/admin/SectionHeader';

export default function CalendarioPage() {
  const [vehiculos, setVehiculos] = useState<AdminVehiculo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehiculos()
      .then(setVehiculos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <SectionHeader
        title="Calendario de Disponibilidad"
        subtitle="Gestioná los días bloqueados por reservas, mantenimiento o bloqueos manuales."
      />
      {loading ? (
        <p className="text-slate-500">Cargando vehículos...</p>
      ) : (
        <CalendarioDisponibilidad vehiculos={vehiculos} />
      )}
    </div>
  );
}
