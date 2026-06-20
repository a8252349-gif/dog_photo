import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
export default function manifest(): MetadataRoute.Manifest {
  return { name: `${SITE.name} 반려동물 증명사진`, short_name: SITE.name, description: SITE.description, start_url: "/", display: "standalone", background_color: "#f7f1e7", theme_color: "#243b49", lang: "ko", icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }, { src: "/apple-icon", sizes: "180x180", type: "image/png" }] };
}
