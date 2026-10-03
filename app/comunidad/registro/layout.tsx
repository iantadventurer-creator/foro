import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrarte',
  description: 'Crea tu cuenta gratuita para publicar tus fotos LEGO y unirte a la comunidad de IanTBuild.',
  alternates: { canonical: '/comunidad/registro' },
  robots: { index: false, follow: true },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
