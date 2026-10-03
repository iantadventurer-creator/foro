import { describe, expect, it } from 'vitest';
import { avatarColorFor } from './community';

describe('avatarColorFor', () => {
  it('es determinista: el mismo usuario siempre recibe el mismo color', () => {
    expect(avatarColorFor('@ian')).toBe(avatarColorFor('@ian'));
  });

  it('devuelve siempre uno de los colores del tema', () => {
    for (const handle of ['@a', '@b', '@c', '@zzz', '']) {
      expect(avatarColorFor(handle)).toMatch(/^var\(--color-accent(-\d)?\)$/);
    }
  });
});
