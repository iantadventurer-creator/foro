import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Space_Grotesk } from "next/font/google";
import { Fredoka } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { BackgroundBrickField } from "@/components/ui/BackgroundBrickField";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// La fuente exacta del logotipo de LEGO es propiedad de la marca y no está
// disponible para uso libre. Fredoka es una alternativa gratuita con el mismo
// espíritu: redondeada, gruesa y juguetona — reservada solo para los botones.
const fredoka = Fredoka({
  variable: "--font-fredoka",
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
      className={`${geistSans.variable} ${spaceGrotesk.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-ink)] text-[var(--color-text)]">
        <BackgroundBrickField />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
