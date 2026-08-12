import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/pwa";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PocketFrame — Your life, framed your way",
  description: "A private home for photos, videos, filming memories, locations, highlights, and creative inspiration.",
  applicationName: "PocketFrame",
  appleWebApp: { capable: true, title: "PocketFrame", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="blob blob-a -top-24 -left-24 w-96 h-96" />
          <div className="blob blob-b top-1/3 -right-32 w-[28rem] h-[28rem]" />
          <div className="blob blob-c bottom-0 left-1/4 w-80 h-80" />
          <div className="blob blob-d top-10 right-1/3 w-72 h-72" />
        </div>
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
