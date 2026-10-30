import { Suspense } from "react";
import VehiculoCard from "@/components/VehiculoCard";
import { FAQ } from "@/components/FAQ";
import { getVehiculosDelPrestador, PRESTADOR } from "@/lib/api";
import { getWhatsAppInfo } from "@/lib/whatsapp-server";
import WhatsAppButton from "@/components/WhatsAppButton";
import WhatsAppFloating from "@/components/WhatsAppFloating";
import TransparenciaBlock from "@/components/TransparenciaBlock";
import { getTransparencia } from "@/lib/transparencia-server";

export const revalidate = 30;

async function FlotaSection() {
  const vehiculos = await getVehiculosDelPrestador();
  return (
    <section id="flota" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900">Nuestra Flota</h2>
        <p className="mt-3 text-lg text-slate-600">
          {vehiculos.length} vehiculos disponibles para tu proxima aventura
        </p>
      </div>
      {vehiculos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 py-20 text-center">
          <p className="text-lg text-slate-500">No hay vehiculos disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {vehiculos.map((v, i) => (
            <VehiculoCard key={v.id} vehiculo={v} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function Home() {
  const wa = await getWhatsAppInfo();
  const transparencia = await getTransparencia();
  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white backdrop-blur">
              🚗 {PRESTADOR.ciudad} · Patagonia Chilena
            </span>
            <h1 className="mb-6 text-5xl font-extrabold leading-tight text-white lg:text-6xl">
              Arrienda tu auto en {PRESTADOR.ciudad}
            </h1>
            <p className="mb-8 text-lg text-white/90 lg:text-xl">
              Flota renovada, seguro incluido y atencion personalizada. Reserva
              online en menos de 2 minutos.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#flota"
                className="rounded-xl bg-accent-500 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:bg-accent-600 hover:shadow-2xl"
              >
                Ver flota →
              </a>
              <a
                href={`tel:${PRESTADOR.telefono}`}
                className="rounded-xl bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur ring-1 ring-white/30 transition-all hover:bg-white/20"
              >
                📞 Llamar
              </a>
              <WhatsAppButton
                info={wa}
                context="home"
                vars={{ sitio: "rentacarvasquez.com" }}
                variant="primary"
                size="lg"
                label="WhatsApp"
                className="shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRANSPARENCIA — configurable por el prestador */}
      {transparencia && <TransparenciaBlock transparencia={transparencia} />}

      {/* FEATURES */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { icon: "🚗", label: "Flota renovada" },
            { icon: "💳", label: "Pago flexible" },
            { icon: "🛡️", label: "Seguro incluido" },
            { icon: "📞", label: "Atencion 24/7" },
          ].map((f) => (
            <div key={f.label} className="text-center">
              <div className="text-4xl">{f.icon}</div>
              <div className="mt-2 font-semibold text-slate-800">{f.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOGO con Suspense para no bloquear el hero */}
      <Suspense fallback={
        <section id="flota" className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-extrabold text-slate-900">Nuestra Flota</h2>
            <p className="mt-3 text-lg text-slate-600">Cargando vehiculos...</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        </section>
      }>
        <FlotaSection />
      </Suspense>

      {/* FOOTER */}
      <FAQ />

      <footer className="bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-bold text-white">{PRESTADOR.nombre}</h3>
              <p className="mt-2 text-sm">
                Arriendo de vehiculos en {PRESTADOR.ciudad}, Patagonia Chilena.
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Contacto</h4>
              <p className="text-sm">📞 {PRESTADOR.telefono}</p>
              <p className="text-sm">✉️ {PRESTADOR.email}</p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Powered by</h4>
              <p className="text-sm">Baqueano Natales</p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs">
            © {new Date().getFullYear()} {PRESTADOR.nombre}. Todos los derechos reservados.
          </div>
        </div>
      </footer>
      <WhatsAppFloating info={wa} context="home" vars={{ sitio: "rentacarvasquez.com" }} />
    </main>
  );
}
