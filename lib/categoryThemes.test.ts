import { describe, expect, it } from 'vitest';
import { CATEGORY_KEYS, categoryTextColor, formatCategoryLabel, getCategoryTheme } from './categoryThemes';

describe('formatCategoryLabel', () => {
  it('capitaliza y conserva siglas cortas', () => {
    expect(formatCategoryLabel('STAR WARS')).toBe('Star Wars');
    expect(formatCategoryLabel('dc')).toBe('DC');
    expect(formatCategoryLabel('mine_craft')).toBe('Mine Craft');
  });
});

describe('getCategoryTheme', () => {
  it('encuentra temas sin distinguir mayúsculas ni espacios', () => {
    expect(getCategoryTheme('  Marvel ')).toBe(getCategoryTheme('marvel'));
    expect(getCategoryTheme('desconocida')).toBeNull();
    expect(getCategoryTheme(null)).toBeNull();
  });

  it('cada categoría de CATEGORY_KEYS tiene tema', () => {
    for (const key of CATEGORY_KEYS) expect(getCategoryTheme(key)).not.toBeNull();
  });
});

describe('categoryTextColor', () => {
  it('mezcla el color con blanco, o usa el acento por defecto', () => {
    expect(categoryTextColor(getCategoryTheme('marvel'))).toContain('color-mix');
    expect(categoryTextColor(null)).toBe('var(--color-accent-text)');
  });
});
