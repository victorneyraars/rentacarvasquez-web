import Link from 'next/link';
import type { Metadata } from 'next';
import { getPerfilCompleto } from '@/lib/api';
import { getEmailsVisibles } from '@/lib/canales-server';
import { getWhatsAppInfo } from '@/lib/whatsapp-server';
import { toNap } from '@/lib/perfil-utils';
import { SITE } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import WhatsAppButton from '@/components/WhatsAppButton';

export const revalidate = 30;

export const metadata: Metadata = {
  title: 'Contacto — Arriendo de autos en Puerto Natales',
  description:
    'Contactanos por telefono, email o WhatsApp. Estamos en Miraflores 708, Puerto Natales, Patagonia Chilena.',
  alternates: { canonical: SITE.url + '/contacto' },
  openGraph: {
    type: 'website',
    title: 'Contacto | Rent a Car Vasquez',
    url: SITE.url + '/contacto',
  },
};

export default async function ContactoPage() {
  const [perfil, emails, wa] = await Promise.all([
    getPerfilCompleto(),
    getEmailsVisibles(),
    getWhatsAppInfo(),
  ]);

  const nap = toNap(perfil);
  const lat = typeof perfil?.latitud === 'number' ? perfil.latitud : null;
  const lng = typeof perfil?.longitud === 'number' ? perfil.longitud : null;
  const telefono = nap.phone || '';
  const direccion = nap.streetAddress || '';
  const ciudad = nap.addressLocality || 'Puerto Natales';

  const contactPoints = emails.map((e) => ({
    '@type': 'ContactPoint',
    email: e.direccion,
    contactType: e.tipo,
    areaServed: 'CL',
    availableLanguage: ['Spanish', 'English'],
  }));

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: nap.name || 'Rent a Car Vasquez',
    url: SITE.url,
    telephone: telefono,
    address: {
      '@type': 'PostalAddress',
      streetAddress: direccion,
      addressLocality: ciudad,
      addressRegion: nap.addressRegion || 'Magallanes',
      addressCountry: 'CL',
    },
    contactPoint: contactPoints,
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <JsonLd data={organizationJsonLd} />

      <section className="bg-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-400 hover:text-white"
          >
            ← Volver al inicio
          </Link>
          <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">
            Contacto
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-300">
            Escribinos por el canal que prefieras. Respondemos rapido.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              📍 Visitanos
            </h2>
            <p className="text-slate-700">{direccion}</p>
            <p className="text-slate-700">
              {ciudad}, {nap.addressRegion || 'Magallanes'}, Chile
            </p>
            <p className="mt-4 text-slate-700">
              📞{' '}
              <a
                href={`tel:${telefono}`}
                className="font-semibold text-blue-600 hover:underline"
              >
                {telefono}
              </a>
            </p>
            {lat && lng && (
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                Ver en Google Maps →
              </a>
            )}
          </div>

          <div className="rounded-2xl bg-green-50 p-6 ring-1 ring-green-200">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              💬 WhatsApp directo
            </h2>
            <p className="mb-4 text-slate-700">
              La forma mas rapida de consultar disponibilidad.
            </p>
            {wa && (
              <WhatsAppButton
                info={wa}
                context="home"
                vars={{ sitio: 'rentacarvasquez.com' }}
                variant="primary"
                size="lg"
                label="Abrir WhatsApp"
              />
            )}
          </div>
        </div>
      </section>

      {emails.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            📧 Escribinos por email
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {emails.map((e) => (
              <div
                key={e.tipo}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  {e.tipo}
                </h3>
                <a
                  href={`mailto:${e.direccion}`}
                  className="mt-2 block break-all font-bold text-blue-600 hover:underline"
                >
                  {e.direccion}
                </a>
                <p className="mt-2 text-sm text-slate-600">{e.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {lat && lng && (
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            🗺️ Nuestra ubicacion
          </h2>
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <iframe
              src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              width="100%"
              height="400"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicacion Rent a Car Vasquez"
              className="border-0"
            />
          </div>
        </section>
      )}
    </main>
  );
}
