// Sistema de categorías/franquicias compartido por TODA la web — la galería
// principal y la comunidad usan exactamente esta misma paleta, para que se
// sientan parte de un solo sistema y no dos secciones distintas pegadas.

export type CategoryTheme = { accent: string; shadow: string; ink: string };

// Colores apagados sacados de la gama real de ladrillos LEGO (Dark Tan, Sand
// Blue, Sand Green...), todos con luminosidad y saturación parecidas para que
// convivan con la paleta de la web sin chillar al lado de las fotos.
export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'star wars': { accent: '#A38A5C', shadow: '#6e5c3a', ink: '#ffffff' }, // Dark Tan
  ninjago: { accent: '#B46A3C', shadow: '#7a4524', ink: '#ffffff' }, // Dark Orange
  marvel: { accent: '#A04545', shadow: '#6b2b2b', ink: '#ffffff' }, // Dark Red
  dc: { accent: '#5F75A3', shadow: '#3d4d6e', ink: '#ffffff' }, // Sand Blue
  minecraft: { accent: '#6C9A76', shadow: '#46664d', ink: '#ffffff' }, // Sand Green
  chill: { accent: '#8A78A8', shadow: '#5a4d70', ink: '#ffffff' }, // Sand Purple
};

/** Claves en minúscula, en el orden en que se muestran los selectores/filtros. */
export const CATEGORY_KEYS = Object.keys(CATEGORY_THEMES);

/** "STAR WARS" → "Star Wars", pero conserva las siglas cortas (p. ej. "DC") en mayúsculas. */
export function formatCategoryLabel(raw: string): string {
  return raw
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

/** Nombre del universo para el pie de una foto, o null si repite el título
 * (muchas fotos se titulan solo con el nombre de su universo). */
export function distinctCategoryLabel(category: string | undefined | null, title: string): string | null {
  if (!category) return null;
  const label = formatCategoryLabel(category);
  return label.toLowerCase() === title.trim().toLowerCase() ? null : label;
}

export function getCategoryTheme(category: string | null | undefined): CategoryTheme | null {
  if (!category) return null;
  return CATEGORY_THEMES[category.trim().toLowerCase()] || null;
}

/** Versión del color de la categoría apta para TEXTO sobre el fondo del tema:
 * se mezcla con negro (tema claro) o con blanco (tema oscuro) según las
 * variables --category-mix de globals.css, para alcanzar contraste AA. */
export function categoryTextColor(theme: CategoryTheme | null | undefined): string {
  return theme ? `color-mix(in srgb, ${theme.accent} var(--category-mix-amount), var(--category-mix))` : 'var(--color-accent-text)';
}
