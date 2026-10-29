import type { Metadata } from "next";
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
      <body className="antialiased">{children}</body>
    </html>
  );
}