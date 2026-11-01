'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BrandMark } from '@/components/ui/BrandMark';
import { LangToggle } from '@/components/ui/LangToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Lang } from '@/lib/lang';

/** Marco común de las pantallas de acceso (entrar / registrarse), con el
 * mismo esquema que Instagram: una tarjeta central con la marca arriba y,
 * debajo, otra para pasar a la otra pantalla. */
export function AuthShell({
    lang,
    onLangChange,
    backLabel,
    tagline,
    switchText,
    switchLabel,
    switchHref,
    children,
}: {
    lang: Lang;
    onLangChange: (lang: Lang) => void;
    backLabel: string;
    tagline: string;
    switchText: string;
    switchLabel: string;
    switchHref: string;
    children: ReactNode;
}) {
    return (
        <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/comunidad" className="link-underline py-2 text-sm font-bold text-[var(--color-text)]">
                        {backLabel}
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LangToggle lang={lang} onChange={onLangChange} />
                    </div>
                </div>
            </header>

            <div className="max-w-md mx-auto px-4 pt-6 md:pt-10 pb-16 flex flex-col gap-5">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="panel overflow-hidden rounded-[2rem] bg-[var(--color-surface)]"
                >
                    <div className="px-7 pt-9 pb-2 text-center">
                        <BrandMark className="w-11 h-11 rounded-xl mx-auto mb-4" />
                        <p className="font-display text-3xl font-bold tracking-[-0.04em]">IanTBuild</p>
                        <p className="text-sm text-[var(--color-text-muted)] mt-2 leading-relaxed">{tagline}</p>
                    </div>
                    <div className="px-7 pt-6 pb-8">{children}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="panel-sm rounded-3xl bg-[var(--color-surface)] px-7 py-4 text-center text-sm text-[var(--color-text-muted)]"
                >
                    {switchText}{' '}
                    <Link href={switchHref} className="font-semibold text-[var(--color-accent-text)] hover:underline">
                        {switchLabel}
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
