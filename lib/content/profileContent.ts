// Textos de la página de perfil de un usuario.

export const profileContent = {
  es: {
    meta: 'Perfil',
    defaultHandle: 'Usuario',
    editAvatar: 'Editar foto de perfil',
    badFormat: 'Formato no admitido. Usa JPG, PNG, WEBP o GIF.',
    tooLarge: (mb: number) => `La imagen no puede superar los ${mb}MB.`,
    avatarUpdated: 'Foto de perfil actualizada.',
    unknownError: 'Error desconocido',
    posts: (n: number) => `${n} publicacion${n === 1 ? '' : 'es'}`,
    likes: (n: number) => `${n} me gusta`,
    noPosts: 'Este usuario todavía no tiene publicaciones.',
    noPostsOwn: 'Aún no has publicado nada. Comparte tu primera foto LEGO con la comunidad.',
    publishFirst: 'Publicar mi primera foto',
  },
  en: {
    meta: 'Profile',
    defaultHandle: 'User',
    editAvatar: 'Edit profile photo',
    badFormat: 'Unsupported format. Use JPG, PNG, WEBP or GIF.',
    tooLarge: (mb: number) => `The image can't be larger than ${mb}MB.`,
    avatarUpdated: 'Profile photo updated.',
    unknownError: 'Unknown error',
    posts: (n: number) => `${n} post${n === 1 ? '' : 's'}`,
    likes: (n: number) => `${n} like${n === 1 ? '' : 's'}`,
    noPosts: "This user doesn't have any posts yet.",
    noPostsOwn: "You haven't posted anything yet. Share your first LEGO photo with the community.",
    publishFirst: 'Post my first photo',
  },
};

export type ProfileContent = (typeof profileContent)['es'];
