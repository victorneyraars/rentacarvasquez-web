import type { MetadataRoute } from "next";
import { getVehiculosDelPrestador } from "@/lib/api";
import { SITE } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE.url + "/",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const vehiculos = await getVehiculosDelPrestador();
    vehiculos.forEach((v) => {
      routes.push({
        url: SITE.url + "/vehiculos/" + v.id,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    });
  } catch (error) {
    console.error("[sitemap] Error cargando vehiculos:", error);
  }

  return routes;
}
