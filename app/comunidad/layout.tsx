import type { Metadata } from 'next';

// La página de /comunidad es un Client Component ('use client'), y los
// Client Components no pueden exportar `metadata` directamente — por eso
// vive en este layout, que sí es un Server Component.
export const metadata: Metadata = {
  title: 'Comunidad',
  description:
    'Comparte tus propias creaciones LEGO, dale like a las de otros fans y forma parte de la comunidad de IanTBuild.',
  openGraph: {
    title: 'Comunidad · IanTBuild',
    description:
      'Comparte tus propias creaciones LEGO, dale like a las de otros fans y forma parte de la comunidad.',
  },
  twitter: {
    title: 'Comunidad · IanTBuild',
    description:
      'Comparte tus propias creaciones LEGO, dale like a las de otros fans y forma parte de la comunidad.',
  },
};

export default function ComunidadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
