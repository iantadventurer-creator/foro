'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { type Post, avatarColorFor } from '@/lib/community';
import { PostCard } from '@/components/community/PostCard';
import { CommunityHeaderNav } from '@/components/community/CommunityHeaderNav';

export default function CommunityProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const { data, error } = await supabase
                .from('community_posts')
                .select(`*, post_likes ( id, user_id, created_at )`)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!cancelled) {
                if (!error && data) setPosts(data as Post[]);
                setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [userId]);

    const handle = posts[0]?.instagram_handle || 'Usuario';
    const instagramUrl = posts.find((p) => p.instagram_url)?.instagram_url;
    const totalLikes = posts.reduce((sum, p) => sum + (p.post_likes?.length || 0), 0);

    return (
        <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/comunidad" className="text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider hover:underline">
                        ← Volver a la comunidad
                    </Link>
                    <CommunityHeaderNav />
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center text-center gap-3 mb-10"
                >
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-[#14100a]"
                        style={{ background: avatarColorFor(handle) }}
                        aria-hidden="true"
                    >
                        {handle.replace('@', '').charAt(0).toUpperCase()}
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
                        <span>{posts.length} publicacion{posts.length === 1 ? '' : 'es'}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
                        <span>❤️ {totalLikes} me gusta</span>
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
                        Este usuario todavía no tiene publicaciones.
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} onClick={() => router.push(`/comunidad?post=${post.id}`)} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
