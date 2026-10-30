/** Ejecuta `task` y, si falla, lo reintenta con una espera creciente. Sirve
 * para cortes de red puntuales (p. ej. `Failed to fetch` en móvil), que de
 * otro modo dejarían la página en estado de error por un único fallo. */
export async function withRetry<T>(task: () => Promise<T>, { attempts = 3, baseDelayMs = 400 } = {}): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
      }
    }
  }
  throw lastError;
}

/** Convierte una respuesta de Supabase `{ data, error }` en una promesa que
 * falla si hay error, para poder usarla con `withRetry`. */
export async function orThrow<T>(request: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await request;
  if (error) throw error;
  return data;
}
