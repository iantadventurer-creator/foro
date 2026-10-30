// Textos de la página de actividad (quién dio me gusta a tus publicaciones).

export const activityContent = {
  es: {
    title: 'Actividad',
    mustLogin: 'Inicia sesión para ver quién le dio "me gusta" a tus publicaciones.',
    empty: 'Todavía no hay actividad — cuando alguien le dé "me gusta" a una de tus publicaciones, aparecerá acá.',
    likedYourPost: 'le dio ❤️ a tu publicación',
    anonymous: 'Alguien',
    timeAgo: (mins: number, hours: number, days: number) => {
      if (mins < 1) return 'ahora mismo';
      if (mins < 60) return `hace ${mins} min`;
      if (hours < 24) return `hace ${hours} h`;
      return `hace ${days} d`;
    },
  },
  en: {
    title: 'Activity',
    mustLogin: 'Sign in to see who liked your posts.',
    empty: "No activity yet — when someone likes one of your posts, it'll show up here.",
    likedYourPost: 'liked your post',
    anonymous: 'Someone',
    timeAgo: (mins: number, hours: number, days: number) => {
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return `${days}d ago`;
    },
  },
};

export type ActivityContent = (typeof activityContent)['es'];
