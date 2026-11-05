import type { Metadata } from "next";
import Script from 'next/script';
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { buildAutoRentalSchema, buildWebSiteSchema } from "@/lib/json-ld";
import { getPerfilCompleto } from "@/lib/api";
import { toSiteMetadata } from "@/lib/perfil-utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export async function generateMetadata(): Promise<Metadata> {
  const perfil = await getPerfilCompleto();
  const meta = toSiteMetadata(perfil);
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: "Arriendo de Autos en Puerto Natales | " + meta.name,
      template: "%s | " + meta.name,
    },
    description: meta.description,
    keywords: [
      "arriendo de autos Puerto Natales",
      "rent a car Puerto Natales",
      "arriendo vehiculos Patagonia",
      "rentacar Torres del Paine",
      "arriendo 4x4 Puerto Natales",
    ],
    authors: [{ name: meta.name, url: SITE.url }],
    creator: meta.name,
    publisher: meta.name,
    alternates: { canonical: SITE.url },
    openGraph: {
      type: "website",
      locale: "es_CL",
      url: SITE.url,
      siteName: meta.name,
      title: "Arriendo de Autos en Puerto Natales | " + meta.name,
      description: meta.description,
      images: [{ url: SITE.url + "/og-image.png", width: 1200, height: 630, alt: meta.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Arriendo de Autos en Puerto Natales",
      description: meta.description,
      images: [SITE.url + "/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    category: "travel",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const perfil = await getPerfilCompleto();
  return (
    <html lang="es-CL" className={inter.variable}>
      <head>
        <JsonLd data={buildAutoRentalSchema(perfil)} />
        <JsonLd data={buildWebSiteSchema()} />
      </head>
      <body className="antialiased">
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MWL63KTV');`
          }}
        />
        {/* End Google Tag Manager */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MWL63KTV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
{children}
        <div className="mt-8 border-t border-slate-200 pt-8">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 sm:grid-cols-4">
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Destinos</h3>
              <ul className="space-y-2">
                <li><a href="/puerto-natales" className="hover:text-green-600">Arriendo en Puerto Natales</a></li>
                <li><a href="/torres-del-paine" className="hover:text-green-600">Arriendo para Torres del Paine</a></li>
                <li><a href="/aeropuerto-pnt" className="hover:text-green-600">Arriendo en Aeropuerto PNT</a></li>
              </ul>
            </div>
          </div>
        </div>
</body>
    </html>
  );
}