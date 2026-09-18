// Sistema de categorías/franquicias compartido por TODA la web — la galería
// principal y la comunidad usan exactamente esta misma paleta, para que se
// sientan parte de un solo sistema y no dos secciones distintas pegadas.

export type CategoryTheme = { accent: string; shadow: string; ink: string };

export const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  'star wars': { accent: '#E8B923', shadow: '#8a6e14', ink: '#1a1300' },
  ninjago: { accent: '#FF6B00', shadow: '#a34500', ink: '#2b1200' },
  marvel: { accent: '#C0110C', shadow: '#6e0a07', ink: '#ffffff' },
  dc: { accent: '#0476F2', shadow: '#024a99', ink: '#ffffff' },
  minecraft: { accent: '#5C9E31', shadow: '#375f1d', ink: '#ffffff' },
  chill: { accent: '#8B7CF6', shadow: '#4f4499', ink: '#ffffff' },
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

export function getCategoryTheme(category: string | null | undefined): CategoryTheme | null {
  if (!category) return null;
  return CATEGORY_THEMES[category.trim().toLowerCase()] || null;
}
