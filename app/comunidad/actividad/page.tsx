'use client';

import { useRouter } from 'next/navigation';
import { ActivityRow } from '@/components/community/ActivityRow';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageTitle } from '@/components/ui/PageTitle';
import { ListSkeleton } from '@/components/ui/Skeletons';
import { activityContent } from '@/lib/content/activityContent';
import { useActivity } from '@/lib/hooks/useActivity';
import { useLang } from '@/lib/hooks/useLang';
import { useSessionUserId } from '@/lib/hooks/useSessionUserId';

export default function CommunityActivityPage() {
    const router = useRouter();
    const [lang, setLang] = useLang();
    const userId = useSessionUserId(); // undefined = todavía no se sabe
    const { items, loading } = useActivity(userId);
    const t = activityContent[lang];

    return (
        <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <CommunityHeader back="community" lang={lang} onLangChange={setLang} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
                <PageTitle
                    meta={<>♥ IanTBuild</>}
                    tone="secondary"
                    aside={userId && !loading ? String(items.length).padStart(2, '0') : undefined}
                    title={t.title}
                />

                {userId === undefined || loading ? (
                    <ListSkeleton />
                ) : userId === null ? (
                    <EmptyState>{t.mustLogin}</EmptyState>
                ) : items.length === 0 ? (
                    <EmptyState>{t.empty}</EmptyState>
                ) : (
                    <div className="max-w-3xl flex flex-col gap-3">
                        {items.map((item, index) => (
                            <ActivityRow
                                key={item.likeId}
                                item={item}
                                index={index}
                                t={t}
                                onOpen={(postId) => router.push(`/comunidad?post=${postId}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
