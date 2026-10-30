import { describe, expect, it } from 'vitest';
import { activityContent } from './activityContent';
import { authContent } from './authContent';
import { communityContent } from './communityContent';
import { homeContent } from './homeContent';
import { communityNav } from './nav';
import { profileContent } from './profileContent';

/** Lista las rutas de claves de un objeto ("a.b.c"); las funciones cuentan como hoja
 * y los arrays se comparan por longitud, para que ES y EN tengan la misma forma. */
function shape(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[${value.length}]`, ...value.flatMap((item, i) => shape(item, `${prefix}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([key, child]) => shape(child, prefix ? `${prefix}.${key}` : key))
      .sort();
  }
  return [prefix];
}

const dictionaries = {
  homeContent,
  communityContent,
  authContent,
  activityContent,
  profileContent,
  communityNav,
};

describe.each(Object.entries(dictionaries))('%s', (_name, dictionary) => {
  it('tiene exactamente las mismas claves en español e inglés', () => {
    expect(shape(dictionary.en)).toEqual(shape(dictionary.es));
  });

  it('no deja textos vacíos', () => {
    const empties = (value: unknown, path = ''): string[] => {
      if (typeof value === 'string') return value.trim() === '' ? [path] : [];
      if (Array.isArray(value)) return value.flatMap((v, i) => empties(v, `${path}[${i}]`));
      if (value && typeof value === 'object') {
        return Object.entries(value).flatMap(([k, v]) => empties(v, path ? `${path}.${k}` : k));
      }
      return [];
    };
    expect(empties(dictionary.es)).toEqual([]);
    expect(empties(dictionary.en)).toEqual([]);
  });
});
