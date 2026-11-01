'use client';

import type { Lang } from '@/lib/lang';

/** Selector ES/EN — el mismo control y estilo en toda la web. */
export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
    const option = (value: Lang) => (
        <button
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={lang === value}
            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${lang === value ? 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
        >
            {value.toUpperCase()}
        </button>
    );

    return (
        <div className="flex items-center gap-0.5 p-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]">
            {option('es')}
            {option('en')}
        </div>
    );
}
