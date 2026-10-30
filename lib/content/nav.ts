// Etiquetas de navegación comunes a todas las páginas de la comunidad
// (cabecera y botones). Una sola fuente en vez de repetirlas en cada página.

export const communityNav = {
  es: {
    backToHome: '← Volver al inicio',
    backToCommunity: '← Volver a la comunidad',
    activity: 'Actividad',
    publish: 'Publicar',
    profile: 'Mi perfil',
    logout: 'Cerrar sesión',
  },
  en: {
    backToHome: '← Back to home',
    backToCommunity: '← Back to community',
    activity: 'Activity',
    publish: 'Post',
    profile: 'My profile',
    logout: 'Log out',
  },
};

export type CommunityNav = (typeof communityNav)['es'];
