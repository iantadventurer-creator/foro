// Textos de la portada en español e inglés. Viven aparte de la página para que
// cambiar un texto no obligue a tocar componentes.

export const homeContent = {
  es: {
    nav: { gallery: 'Galería', community: 'Comunidad', about: 'Sobre mí', cta: 'Instagram', menu: 'Abrir menú' },
    hero: {
      badge: 'Fotografía de miniaturas',
      title: 'Pieza a pieza, historias a escala de bolsillo.',
      description: 'Dioramas construidos a mano, iluminación cinematográfica y un ojo obsesionado con el detalle. Bienvenido al set de @iantadventurer.',
      btnExplore: 'Ver la galería',
      stat1: 'Fotos publicadas',
      stat2: 'Universo',
    },
    intro: {
      eyebrow: 'Qué encontrarás aquí',
      title: 'Tres espacios, una sola pasión',
      cards: [
        { title: 'Galería', desc: 'Mis fotos de dioramas y minifiguras LEGO, ordenadas por universo: Star Wars, Ninjago, Marvel y más.', cta: 'Ver las fotos' },
        { title: 'Comunidad', desc: 'Crea una cuenta gratis, publica tus propias fotos LEGO y dale me gusta a las de otros fans.', cta: 'Entrar a la comunidad' },
        { title: 'Sobre mí', desc: 'Quién soy, cómo trabajo y dónde seguir mis novedades.', cta: 'Conocerme' },
      ],
    },
    gallery: {
      eyebrow: 'Galería',
      title: 'Fotos de miniaturas LEGO',
      subtitle: 'Toca una foto para verla en grande. Filtra por universo y guarda tus favoritas con el corazón.',
      filterAll: 'Todo',
      favorites: 'Favoritos',
      noResults: 'Todavía no marcaste ninguna foto como favorita.',
      empty: 'Aún no hay fotos en la galería.',
      errorTitle: 'No se pudo cargar el feed',
      errorDesc: 'Hubo un problema de conexión con Instagram. Puedes intentarlo de nuevo.',
      retry: 'Reintentar',
    },
    aboutSection: {
      eyebrow: 'Detrás del lente',
      title: 'De fan de LEGO a fotógrafo de sets',
      desc: '"Fan de los Legos desde niño. Ahora uso la fotografía para que cobren vida en mis propios escenarios."',
      cta: 'Seguir en Instagram',
    },
    modal: {
      viewOnIg: 'Ver en Instagram',
      copyLink: 'Copiar enlace',
      copied: '¡Enlace copiado!',
      close: 'Cerrar',
      prev: 'Foto anterior',
      next: 'Foto siguiente',
      addFavorite: 'Agregar a favoritos',
      removeFavorite: 'Quitar de favoritos',
    },
    footer: {
      tagline: 'Un portafolio inmersivo de fotografía de miniaturas.',
      linksTitle: 'Explorar',
      followTitle: 'Seguir',
      qrLabel: 'Código QR',
    },
    disclaimer: 'LEGO® es una marca registrada de The LEGO Group, que no patrocina ni respalda este sitio web.',
  },
  en: {
    nav: { gallery: 'Gallery', community: 'Community', about: 'About', cta: 'Instagram', menu: 'Open menu' },
    hero: {
      badge: 'Miniature photography',
      title: 'Brick by brick, pocket-scale stories.',
      description: 'Hand-built dioramas, cinematic lighting, and an eye obsessed with detail. Welcome to the set of @iantadventurer.',
      btnExplore: 'View gallery',
      stat1: 'Photos published',
      stat2: 'Universe',
    },
    intro: {
      eyebrow: 'What you will find here',
      title: 'Three spaces, one passion',
      cards: [
        { title: 'Gallery', desc: 'My LEGO diorama and minifigure photos, sorted by universe: Star Wars, Ninjago, Marvel and more.', cta: 'See the photos' },
        { title: 'Community', desc: "Create a free account, post your own LEGO photos and like other fans' work.", cta: 'Join the community' },
        { title: 'About me', desc: 'Who I am, how I work and where to follow my updates.', cta: 'Meet me' },
      ],
    },
    gallery: {
      eyebrow: 'Gallery',
      title: 'LEGO miniature photos',
      subtitle: 'Tap a photo to see it larger. Filter by universe and save your favorites with the heart.',
      filterAll: 'All',
      favorites: 'Favorites',
      noResults: "You haven't favorited any photos yet.",
      empty: 'No photos in the gallery yet.',
      errorTitle: "Couldn't load the feed",
      errorDesc: 'There was a connection issue with Instagram. You can try again.',
      retry: 'Retry',
    },
    aboutSection: {
      eyebrow: 'Behind the lens',
      title: 'From LEGO fan to set photographer',
      desc: 'Every shot combines advanced lighting techniques, meticulous set building, and a passion for snapping the perfect personality into each figure.',
      cta: 'Follow on Instagram',
    },
    modal: {
      viewOnIg: 'View on Instagram',
      copyLink: 'Copy link',
      copied: 'Link copied!',
      close: 'Close',
      prev: 'Previous photo',
      next: 'Next photo',
      addFavorite: 'Add to favorites',
      removeFavorite: 'Remove from favorites',
    },
    footer: {
      tagline: 'An immersive miniature photography portfolio.',
      linksTitle: 'Explore',
      followTitle: 'Follow',
      qrLabel: 'QR code',
    },
    disclaimer: 'LEGO® is a registered trademark of The LEGO Group, which does not sponsor or endorse this website.',
  },
};

export type HomeContent = (typeof homeContent)['es'];
