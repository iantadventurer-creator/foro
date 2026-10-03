'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { FeedSection, type FeedSort } from '@/components/community/FeedSection';
import { PostModal } from '@/components/community/PostModal';
import { UploadModal } from '@/components/community/UploadModal';
import { communityContent } from '@/lib/communityContent';
import { useCommunityFeed } from '@/lib/useCommunityFeed';
import { useSessionUser } from '@/lib/useSessionUser';

export default function ComunidadPage() {
    const router = useRouter();
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const { toasts, push, dismiss } = useToasts();
    const user = useSessionUser();
    const t = communityContent[lang];

    const { posts, avatarByUserId, loading, reload, toggleLike, deletePost, updateTitle } = useCommunityFeed({
        user,
        messages: { mustLoginLike: t.mustLoginLike, likeError: t.likeError, deleteForbidden: t.deleteForbidden },
        notify: push,
    });

    const [filterMyPosts, setFilterMyPosts] = useState(false);
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<FeedSort>('recent');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{ id: string; imageUrl: string } | null>(null);

    // Mantiene el atributo lang del documento sincronizado con el selector ES/EN.
    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    // Permite enlazar directo a una publicación (?post=<id>) o abrir el
    // formulario de publicar (?publish=1) — así el perfil, la actividad y
    // la barra de navegación inferior pueden abrir estos modales de esta
    // misma página en vez de duplicar toda su lógica. Se lee con la API del
    // navegador en vez de useSearchParams para no forzar esta página a
    // salir del prerenderizado estático (useSearchParams exige un límite
    // de Suspense).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (postId) setSelectedPostId(postId);
        if (params.get('publish') === '1') setShowUploadModal(true);
    }, []);

    const openPost = (postId: string) => {
        setSelectedPostId(postId);
        router.replace(`/comunidad?post=${postId}`, { scroll: false });
    };

    const closePost = useCallback(() => {
        setSelectedPostId(null);
        router.replace('/comunidad', { scroll: false });
    }, [router]);

    const closeUpload = useCallback(() => {
        setShowUploadModal(false);
        router.replace('/comunidad', { scroll: false });
    }, [router]);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const { id, imageUrl } = pendingDelete;
        setPendingDelete(null);
        setSelectedPostId((current) => (current === id ? null : current));
        await deletePost(id, imageUrl);
    };

    const displayedPosts = posts
        .filter((post) => {
            if (filterMyPosts && user && post.user_id !== user.id) return false;
            if (filterCategory && post.category !== filterCategory) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'popular') return (b.post_likes?.length || 0) - (a.post_likes?.length || 0);
            return 0; // ya vienen ordenados por fecha desde la consulta
        });

    // El modal siempre muestra la versión más fresca del post (no la foto
    // congelada del momento en que se abrió), para que el contador de likes
    // se actualice en vivo si alguien más le da like mientras está abierto.
    const selectedPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) ?? null : null;

    return (
        <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <CommunityHeader
                backHref="/"
                backLabel={t.volver}
                lang={lang}
                onLangChange={setLang}
                activityLabel={t.activity}
                publishLabel={t.publishBtn}
                profileLabel={t.profile}
                logoutLabel={t.logout}
                onLogout={() => setFilterMyPosts(false)}
                onPublish={() => setShowUploadModal(true)}
            />

            <div className="max-w-2xl mx-auto px-4 pt-12">
                <div className="mb-10 text-center">
                    <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">{t.pageTitle}</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-2">{t.pageSubtitle}</p>
                    <ol className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs font-semibold text-[var(--color-text-muted)]">
                        {t.steps.map((step, i) => (
                            <li key={step} className="flex items-center gap-2">
                                {i > 0 && <span aria-hidden="true" className="text-[var(--color-text-faint)] mr-1">→</span>}
                                <span className="w-5 h-5 rounded-full bg-[var(--color-accent-3)]/20 text-[var(--color-accent-3-text)] text-[11px] flex items-center justify-center">{i + 1}</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                {!user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
                    >
                        <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)] mb-2">
                            {t.auth.joinTitle}
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            {t.auth.joinDesc}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/comunidad/registro"
                                className="flex-1 text-center bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-bold px-6 py-3 rounded-full text-sm hover:brightness-110 transition shadow-[0_8px_24px_-8px_var(--shadow-accent)]"
                            >
                                {t.auth.signUpBtn}
                            </Link>
                            <Link
                                href="/comunidad/entrar"
                                className="flex-1 text-center bg-[var(--color-surface-2)] text-[var(--color-text)] font-bold px-6 py-3 rounded-full text-sm border border-[var(--color-border)] hover:border-[var(--color-text-faint)] transition"
                            >
                                {t.auth.loginBtn}
                            </Link>
                        </div>
                    </motion.div>
                ) : null}
            </div>

            <FeedSection
                t={t}
                posts={displayedPosts}
                hasAnyPosts={posts.length > 0}
                loading={loading}
                filterCategory={filterCategory}
                sortBy={sortBy}
                canFilterMine={!!user}
                filterMyPosts={filterMyPosts}
                onFilterCategory={setFilterCategory}
                onSortBy={setSortBy}
                onToggleMine={() => setFilterMyPosts((v) => !v)}
                onOpenPost={openPost}
            />

            <UploadModal open={showUploadModal} user={user} t={t} notify={push} onClose={closeUpload} onPublished={reload} />

            <PostModal
                post={selectedPost}
                user={user}
                t={t}
                lang={lang}
                avatarUrl={selectedPost ? avatarByUserId[selectedPost.user_id] : undefined}
                onClose={closePost}
                onToggleLike={toggleLike}
                onRequestDelete={(id, imageUrl) => setPendingDelete({ id, imageUrl })}
                onSaveTitle={updateTitle}
            />

            <ConfirmDialog
                open={!!pendingDelete}
                title={t.confirmDeleteTitle}
                description={t.confirmDeleteDesc}
                confirmLabel={t.delete}
                cancelLabel={t.cancel}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </main>
    );
}
