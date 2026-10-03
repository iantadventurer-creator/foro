import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Actividad',
  description: 'Mira quién dio me gusta a tus publicaciones en la comunidad de IanTBuild.',
  alternates: { canonical: '/comunidad/actividad' },
  robots: { index: false, follow: true },
};

export default function ActividadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
