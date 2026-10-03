import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { FilmGrainOverlay } from "@/components/ui/FilmGrainOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://iantbuild.vercel.app'),
  title: {
    default: "IanTBuild — Fotografía de miniaturas LEGO",
    template: "%s · IanTBuild",
  },
  description:
    "Portafolio de fotografía de miniaturas LEGO de @iantadventurer: dioramas, iluminación cinematográfica y una comunidad para compartir tus propias creaciones.",
  openGraph: {
    title: "IanTBuild — Fotografía de miniaturas LEGO",
    description:
      "Dioramas, iluminación cinematográfica y una comunidad para compartir tus creaciones LEGO.",
    siteName: "IanTBuild",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IanTBuild — Fotografía de miniaturas LEGO",
    description:
      "Dioramas, iluminación cinematográfica y una comunidad para compartir tus creaciones LEGO.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IanTBuild",
  url: "https://iantbuild.vercel.app",
  inLanguage: ["es", "en"],
  description:
    "Portafolio de fotografía de miniaturas LEGO de @iantadventurer y comunidad para compartir creaciones.",
  author: { "@type": "Person", name: "IanTBuild", url: "https://instagram.com/iantadventurer" },
};

export const viewport: Viewport = {
  themeColor: "#070a13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-ink)] text-[var(--color-text)]">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-[var(--color-accent)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
        >
          Saltar al contenido
        </a>
        <script
          type="application/ld+json"
          // Datos estructurados (schema.org) para buscadores; contenido propio y estático.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AmbientBackground />
        <MotionProvider>{children}</MotionProvider>
        <FilmGrainOverlay />
        <Analytics />
      </body>
    </html>
  );
}
