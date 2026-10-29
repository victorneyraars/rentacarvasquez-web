// Helpers de transformación del PerfilCompleto.
//
// Toma el perfil del backend y devuelve estructuras listas para:
// - JSON-LD AutoRental (Schema.org)
// - Metadata de Next.js (title, description, og)
// - OpeningHoursSpecification
//
// Todos los helpers aceptan `perfil: PerfilCompleto | null`.
// Si es null o le falta un campo, usa fallback desde SITE.

import type { PerfilCompleto } from './types';
import { SITE, ORGANIZATION_ID } from './seo';

// =========================================================
// Helpers internos
// =========================================================

const DAYS_MAP: Record<string, string[]> = {
  lunes: ['Monday'],
  martes: ['Tuesday'],
  miercoles: ['Wednesday'],
  jueves: ['Thursday'],
  viernes: ['Friday'],
  sabado: ['Saturday'],
  domingo: ['Sunday'],
};

function toIsoDay(day: string): string[] {
  return DAYS_MAP[day.toLowerCase()] ?? [];
}

// =========================================================
// OpeningHoursSpecification (Schema.org)
// =========================================================

interface HorarioRange {
  abre: string;
  cierra: string;
}

interface OpeningHoursSpec {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

/**
 * Convierte el horario del perfil {lunes: [{abre, cierra}], ...}
 * al formato Schema.org OpeningHoursSpecification.
 *
 * Si no hay horario, retorna fallback genérico Lun-Dom 08:00-22:00.
 */
export function toOpeningHoursSpec(
  perfil: PerfilCompleto | null,
): OpeningHoursSpec[] {
  const horario = perfil?.perfil_negocio?.horario;
  if (!horario || Object.keys(horario).length === 0) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '22:00',
      },
    ];
  }

  const specs: OpeningHoursSpec[] = [];
  for (const [dia, rangos] of Object.entries(horario)) {
    const isoDays = toIsoDay(dia);
    if (isoDays.length === 0) continue;
    for (const rango of rangos as HorarioRange[]) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: isoDays,
        opens: rango.abre,
        closes: rango.cierra,
      });
    }
  }
  // Fallback: si todos los días están vacíos (el form puede enviar
  // {lunes: [], martes: [], ...}), devolvemos el default genérico.
  if (specs.length === 0) {
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '22:00',
      },
    ];
  }
  return specs;
}

// =========================================================
// sameAs (redes sociales)
// =========================================================

/**
 * Extrae URLs de redes sociales para Schema.org sameAs.
 * Prioriza perfil.perfil_negocio.redes, fallback a env vars.
 */
export function toSameAs(perfil: PerfilCompleto | null): string[] {
  const redes = perfil?.perfil_negocio?.redes;
  const urls: (string | undefined)[] = [
    redes?.instagram,
    redes?.facebook,
    redes?.tiktok,
    redes?.youtube,
    redes?.google_business,
    redes?.tripadvisor,
    SITE.instagram,
    SITE.facebook,
  ];
  return urls.filter((u): u is string => Boolean(u && u.length > 0));
}

// =========================================================
// NAP (Name, Address, Phone) consistente con GBP
// =========================================================

interface NapOutput {
  name: string;
  phone: string;
  email: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

/**
 * Extrae el NAP canónico del perfil.
 *
 * CRÍTICO: debe coincidir carácter por carácter con GBP.
 * Si el perfil tiene `nap.address_postal`, se usa directo.
 * Si no, se arma con fallback de SITE.
 */
export function toNap(perfil: PerfilCompleto | null): NapOutput {
  if (perfil?.nap) {
    return {
      name: perfil.nap.name,
      phone: perfil.nap.phone_e164,
      email: perfil.contacto.email ?? SITE.email,
      streetAddress: perfil.nap.address_postal.streetAddress,
      addressLocality: perfil.nap.address_postal.addressLocality,
      addressRegion: perfil.nap.address_postal.addressRegion,
      postalCode: perfil.nap.address_postal.postalCode,
      addressCountry: perfil.nap.address_postal.addressCountry,
    };
  }
  return {
    name: SITE.name,
    phone: SITE.telephone,
    email: SITE.email,
    streetAddress: SITE.street + " " + SITE.streetNumber,
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    postalCode: SITE.postalCode,
    addressCountry: SITE.country,
  };
}

// =========================================================
// AutoRental schema completo (Schema.org)
// =========================================================

/**
 * Genera el schema AutoRental completo desde el perfil.
 *
 * Reemplaza a buildAutoRentalSchema() de json-ld.ts.
 * Usa datos reales del endpoint + fallback a SITE.
 */
export function toAutoRentalSchema(perfil: PerfilCompleto | null) {
  const nap = toNap(perfil);
  const lat = perfil?.latitud ?? SITE.lat;
  const lng = perfil?.longitud ?? SITE.lng;
  const areaRadiusKm =
    perfil?.perfil_negocio?.area_servicio?.radio_km ??
    SITE.areaRadiusKm;
  const redes = perfil?.perfil_negocio?.redes;
  const ig = redes?.instagram ?? SITE.instagram;
  const fb = redes?.facebook ?? SITE.facebook;
  const logo =
    perfil?.perfil_negocio?.fotos?.logo_512 ?? SITE.logoUrl;
  const image =
    perfil?.perfil_negocio?.fotos?.portada ??
    SITE.url + "/og-image.png";
  const priceRange =
    perfil?.perfil_negocio?.precio_rango ?? SITE.priceRange;
  const pagos = perfil?.perfil_negocio?.pagos?.metodos ?? [];
  const monedas = perfil?.perfil_negocio?.pagos?.monedas ?? ["CLP"];

  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": ORGANIZATION_ID,
    name: nap.name,
    legalName: perfil?.razon_social ?? undefined,
    url: SITE.url,
    telephone: nap.phone,
    email: nap.email,
    priceRange,
    image,
    logo,
    address: {
      "@type": "PostalAddress",
      streetAddress: nap.streetAddress,
      addressLocality: nap.addressLocality,
      addressRegion: nap.addressRegion,
      postalCode: nap.postalCode,
      addressCountry: nap.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: lat,
      longitude: lng,
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: lat,
        longitude: lng,
      },
      geoRadius: Number(areaRadiusKm) * 1000,
    },
    openingHoursSpecification: toOpeningHoursSpec(perfil),
    sameAs: [ig, fb].filter((x): x is string => Boolean(x && x.length > 0)),
    paymentAccepted:
      pagos.length > 0 ? pagos.join(", ") : undefined,
    currenciesAccepted: monedas.join(", "),
  };
}

// =========================================================
// Metadata de Next.js (title, description, og)
// =========================================================

/**
 * Genera la metadata base desde el perfil.
 *
 * - name: nombre comercial (Rent a Car Vásquez)
 * - title: nombre + tagline
 * - description: descripción corta (≤155 chars idealmente)
 */
export function toSiteMetadata(perfil: PerfilCompleto | null) {
  const name = perfil?.nap?.name ?? SITE.name;
  const descCorta =
    perfil?.perfil_negocio?.descripciones?.corta ??
    perfil?.descripcion ??
    "Arriendo de vehículos en " + SITE.city + ". Flota renovada.";
  return {
    name,
    title: name + " | Arriendo de Vehículos en " + SITE.city,
    description: descCorta,
    city: perfil?.nap?.address_postal?.addressLocality ?? SITE.city,
    phone: perfil?.nap?.phone_display ?? SITE.telephone,
    email: perfil?.contacto?.email ?? SITE.email,
  };
}