import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { AppUser } from '@/lib/community';

/** Usuario con sesión iniciada (o null), al día si inicia o cierra sesión. */
export function useSessionUser(): AppUser | null {
  const [user, setUser] = useState<AppUser | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return user;
}
