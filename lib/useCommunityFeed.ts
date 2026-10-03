import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isTrustedImageUrl } from '@/lib/validation';
import type { AppUser, Like, Post } from '@/lib/community';
import type { ToastVariant } from '@/components/ui/Toast';

const FEED_LIMIT = 120;
const REALTIME_REFRESH_DELAY_MS = 800;

type Messages = { mustLoginLike: string; likeError: string; deleteForbidden: string };

/**
 * Datos y acciones del feed de la comunidad: carga las publicaciones (con sus
 * likes), las fotos de perfil de los autores, se mantiene al día en tiempo
 * real y expone dar/quitar like, editar el texto y borrar.
 *
 * Todo el acceso a Supabase del feed vive aquí; la página solo decide qué mostrar.
 */
export function useCommunityFeed({
  user,
  messages,
  notify,
}: {
  user: AppUser | null;
  messages: Messages;
  notify: (message: string, variant?: ToastVariant) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [avatarByUserId, setAvatarByUserId] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          post_likes (
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(FEED_LIMIT);

      if (error) throw error;
      if (data) setPosts(data as Post[]);
    } catch (err) {
      console.error('Error cargando comunidad:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carga inicial del feed al montar. La regla experimental
    // `react-hooks/set-state-in-effect` (nueva en Next 16, aún inestable)
    // marca este patrón estándar de "fetch on mount"; es intencional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  // Fotos de perfil de quienes publicaron — solo se vuelve a pedir cuando
  // aparece un autor nuevo en el feed, no en cada like/actualización.
  const distinctAuthorIds = Array.from(new Set(posts.map((p) => p.user_id))).sort().join(',');
  useEffect(() => {
    if (!distinctAuthorIds) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('user_id, avatar_url')
      .in('user_id', distinctAuthorIds.split(','))
      .then(({ data }) => {
        if (cancelled || !data) return;
        const map: Record<string, string> = {};
        data.forEach((row) => {
          if (isTrustedImageUrl(row.avatar_url)) map[row.user_id] = row.avatar_url;
        });
        setAvatarByUserId(map);
      });
    return () => { cancelled = true; };
  }, [distinctAuthorIds]);

  // Feed en vivo: cuando alguien publica, edita, borra o da like, el feed se
  // refresca solo para todos los que tengan la página abierta. Requiere que
  // "community_posts" y "post_likes" tengan Realtime activado en Supabase
  // (Database → Replication) — ver supabase/rls-policies.sql.
  useEffect(() => {
    // Varios eventos seguidos (p. ej. una ráfaga de likes) se agrupan en
    // una sola recarga del feed en vez de una consulta completa por evento.
    let refreshTimer: number | undefined;
    const scheduleRefresh = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => reload(), REALTIME_REFRESH_DELAY_MS);
    };
    const channel = supabase
      .channel('community-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, scheduleRefresh)
      .subscribe();

    return () => {
      window.clearTimeout(refreshTimer);
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const toggleLike = async (postId: string, currentLikes: Like[]) => {
    if (!user) {
      notify(messages.mustLoginLike, 'info');
      return;
    }

    const hasLiked = currentLikes.some((like) => like.user_id === user.id);

    try {
      if (hasLiked) {
        const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }]);
        if (error) throw error;
      }

      await reload();
    } catch (err) {
      console.error('Error al actualizar like:', err);
      notify(messages.likeError, 'error');
    }
  };

  /** Devuelve true si se borró de verdad. */
  const deletePost = async (postId: string, imageUrl: string): Promise<boolean> => {
    try {
      const { data: deleted, error: dbError } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .select('id');

      if (dbError) throw dbError;
      // Si las políticas de seguridad impiden borrar (no eres el dueño),
      // Supabase no da error: simplemente no borra nada. Se avisa.
      if (!deleted || deleted.length === 0) {
        notify(messages.deleteForbidden, 'error');
        return false;
      }

      const fileName = imageUrl.split('/').pop()?.split('?')[0];
      if (fileName) {
        await supabase.storage.from('foro-fotos').remove([fileName]);
      }

      await reload();
      return true;
    } catch (err) {
      console.error('Error al eliminar:', err);
      notify(err instanceof Error ? err.message : 'Error desconocido', 'error');
      return false;
    }
  };

  /** Devuelve true si se guardó. */
  const updateTitle = async (postId: string, title: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('community_posts').update({ title }).eq('id', postId);
      if (error) throw error;
      await reload();
      return true;
    } catch (err) {
      console.error('Error al editar:', err);
      notify(err instanceof Error ? err.message : 'Error desconocido', 'error');
      return false;
    }
  };

  return { posts, avatarByUserId, loading, reload, toggleLike, deletePost, updateTitle };
}
