import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Rent a Car Vasquez";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rentacarvasquez.com";
const SITE_CITY = process.env.NEXT_PUBLIC_SITE_CITY ?? "Puerto Natales";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Arriendo de Vehiculos en ${SITE_CITY}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Arrienda tu auto en ${SITE_CITY}. Flota renovada, seguro incluido, atencion personalizada. Reserva online las 24 horas.`,
  keywords: [
    "arriendo de autos",
    "rent a car",
    "Puerto Natales",
    "Patagonia",
    "arriendo vehiculos Chile",
    "rentacar",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Arriendo de Vehiculos en ${SITE_CITY}`,
    description: `Flota renovada, seguro incluido, atencion personalizada en ${SITE_CITY}.`,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
