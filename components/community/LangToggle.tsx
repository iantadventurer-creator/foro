'use client';

/** Selector ES/EN — mismo control y estilo en todas las páginas de la
 * comunidad (feed, perfil, actividad). */
export function LangToggle({ lang, onChange }: { lang: 'es' | 'en'; onChange: (lang: 'es' | 'en') => void }) {
    return (
        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
            <button
                onClick={() => onChange('es')}
                aria-pressed={lang === 'es'}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
                ES
            </button>
            <button
                onClick={() => onChange('en')}
                aria-pressed={lang === 'en'}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
            >
                EN
            </button>
        </div>
    );
}
