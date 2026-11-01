'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { AppUser } from '@/lib/community';
import type { CommunityContent } from '@/lib/content/communityContent';

/** Tarjeta de la parte superior del feed. Con sesión: saludo, publicar y
 * perfil. Sin sesión: los tres pasos para participar y los botones de
 * registro / acceso. */
export function CommunityWelcome({
    t,
    user,
    avatarUrl,
    onPublish,
}: {
    t: CommunityContent;
    user: AppUser | null;
    avatarUrl?: string;
    onPublish: () => void;
}) {
    const cardClass = 'panel rounded-3xl bg-[var(--color-surface)] p-5 sm:p-7 mb-10';

    if (user) {
        const rawHandle = user.user_metadata?.instagram_handle || user.email?.split('@')[0] || 'anon';
        const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${cardClass} flex flex-col sm:flex-row sm:items-center gap-5`}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="rounded-full border border-[var(--color-border)]">
                        <Avatar handle={handle} imageUrl={avatarUrl} size={56} />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-display text-2xl font-bold truncate">{t.welcomeGreeting(handle)}</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">{t.welcomeDesc}</p>
                    </div>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Button variant="accent" onClick={onPublish} className="flex-1 sm:flex-none">
                        + {t.publishBtn}
                    </Button>
                    <Button href={`/comunidad/u/${user.id}`} variant="secondary" className="flex-1 sm:flex-none">
                        {t.myProfile}
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center`}>
            <div>
                <h2 className="font-display text-3xl font-bold leading-[0.95] text-[var(--color-text)] mb-2">{t.auth.joinTitle}</h2>
                <p className="text-sm text-[var(--color-text-muted)] mb-5">{t.auth.joinDesc}</p>
                <ol className="grid gap-3 sm:grid-cols-3">
                    {t.steps.map((step, i) => (
                        <li
                            key={step}
                            className="flex items-center gap-3 rounded-2xl bg-[var(--color-surface-2)] px-3 py-3 text-sm font-semibold text-[var(--color-text)]"
                        >
                            <span className="w-7 h-7 shrink-0 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] flex items-center justify-center text-xs font-bold">
                                {i + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-52">
                <Button href="/comunidad/registro" fullWidth>
                    {t.auth.signUpBtn}
                </Button>
                <Button href="/comunidad/entrar" variant="secondary" fullWidth>
                    {t.auth.loginBtn}
                </Button>
            </div>
        </motion.div>
    );
}
