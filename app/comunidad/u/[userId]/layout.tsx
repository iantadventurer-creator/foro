import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  return {
    title: 'Perfil de la comunidad',
    description: 'Fotos LEGO publicadas por un miembro de la comunidad de IanTBuild.',
    alternates: { canonical: `/comunidad/u/${userId}` },
  };
}

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return children;
}
