'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { PostCard } from '@/components/community/PostCard';
import { ProfileHeader } from '@/components/community/ProfileHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PostGridSkeleton } from '@/components/ui/Skeletons';
import { ToastViewport, useToasts } from '@/components/ui/Toast';
import { profileContent } from '@/lib/content/profileContent';
import { useLang } from '@/lib/hooks/useLang';
import { useProfile } from '@/lib/hooks/useProfile';
import { useSessionUserId } from '@/lib/hooks/useSessionUserId';
import { safeExternalUrl } from '@/lib/validation';

export default function CommunityProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = use(params);
    const router = useRouter();
    const [lang, setLang] = useLang();
    const { toasts, push, dismiss } = useToasts();
    const t = profileContent[lang];
    const currentUserId = useSessionUserId() ?? null;
    const { posts, profile, avatarUrl, loading, uploadingAvatar, uploadAvatar } = useProfile({
        userId,
        messages: t,
        notify: push,
    });

    const handle = profile?.username ? `@${profile.username}` : posts[0]?.instagram_handle || t.defaultHandle;
    const instagramUrl = safeExternalUrl(posts.find((p) => p.instagram_url)?.instagram_url);
    const totalLikes = posts.reduce((sum, p) => sum + (p.post_likes?.length || 0), 0);
    const isOwnProfile = currentUserId !== null && currentUserId === userId;

    return (
        <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <CommunityHeader back="community" lang={lang} onLangChange={setLang} />

            <div className="max-w-4xl mx-auto px-4 py-10">
                <ProfileHeader
                    handle={handle}
                    fullName={profile?.full_name}
                    avatarUrl={avatarUrl}
                    instagramUrl={instagramUrl}
                    isOwnProfile={isOwnProfile}
                    uploading={uploadingAvatar}
                    editAvatarLabel={t.editAvatar}
                    postsLabel={t.posts(posts.length)}
                    likesLabel={t.likes(totalLikes)}
                    onPickAvatar={uploadAvatar}
                />

                {loading ? (
                    <PostGridSkeleton count={6} />
                ) : posts.length === 0 ? (
                    <EmptyState className="mx-4 sm:mx-0">
                        <p>{isOwnProfile ? t.noPostsOwn : t.noPosts}</p>
                        {isOwnProfile && (
                            <Button href="/comunidad?publish=1" className="mt-5">
                                {t.publishFirst}
                            </Button>
                        )}
                    </EmptyState>
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
