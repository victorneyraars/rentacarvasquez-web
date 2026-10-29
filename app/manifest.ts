import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name + " - Arriendo de Vehiculos",
    short_name: SITE.name,
    description:
      "Arriendo de vehiculos en " + SITE.city + ". Flota renovada, seguro incluido.",
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
