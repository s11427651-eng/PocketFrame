import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PocketFrame — Your visual journal",
    short_name: "PocketFrame",
    description: "A private home for photos, videos, places, highlights, and shot ideas.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f8fb",
    theme_color: "#7c3aed",
    lang: "en",
    categories: ["lifestyle", "photo", "video", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Add a memory", url: "/upload", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Inspiration", url: "/inspiration", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
  };
}