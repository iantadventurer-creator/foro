'use client';

import { useRouter } from 'next/navigation';
import { ActivityRow } from '@/components/community/ActivityRow';
import { CommunityHeader } from '@/components/community/CommunityHeader';
import { EmptyState } from '@/components/ui/EmptyState';
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

            <div className="max-w-2xl mx-auto px-4 py-10">
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-center mb-10">{t.title}</h1>

                {userId === undefined || loading ? (
                    <ListSkeleton />
                ) : userId === null ? (
                    <EmptyState>{t.mustLogin}</EmptyState>
                ) : items.length === 0 ? (
                    <EmptyState>{t.empty}</EmptyState>
                ) : (
                    <div className="flex flex-col gap-2">
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
