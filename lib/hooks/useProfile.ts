import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchProfileInfo, type ProfileInfo } from '@/lib/profiles';
import type { Post } from '@/lib/community';
import { ALLOWED_IMAGE_TYPES, extensionForMime, isTrustedImageUrl } from '@/lib/validation';
import type { ToastVariant } from '@/components/ui/Toast';

const PROFILE_POSTS_LIMIT = 200;
const AVATAR_MAX_SIZE_MB = 4;

function buildAvatarFileName(userId: string, ext: string): string {
  return `avatars/${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
}

type AvatarMessages = {
  badFormat: string;
  tooLarge: (mb: number) => string;
  avatarUpdated: string;
  unknownError: string;
};

/**
 * Datos del perfil público de `userId` (sus publicaciones y su ficha) y la
 * acción de cambiar la foto de perfil. La seguridad real vive en las
 * políticas RLS de Supabase; la interfaz solo muestra el botón al dueño.
 */
export function useProfile({
  userId,
  messages,
  notify,
}: {
  userId: string;
  messages: AvatarMessages;
  notify: (message: string, variant?: ToastVariant) => void;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [{ data, error }, profileInfo] = await Promise.all([
        supabase
          .from('community_posts')
          .select(`*, post_likes ( id, user_id, created_at )`)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(PROFILE_POSTS_LIMIT),
        fetchProfileInfo(userId),
      ]);

      if (!cancelled) {
        if (!error && data) setPosts(data as Post[]);
        setProfile(profileInfo);
        setAvatarUrl(isTrustedImageUrl(profileInfo?.avatar_url) ? profileInfo?.avatar_url ?? null : null);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      const ext = ALLOWED_IMAGE_TYPES.includes(file.type) ? extensionForMime(file.type) : null;
      if (!ext) {
        notify(messages.badFormat, 'error');
        return;
      }
      if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
        notify(messages.tooLarge(AVATAR_MAX_SIZE_MB), 'error');
        return;
      }

      setUploadingAvatar(true);
      const previousAvatarUrl = avatarUrl;
      try {
        const fileName = buildAvatarFileName(userId, ext);
        const { error: storageError } = await supabase.storage.from('foro-fotos').upload(fileName, file);
        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage.from('foro-fotos').getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('profiles')
          .upsert({ user_id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

        if (dbError) {
          // La foto ya se subió a Storage pero guardar el perfil falló:
          // se borra para no dejar archivos huérfanos en el bucket.
          await supabase.storage.from('foro-fotos').remove([fileName]);
          throw dbError;
        }

        setAvatarUrl(publicUrl);
        notify(messages.avatarUpdated, 'success');

        if (previousAvatarUrl?.includes('/foro-fotos/')) {
          const oldFileName = previousAvatarUrl.split('/foro-fotos/').pop();
          if (oldFileName) await supabase.storage.from('foro-fotos').remove([oldFileName]);
        }
      } catch (error) {
        console.error('Error al subir el avatar:', error);
        notify(error instanceof Error ? error.message : messages.unknownError, 'error');
      } finally {
        setUploadingAvatar(false);
      }
    },
    [avatarUrl, messages, notify, userId]
  );

  return { posts, profile, avatarUrl, loading, uploadingAvatar, uploadAvatar };
}
