'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BrandMark } from '@/components/ui/BrandMark';
import { LangToggle } from '@/components/ui/LangToggle';
import type { Lang } from '@/lib/lang';

/** Marco común de las pantallas de acceso (entrar / registrarse), con el
 * mismo esquema que Instagram: una tarjeta central con la marca arriba y,
 * debajo, una segunda tarjeta para pasar a la otra pantalla. */
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
            <header className="px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/comunidad" className="inline-block py-2 text-xs font-semibold uppercase text-[var(--color-accent-text)] tracking-wider hover:underline">
                        {backLabel}
                    </Link>
                    <LangToggle lang={lang} onChange={onLangChange} />
                </div>
            </header>

            <div className="max-w-sm mx-auto px-4 pt-6 pb-16 flex flex-col gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lego-studs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-8 py-10"
                >
                    <div className="flex flex-col items-center text-center mb-8">
                        <BrandMark className="w-14 h-14 rounded-xl lego-bevel [--bevel-glow:var(--shadow-accent)] mb-4" />
                        <p className="font-display text-3xl font-semibold tracking-tight">IanTBuild</p>
                        <p className="text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed">{tagline}</p>
                    </div>
                    {children}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-8 py-5 text-center text-sm text-[var(--color-text-muted)]"
                >
                    {switchText}{' '}
                    <Link href={switchHref} className="text-[var(--color-accent-text)] font-semibold hover:underline">
                        {switchLabel}
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
