import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/** Id del usuario con sesión iniciada: `undefined` mientras se comprueba,
 * `null` si no hay sesión. Se mantiene al día si inicia o cierra sesión. */
export function useSessionUserId(): string | null | undefined {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return userId;
}
