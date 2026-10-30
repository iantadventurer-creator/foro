import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type ActivityItem = {
  likeId: string;
  likedAt: string;
  likerUserId: string;
  likerHandle: string;
  postId: string;
  postTitle: string;
  postImageUrl: string;
};

const ACTIVITY_LIMIT = 100;

/** Los "me gusta" que han recibido las publicaciones de `userId`, del más
 * reciente al más antiguo. Pide solo lo necesario: las publicaciones propias,
 * sus likes y el nombre de quienes los dieron. */
export function useActivity(userId: string | null | undefined) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      const { data: myPosts } = await supabase.from('community_posts').select('id, title, image_url').eq('user_id', userId);

      if (cancelled) return;
      if (!myPosts || myPosts.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: likes, error } = await supabase
        .from('post_likes')
        .select('id, user_id, created_at, post_id')
        .in('post_id', myPosts.map((p) => p.id))
        .neq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(ACTIVITY_LIMIT);

      if (cancelled) return;
      if (error || !likes) {
        setLoading(false);
        return;
      }

      // El nombre de quien dio like se toma del handle de sus publicaciones
      // (solo de las personas que aparecen en esta lista).
      const likerIds = Array.from(new Set(likes.map((like) => like.user_id)));
      const handleByUserId = new Map<string, string>();
      if (likerIds.length > 0) {
        const { data: likerPosts } = await supabase
          .from('community_posts')
          .select('user_id, instagram_handle')
          .in('user_id', likerIds);
        for (const p of likerPosts ?? []) {
          if (p.instagram_handle && !handleByUserId.has(p.user_id)) {
            handleByUserId.set(p.user_id, p.instagram_handle);
          }
        }
      }
      if (cancelled) return;

      const postById = new Map(myPosts.map((p) => [p.id, p]));
      const activity = likes
        .map((like): ActivityItem | null => {
          const post = postById.get(like.post_id);
          if (!post) return null;
          return {
            likeId: like.id,
            likedAt: like.created_at,
            likerUserId: like.user_id,
            likerHandle: handleByUserId.get(like.user_id) || '',
            postId: post.id,
            postTitle: post.title,
            postImageUrl: post.image_url,
          };
        })
        .filter((x): x is ActivityItem => x !== null);

      setItems(activity);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { items, loading };
}
