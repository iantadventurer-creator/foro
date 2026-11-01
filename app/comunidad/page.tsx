'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { CommunityWelcome } from '@/components/community/CommunityWelcome';
import { PageTitle } from '@/components/ui/PageTitle';
import { FeedSection, type FeedSort } from '@/components/community/FeedSection';
import { PostModal } from '@/components/community/PostModal';
import { UploadModal } from '@/components/community/UploadModal';
import { communityContent } from '@/lib/content/communityContent';
import { useCommunityFeed } from '@/lib/hooks/useCommunityFeed';
import { useLang } from '@/lib/hooks/useLang';
import { useSessionUser } from '@/lib/hooks/useSessionUser';

export default function ComunidadPage() {
    const router = useRouter();
    const [lang, setLang] = useLang();
    const { toasts, push, dismiss } = useToasts();
    const user = useSessionUser();
    const t = communityContent[lang];

    const { posts, avatarByUserId, loading, error, reload, retry, toggleLike, deletePost, updateTitle } = useCommunityFeed({
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
                back="home"
                lang={lang}
                onLangChange={setLang}
                onLogout={() => setFilterMyPosts(false)}
                onPublish={() => setShowUploadModal(true)}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <PageTitle
                    meta={<>✦ IanTBuild</>}
                    aside={loading ? '—' : t.postsCount(posts.length)}
                    title={t.pageTitle}
                    subtitle={t.pageSubtitle}
                />

                <CommunityWelcome
                    t={t}
                    user={user}
                    avatarUrl={user ? avatarByUserId[user.id] : undefined}
                    onPublish={() => setShowUploadModal(true)}
                />
            </div>

            <FeedSection
                emptyAction={
                    user ? (
                        <Button variant="accent" onClick={() => setShowUploadModal(true)}>
                            {t.emptyCtaIn}
                        </Button>
                    ) : (
                        <Button href="/comunidad/registro">{t.emptyCtaOut}</Button>
                    )
                }
                t={t}
                posts={displayedPosts}
                hasAnyPosts={posts.length > 0}
                loading={loading}
                error={error}
                onRetry={retry}
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
