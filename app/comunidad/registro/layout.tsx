import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear perfil',
  description: 'Crea tu perfil gratuito para publicar tus fotos LEGO y unirte a la comunidad de IanTBuild.',
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
