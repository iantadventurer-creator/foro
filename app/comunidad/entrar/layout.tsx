import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Inicia sesión en la comunidad de IanTBuild para publicar tus fotos LEGO y dar me gusta.',
};

export default function EntrarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
