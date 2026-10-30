import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isValidUsername } from '@/lib/validation';

export type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

const CHECK_DELAY_MS = 400;

/** Comprueba en vivo si un nombre de usuario es válido y está libre. Si la
 * función de la base de datos aún no existe (script SQL sin aplicar), no
 * muestra ningún aviso de "ocupado": el estado vuelve a `idle`. */
export function useUsernameAvailability(username: string): UsernameStatus {
  const [status, setStatus] = useState<UsernameStatus>('idle');

  useEffect(() => {
    if (!username) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('idle');
      return;
    }
    if (!isValidUsername(username)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('username_available', { uname: username });
      if (cancelled) return;
      if (error) setStatus('idle');
      else setStatus(data ? 'available' : 'taken');
    }, CHECK_DELAY_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username]);

  return status;
}
