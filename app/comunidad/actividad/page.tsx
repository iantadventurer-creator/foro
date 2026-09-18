'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { avatarColorFor } from '@/lib/community';

type ActivityItem = {
    likeId: string;
    likedAt: string;
    likerUserId: string;
    likerHandle: string;
    postId: string;
    postTitle: string;
    postImageUrl: string;
};

export default function CommunityActivityPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null | undefined>(undefined); // undefined = todavía no se sabe
    const [items, setItems] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id ?? null);
        });
    }, []);

    useEffect(() => {
        if (!userId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(false);
            return;
        }
        let cancelled = false;

        async function load() {
            // Todas las publicaciones (para poder mostrar el handle de quien dio
            // like — no hay tabla de perfiles públicos, así que se toma prestado
            // del handle que esa persona usó en sus propias publicaciones).
            const { data: allPosts } = await supabase
                .from('community_posts')
                .select('id, title, image_url, user_id, instagram_handle');

            if (!allPosts) {
                if (!cancelled) setLoading(false);
                return;
            }

            const handleByUserId = new Map<string, string>();
            for (const p of allPosts) {
                if (p.instagram_handle && !handleByUserId.has(p.user_id)) {
                    handleByUserId.set(p.user_id, p.instagram_handle);
                }
            }

            const myPostIds = allPosts.filter((p) => p.user_id === userId).map((p) => p.id);
            if (myPostIds.length === 0) {
                if (!cancelled) { setItems([]); setLoading(false); }
                return;
            }

            const { data: likes, error } = await supabase
                .from('post_likes')
                .select('id, user_id, created_at, post_id')
                .in('post_id', myPostIds)
                .neq('user_id', userId)
                .order('created_at', { ascending: false });

            if (cancelled) return;
            if (error || !likes) { setLoading(false); return; }

            const postById = new Map(allPosts.map((p) => [p.id, p]));
            const activity: ActivityItem[] = likes
                .map((like) => {
                    const post = postById.get(like.post_id);
                    if (!post) return null;
                    return {
                        likeId: like.id,
                        likedAt: like.created_at,
                        likerUserId: like.user_id,
                        likerHandle: handleByUserId.get(like.user_id) || 'Alguien',
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
        return () => { cancelled = true; };
    }, [userId]);

    // "hace X" es relativo al momento de ver la pantalla; una pequeña
    // variación entre renders no importa.
    function timeAgo(iso: string): string {
        // eslint-disable-next-line react-hooks/purity
        const diffMs = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'ahora mismo';
        if (mins < 60) return `hace ${mins} min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `hace ${hours} h`;
        const days = Math.floor(hours / 24);
        return `hace ${days} d`;
    }

    return (
        <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center">
                    <Link href="/comunidad" className="text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider hover:underline">
                        ← Volver a la comunidad
                    </Link>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-10">
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-center mb-10">Actividad</h1>

                {userId === undefined || loading ? (
                    <div className="space-y-3" aria-hidden="true">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-16 rounded-xl animate-shimmer" />
                        ))}
                    </div>
                ) : userId === null ? (
                    <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm">
                        Inicia sesión para ver quién le dio &quot;me gusta&quot; a tus publicaciones.
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm">
                        Todavía no hay actividad — cuando alguien le dé &quot;me gusta&quot; a una de tus publicaciones, aparecerá acá.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {items.map((item, index) => (
                            <motion.button
                                key={item.likeId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03 }}
                                onClick={() => router.push(`/comunidad?post=${item.postId}`)}
                                className="flex items-center gap-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-left transition-colors"
                            >
                                <div
                                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-black text-[#14100a]"
                                    style={{ background: avatarColorFor(item.likerHandle) }}
                                    aria-hidden="true"
                                >
                                    {item.likerHandle.replace('@', '').charAt(0).toUpperCase()}
                                </div>
                                <p className="flex-1 min-w-0 text-sm text-[var(--color-text)]">
                                    <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{item.likerHandle}</span>
                                    {' '}le dio ❤️ a tu publicación{' '}
                                    <span className="text-[var(--color-text-muted)]">&quot;{item.postTitle.slice(0, 40)}{item.postTitle.length > 40 ? '…' : ''}&quot;</span>
                                    <span className="block text-[10px] text-[var(--color-text-faint)] font-semibold uppercase tracking-wide mt-0.5">{timeAgo(item.likedAt)}</span>
                                </p>
                                <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-black relative">
                                    <Image src={item.postImageUrl} alt="" fill sizes="40px" className="object-cover" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
