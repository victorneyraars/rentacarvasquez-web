import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVehiculo, PRESTADOR, formatCLP } from "@/lib/api";
import { SITE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { buildVehicleSchema, buildBreadcrumbSchema } from "@/lib/json-ld";
import ReservaForm from "@/components/ReservaForm";
import { getWhatsAppInfo } from "@/lib/whatsapp-server";
import WhatsAppButton from "@/components/WhatsAppButton";

export const revalidate = 30;

const CATEGORIA_IMAGEN: Record<string, string> = {
  SUV: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80",
  SEDAN: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80",
  PICKUP: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80",
  FURGONETA: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80",
};
const DEFAULT_IMG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vehiculo = await getVehiculo(id);
  if (!vehiculo) {
    return { title: "Vehiculo no encontrado" };
  }
  const img = vehiculo.imagen_url || CATEGORIA_IMAGEN[vehiculo.categoria] || DEFAULT_IMG;
  return {
    title: "Arrendar " + vehiculo.marca + " " + vehiculo.modelo + " " + vehiculo.anio + " en Puerto Natales",
    description: "Arriendo de " + vehiculo.marca + " " + vehiculo.modelo + " " + vehiculo.anio + " (" + vehiculo.categoria + ") en Puerto Natales. Precio " + formatCLP(vehiculo.precio_dia) + " por dia.",
    alternates: { canonical: SITE.url + "/vehiculos/" + vehiculo.id },
    openGraph: {
      type: "website",
      title: vehiculo.marca + " " + vehiculo.modelo + " " + vehiculo.anio + " | Rent a Car Vasquez",
      description: "Arriendo " + vehiculo.categoria + " en Puerto Natales desde " + formatCLP(vehiculo.precio_dia) + "/dia.",
      images: [{ url: img, width: 1200, height: 630, alt: vehiculo.marca + " " + vehiculo.modelo }],
    },
  };
}

export default async function VehiculoDetalle({ params }: PageProps) {
  const { id } = await params;
  const vehiculo = await getVehiculo(id);
  if (!vehiculo) notFound();
  const wa = await getWhatsAppInfo();

  const img =
    vehiculo.imagen_url ||
    CATEGORIA_IMAGEN[vehiculo.categoria] ||
    DEFAULT_IMG;

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={buildVehicleSchema({
        id: vehiculo.id,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        categoria: vehiculo.categoria,
        precioDia: vehiculo.precio_dia,
        imagenUrl: vehiculo.imagen_url,
        disponible: vehiculo.disponible,
      })} />
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Inicio", url: SITE.url },
        { name: vehiculo.marca + " " + vehiculo.modelo, url: SITE.url + "/vehiculos/" + vehiculo.id },
      ])} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-brand-600"
        >
          ← Volver a la flota
        </Link>
      </div>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 md:grid-cols-5 lg:px-8">
        <div className="md:col-span-3">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative aspect-[16/10] bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                {vehiculo.categoria}
              </span>
              {vehiculo.disponible && (
                <span className="absolute right-4 top-4 rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                  Disponible
                </span>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {vehiculo.marca} {vehiculo.modelo}
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              {vehiculo.anio} · Patente {vehiculo.patente}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl">📅</div>
                <div className="mt-1 text-xs text-slate-500">Año</div>
                <div className="font-bold text-slate-900">{vehiculo.anio}</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl">🚗</div>
                <div className="mt-1 text-xs text-slate-500">Categoría</div>
                <div className="font-bold text-slate-900">{vehiculo.categoria}</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl">🛡️</div>
                <div className="mt-1 text-xs text-slate-500">Seguro</div>
                <div className="font-bold text-slate-900">Incluido</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl">📞</div>
                <div className="mt-1 text-xs text-slate-500">Soporte</div>
                <div className="font-bold text-slate-900">24/7</div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="md:sticky md:top-6">
            <ReservaForm vehiculo={vehiculo} />
              <div className="mt-4 rounded-2xl bg-white p-4 text-center shadow-sm">
                <p className="mb-3 text-sm text-slate-600">Preferis coordinar por WhatsApp?</p>
                <WhatsAppButton info={wa} context="vehiculo" vars={{ marca: vehiculo.marca, modelo: vehiculo.modelo, patente: vehiculo.patente, sitio: "rentacarvasquez.com" }} variant="primary" size="md" label="Consultar por WhatsApp" className="w-full" />
              </div>
          </div>
        </div>
      </section>
    </main>
  );
}
