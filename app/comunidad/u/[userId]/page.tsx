'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { type Post, avatarColorFor } from '@/lib/community';
import { PostCard } from '@/components/community/PostCard';
import { CommunityHeaderNav } from '@/components/community/CommunityHeaderNav';
import { CommunityLogoutButton } from '@/components/community/CommunityLogoutButton';
import { LangToggle } from '@/components/community/LangToggle';
import { useToasts, ToastViewport } from '@/components/ui/Toast';

const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_MAX_SIZE_MB = 4;

function buildAvatarFileName(userId: string, originalName: string): string {
    const ext = originalName.split('.').pop() || 'jpg';
    return `avatars/${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
}

const content = {
    es: {
        volver: '← Volver a la comunidad',
        activityLabel: 'Actividad',
        publishLabel: 'Publicar',
        profileLabel: 'Mi perfil',
        logoutLabel: 'Cerrar sesión',
        defaultHandle: 'Usuario',
        editAvatar: 'Editar foto de perfil',
        badFormat: 'Formato no admitido. Usa JPG, PNG, WEBP o GIF.',
        tooLarge: (mb: number) => `La imagen no puede superar los ${mb}MB.`,
        avatarUpdated: 'Foto de perfil actualizada.',
        unknownError: 'Error desconocido',
        posts: (n: number) => `${n} publicacion${n === 1 ? '' : 'es'}`,
        likes: (n: number) => `❤️ ${n} me gusta`,
        noPosts: 'Este usuario todavía no tiene publicaciones.',
    },
    en: {
        volver: '← Back to community',
        activityLabel: 'Activity',
        publishLabel: 'Post',
        profileLabel: 'My profile',
        logoutLabel: 'Log out',
        defaultHandle: 'User',
        editAvatar: 'Edit profile photo',
        badFormat: 'Unsupported format. Use JPG, PNG, WEBP or GIF.',
        tooLarge: (mb: number) => `The image can't be larger than ${mb}MB.`,
        avatarUpdated: 'Profile photo updated.',
        unknownError: 'Unknown error',
        posts: (n: number) => `${n} post${n === 1 ? '' : 's'}`,
        likes: (n: number) => `❤️ ${n} like${n === 1 ? '' : 's'}`,
        noPosts: "This user doesn't have any posts yet.",
    },
};

export default function CommunityProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const { toasts, push, dismiss } = useToasts();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const t = content[lang];

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setCurrentUserId(session?.user?.id ?? null);
        });
    }, []);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const [{ data, error }, { data: profile }] = await Promise.all([
                supabase
                    .from('community_posts')
                    .select(`*, post_likes ( id, user_id, created_at )`)
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false }),
                supabase.from('profiles').select('avatar_url').eq('user_id', userId).maybeSingle(),
            ]);

            if (!cancelled) {
                if (!error && data) setPosts(data as Post[]);
                setAvatarUrl(profile?.avatar_url ?? null);
                setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [userId]);

    const handle = posts[0]?.instagram_handle || t.defaultHandle;
    const instagramUrl = posts.find((p) => p.instagram_url)?.instagram_url;
    const totalLikes = posts.reduce((sum, p) => sum + (p.post_likes?.length || 0), 0);
    const isOwnProfile = currentUserId !== null && currentUserId === userId;

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
            push(t.badFormat, 'error');
            return;
        }
        if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
            push(t.tooLarge(AVATAR_MAX_SIZE_MB), 'error');
            return;
        }

        setUploadingAvatar(true);
        const previousAvatarUrl = avatarUrl;
        try {
            const fileName = buildAvatarFileName(userId, file.name);
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
            push(t.avatarUpdated, 'success');

            if (previousAvatarUrl?.includes('/foro-fotos/')) {
                const oldFileName = previousAvatarUrl.split('/foro-fotos/').pop();
                if (oldFileName) await supabase.storage.from('foro-fotos').remove([oldFileName]);
            }
        } catch (error) {
            console.error('Error al subir el avatar:', error);
            push(error instanceof Error ? error.message : t.unknownError, 'error');
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
                <div className="max-w-4xl mx-auto grid grid-cols-3 items-center">
                    <Link href="/comunidad" className="justify-self-start text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider hover:underline">
                        {t.volver}
                    </Link>
                    <div className="justify-self-center">
                        <CommunityHeaderNav activityLabel={t.activityLabel} publishLabel={t.publishLabel} profileLabel={t.profileLabel} />
                    </div>
                    <div className="justify-self-end flex items-center gap-3">
                        <CommunityLogoutButton label={t.logoutLabel} />
                        <LangToggle lang={lang} onChange={setLang} />
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center gap-3 mb-10"
                >
                    <div className="relative">
                        <div
                            className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-black text-[#14100a]"
                            style={avatarUrl ? undefined : { background: avatarColorFor(handle) }}
                            aria-hidden={avatarUrl ? undefined : 'true'}
                        >
                            {avatarUrl ? (
                                <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" />
                            ) : (
                                handle.replace('@', '').charAt(0).toUpperCase()
                            )}
                        </div>
                        {isOwnProfile && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingAvatar}
                                    aria-label={t.editAvatar}
                                    title={t.editAvatar}
                                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-accent-3)] border-2 border-[var(--color-ink)] flex items-center justify-center text-xs text-white shadow-md hover:brightness-110 transition-[filter] disabled:opacity-60"
                                >
                                    {uploadingAvatar ? '…' : '✎'}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>
                    {instagramUrl ? (
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-display text-xl font-semibold text-[var(--color-text)] hover:underline flex items-center gap-1"
                        >
                            {handle} ↗
                        </a>
                    ) : (
                        <h1 className="font-display text-xl font-semibold text-[var(--color-text)]">{handle}</h1>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wide">
                        <span>{t.posts(posts.length)}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
                        <span>{t.likes(totalLikes)}</span>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0" aria-hidden="true">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="aspect-square animate-shimmer" />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="mx-4 sm:mx-0 text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm">
                        {t.noPosts}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onClick={() => router.push(`/comunidad?post=${post.id}`)} />
                        ))}
                    </div>
                )}
            </div>

            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </main>
    );
}
