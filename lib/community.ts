// Tipos y helpers compartidos entre las páginas de la comunidad (feed,
// perfil de usuario, actividad) — un solo lugar, no una copia en cada archivo.

export type Like = { id: string; user_id: string; created_at: string };

export type Post = {
  id: string;
  title: string;
  image_url: string;
  instagram_handle: string | null;
  instagram_url: string | null;
  user_id: string;
  created_at: string;
  category: string | null;
  post_likes: Like[];
};

const AVATAR_COLORS = ['var(--color-accent)', 'var(--color-accent-2)', 'var(--color-accent-3)', 'var(--color-accent-4)'];

/** Color determinista para el avatar, derivado del handle (mismo usuario = mismo color siempre). */
export function avatarColorFor(handle: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) hash = (hash * 31 + handle.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
