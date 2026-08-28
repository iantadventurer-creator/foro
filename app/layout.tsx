import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { BackgroundBrickField } from "@/components/ui/BackgroundBrickField";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// La fuente exacta del logotipo de LEGO es propiedad de la marca y no está
// disponible para uso libre. Fredoka es una alternativa gratuita con el mismo
// espíritu: redondeada, gruesa y juguetona, para los títulos.
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
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

export const viewport: Viewport = {
  themeColor: "#05070c",
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
      className={`${geistSans.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-ink)] text-[var(--color-text)]">
        <BackgroundBrickField />
        {children}
      </body>
    </html>
  );
}
