import Link from "next/link";
import Image from "next/image";
import type { Vehiculo } from "@/lib/types";
import { formatCLP } from "@/lib/api";

interface Props {
  vehiculo: Vehiculo;
  index?: number;
}

// Imagen de placeholder por categoría (hasta que Vásquez suba fotos reales)
const CATEGORIA_IMAGEN: Record<string, string> = {
  SUV: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
  SEDAN: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
  PICKUP: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
  FURGONETA: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
};

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

export default function VehiculoCard({ vehiculo, index = 0 }: Props) {
  const img =
    vehiculo.imagen_url ||
    CATEGORIA_IMAGEN[vehiculo.categoria] ||
    DEFAULT_IMG;

  return (
    <Link
      href={`/vehiculos/${vehiculo.id}`}
      className="group card-hover block overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/50"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <Image
          src={img}
          alt={`${vehiculo.marca} ${vehiculo.modelo}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          priority={index === 0}
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          {vehiculo.categoria}
        </span>
        {vehiculo.disponible && (
          <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold text-white shadow-lg">
            Disponible
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600">
          {vehiculo.marca} {vehiculo.modelo}
        </h3>
        <p className="text-sm text-slate-500">
          {vehiculo.anio} · Patente {vehiculo.patente}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCLP(vehiculo.precio_dia)}
            </span>
            <span className="text-sm text-slate-500"> / día</span>
          </div>
          <span className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-accent-600">
            Reservar →
          </span>
        </div>
      </div>
    </Link>
  );
}
