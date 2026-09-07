import type { MetadataRoute } from "next";
import { site } from "@/data/portfolio";
import { seo } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.role}`,
    short_name: site.name,
    description: seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f6f8",
    theme_color: "#0a6b60",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
