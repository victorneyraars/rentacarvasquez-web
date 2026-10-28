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
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    lang: "es-CL",
    categories: ["travel", "transportation", "business"],
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
