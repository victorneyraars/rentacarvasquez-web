import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getPerfilCompleto } from "@/lib/api";
import { toSiteMetadata } from "@/lib/perfil-utils";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const perfil = await getPerfilCompleto();
  const meta = toSiteMetadata(perfil);

  return {
    name: meta.name + " - Arriendo de Vehiculos",
    short_name: meta.name,
    description: meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F5",
    theme_color: "#B45309",
    lang: "es-CL",
    categories: ["travel", "transportation", "business"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}