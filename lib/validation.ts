// Validaciones compartidas entre formularios y componentes. Viven aquí (y no
// repartidas en cada página) para poder probarlas y para que todas las
// pantallas apliquen exactamente las mismas reglas.

export type Lang = 'es' | 'en';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/** La extensión se deduce del tipo MIME validado, nunca del nombre del archivo
 * (el nombre lo controla el usuario y puede mentir o traer caracteres raros). */
export function extensionForMime(mime: string): string | null {
  return EXTENSION_BY_MIME[mime] ?? null;
}

export const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

export function normalizeUsername(raw: string): string {
  return raw.toLowerCase().replace(/\s/g, '');
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username) && !username.startsWith('.') && !username.endsWith('.') && !username.includes('..');
}

/** Devuelve la URL normalizada solo si es http(s); si no (por ejemplo
 * `javascript:` o `data:`), devuelve null. Se usa antes de guardar y antes de
 * pintar cualquier enlace que haya escrito un usuario. */
export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Una imagen de usuario solo se considera de confianza si vive en el
 * Storage de nuestro propio proyecto de Supabase. */
export function isTrustedImageUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && url.host === new URL(base).host && url.pathname.startsWith('/storage/v1/object/public/');
  } catch {
    return false;
  }
}

const AUTH_ERRORS: { match: RegExp; es: string; en: string }[] = [
  { match: /invalid login credentials/i, es: 'Correo o contraseña incorrectos.', en: 'Incorrect email or password.' },
  { match: /email not confirmed/i, es: 'Confirma tu correo antes de iniciar sesión (revisa tu bandeja de entrada).', en: 'Confirm your email before logging in (check your inbox).' },
  { match: /user already registered|already been registered/i, es: 'Este correo ya está registrado.', en: 'This email is already registered.' },
  { match: /password should be at least/i, es: 'La contraseña debe tener al menos 6 caracteres.', en: 'The password must be at least 6 characters.' },
  { match: /rate limit|too many requests|after \d+ seconds/i, es: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.', en: 'Too many attempts. Wait a moment and try again.' },
  { match: /database error saving new user/i, es: 'Ese nombre de usuario ya está en uso o no es válido.', en: 'That username is already taken or invalid.' },
  { match: /failed to fetch|network/i, es: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.', en: 'No connection. Check your internet and try again.' },
];

/** Traduce los mensajes de error de Supabase Auth (en inglés y técnicos) a
 * un texto claro en el idioma de la interfaz. */
export function authErrorMessage(message: string, lang: Lang): string {
  const found = AUTH_ERRORS.find((entry) => entry.match.test(message));
  if (found) return found[lang];
  return lang === 'es' ? 'No se pudo completar la acción. Inténtalo de nuevo.' : 'The action could not be completed. Please try again.';
}
