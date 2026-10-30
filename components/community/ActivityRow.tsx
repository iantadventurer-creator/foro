'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import type { ActivityItem } from '@/lib/hooks/useActivity';
import type { ActivityContent } from '@/lib/content/activityContent';

/** "hace X" es relativo al momento de ver la pantalla; una pequeña variación
 * entre renders no importa. */
function timeAgo(iso: string, t: ActivityContent): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    return t.timeAgo(mins, hours, days);
}

/** Una fila de la lista de actividad: quién dio like, a qué publicación y cuándo. */
export function ActivityRow({
    item,
    index,
    t,
    onOpen,
}: {
    item: ActivityItem;
    /** Posición en la lista, para escalonar la animación de entrada. */
    index: number;
    t: ActivityContent;
    onOpen: (postId: string) => void;
}) {
    const who = item.likerHandle || t.anonymous;
    const title = item.postTitle;

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.03 }}
            onClick={() => onOpen(item.postId)}
            className="flex items-center gap-3 bg-[var(--color-surface)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-3 text-left transition-colors"
        >
            <Avatar handle={who} size={36} />
            <p className="flex-1 min-w-0 text-sm text-[var(--color-text)]">
                <span className="font-bold text-[var(--color-accent-text)]">{who}</span>
                {' '}{t.likedYourPost}{' '}
                <span className="text-[var(--color-text-muted)]">&quot;{title.slice(0, 40)}{title.length > 40 ? '…' : ''}&quot;</span>
                <span className="block text-[10px] text-[var(--color-text-faint)] font-semibold uppercase tracking-wide mt-0.5">{timeAgo(item.likedAt, t)}</span>
            </p>
            <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-black relative">
                <Image src={item.postImageUrl} alt="" fill sizes="40px" className="object-cover" />
            </div>
        </motion.button>
    );
}
