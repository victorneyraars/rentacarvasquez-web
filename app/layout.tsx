import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { buildAutoRentalSchema, buildWebSiteSchema } from "@/lib/json-ld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Arriendo de Autos en Puerto Natales | Rent a Car Vasquez",
    template: "%s | Rent a Car Vasquez",
  },
  description:
    "Arriendo de autos en Puerto Natales con flota renovada, seguro incluido y atencion 24/7. Reserva online las 24 horas. Retiro en aeropuerto y centro.",
  keywords: [
    "arriendo de autos Puerto Natales",
    "rent a car Puerto Natales",
    "arriendo vehiculos Patagonia",
    "rentacar Torres del Paine",
    "arriendo 4x4 Puerto Natales",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE.url,
    siteName: SITE.name,
    title: "Arriendo de Autos en Puerto Natales | Rent a Car Vasquez",
    description: "Flota renovada, seguro incluido, atencion personalizada en Puerto Natales.",
    images: [{ url: SITE.url + "/og-image.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arriendo de Autos en Puerto Natales",
    description: "Flota renovada, seguro incluido, atencion personalizada.",
    images: [SITE.url + "/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "travel",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <head>
        <JsonLd data={buildAutoRentalSchema()} />
        <JsonLd data={buildWebSiteSchema()} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
