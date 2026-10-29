// JSON-LD schemas para SEO. Reutilizable y mantenible.
import { SITE, ORGANIZATION_ID, WEBSITE_ID } from "./seo";
import type { PerfilCompleto } from "./types";
import { toAutoRentalSchema } from "./perfil-utils";

export function buildAutoRentalSchema(
  perfil?: PerfilCompleto | null,
) {
  // Delega al helper que usa datos reales del endpoint /perfil-completo
  // con fallback a SITE si el perfil es null.
  return toAutoRentalSchema(perfil ?? null);
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
