import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  authErrorMessage,
  extensionForMime,
  isTrustedImageUrl,
  isValidUsername,
  normalizeUsername,
  safeExternalUrl,
} from './validation';

describe('safeExternalUrl', () => {
  it('acepta http y https', () => {
    expect(safeExternalUrl('https://instagram.com/iantadventurer')).toBe('https://instagram.com/iantadventurer');
    expect(safeExternalUrl('  http://example.com ')).toBe('http://example.com/');
  });

  it('rechaza esquemas peligrosos y basura', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(safeExternalUrl('JaVaScRiPt:alert(1)')).toBeNull();
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(safeExternalUrl('ftp://example.com')).toBeNull();
    expect(safeExternalUrl('no es una url')).toBeNull();
    expect(safeExternalUrl('')).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(undefined)).toBeNull();
  });
});

describe('extensionForMime', () => {
  it('deduce la extensión del tipo MIME, no del nombre', () => {
    expect(extensionForMime('image/jpeg')).toBe('jpg');
    expect(extensionForMime('image/png')).toBe('png');
    expect(extensionForMime('image/webp')).toBe('webp');
    expect(extensionForMime('image/gif')).toBe('gif');
  });

  it('devuelve null para tipos no permitidos', () => {
    expect(extensionForMime('image/svg+xml')).toBeNull();
    expect(extensionForMime('text/html')).toBeNull();
    expect(extensionForMime('')).toBeNull();
  });
});

describe('usernames', () => {
  it('normaliza a minúsculas y sin espacios', () => {
    expect(normalizeUsername('Ian T Build')).toBe('iantbuild');
  });

  it('valida el formato', () => {
    expect(isValidUsername('ian.t_build9')).toBe(true);
    expect(isValidUsername('ab')).toBe(false);
    expect(isValidUsername('a'.repeat(31))).toBe(false);
    expect(isValidUsername('Ian')).toBe(false);
    expect(isValidUsername('ian!')).toBe(false);
    expect(isValidUsername('.ian')).toBe(false);
    expect(isValidUsername('ian.')).toBe(false);
    expect(isValidUsername('ia..n')).toBe(false);
  });
});

describe('isTrustedImageUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('solo acepta el Storage público de nuestro proyecto', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc123.supabase.co');
    expect(isTrustedImageUrl('https://abc123.supabase.co/storage/v1/object/public/foro-fotos/a.png')).toBe(true);
    expect(isTrustedImageUrl('https://evil.example/storage/v1/object/public/foro-fotos/a.png')).toBe(false);
    expect(isTrustedImageUrl('https://abc123.supabase.co/rest/v1/profiles')).toBe(false);
    expect(isTrustedImageUrl('http://abc123.supabase.co/storage/v1/object/public/x.png')).toBe(false);
    expect(isTrustedImageUrl('javascript:alert(1)')).toBe(false);
    expect(isTrustedImageUrl(null)).toBe(false);
  });

  it('sin configuración no confía en nada', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    expect(isTrustedImageUrl('https://abc123.supabase.co/storage/v1/object/public/x.png')).toBe(false);
  });
});

describe('authErrorMessage', () => {
  it('traduce errores conocidos de Supabase', () => {
    expect(authErrorMessage('Invalid login credentials', 'es')).toBe('Correo o contraseña incorrectos.');
    expect(authErrorMessage('Invalid login credentials', 'en')).toBe('Incorrect email or password.');
    expect(authErrorMessage('Email not confirmed', 'es')).toContain('Confirma tu correo');
    expect(authErrorMessage('Database error saving new user', 'es')).toContain('nombre de usuario');
  });

  it('no filtra mensajes técnicos desconocidos', () => {
    const msg = authErrorMessage('relation "auth.secret_table" does not exist', 'es');
    expect(msg).not.toContain('secret_table');
    expect(msg).toContain('Inténtalo de nuevo');
  });
});
