// Configuracion centralizada de SEO. Reemplazar con datos reales de Vasquez.
export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Rent a Car Vasquez",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://rentacarvasquez.com",
  telephone: process.env.NEXT_PUBLIC_SITE_PHONE ?? "+56912345678",
  email: process.env.NEXT_PUBLIC_SITE_EMAIL ?? "contacto@rentacarvasquez.com",
  city: "Puerto Natales",
  region: "Magallanes",
  country: "CL",
  street: process.env.NEXT_PUBLIC_SITE_STREET ?? "Av. Pedro Montt",
  streetNumber: process.env.NEXT_PUBLIC_SITE_NUMBER ?? "000",
  postalCode: "6160000",
  priceRange: "$$",
  lat: -51.7269,
  lng: -72.5042,
  areaRadiusKm: 100,
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  logoUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://rentacarvasquez.com") + "/logo.png",
} as const;

export const ORGANIZATION_ID = SITE.url + "/#organization";
export const WEBSITE_ID = SITE.url + "/#website";
