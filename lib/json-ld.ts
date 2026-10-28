// JSON-LD schemas para SEO. Reutilizable y mantenible.
import { SITE, ORGANIZATION_ID, WEBSITE_ID } from "./seo";

export function buildAutoRentalSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": ORGANIZATION_ID,
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.telephone,
    email: SITE.email,
    priceRange: SITE.priceRange,
    image: SITE.url + "/og-image.png",
    logo: SITE.logoUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.street + " " + SITE.streetNumber,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.lat,
      longitude: SITE.lng,
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: SITE.lat,
        longitude: SITE.lng,
      },
      geoRadius: SITE.areaRadiusKm * 1000,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "22:00",
      },
    ],
    sameAs: [SITE.instagram, SITE.facebook].filter((x) => x && x.length > 0),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    inLanguage: "es-CL",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: SITE.url + "/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}


export function buildVehicleSchema(vehiculo: {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  categoria: string;
  precioDia: number;
  imagenUrl?: string | null;
  disponible: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": SITE.url + "/vehiculos/" + vehiculo.id + "#vehicle",
    name: vehiculo.marca + " " + vehiculo.modelo + " " + vehiculo.anio,
    description:
      "Arriendo de " +
      vehiculo.marca +
      " " +
      vehiculo.modelo +
      " " +
      vehiculo.anio +
      " en " +
      SITE.city +
      ". Categoria " +
      vehiculo.categoria +
      ".",
    image: vehiculo.imagenUrl || SITE.url + "/og-image.png",
    brand: { "@type": "Brand", name: vehiculo.marca },
    category: "Vehiculo de arriendo",
    offers: {
      "@type": "Offer",
      url: SITE.url + "/vehiculos/" + vehiculo.id,
      priceCurrency: "CLP",
      price: vehiculo.precioDia,
      availability: vehiculo.disponible
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": ORGANIZATION_ID },
      priceValidUntil: "2027-12-31",
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
