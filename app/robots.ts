import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/comunidad/entrar', '/comunidad/registro', '/comunidad/actividad'],
    },
    sitemap: 'https://iantbuild.vercel.app/sitemap.xml',
  };
}
