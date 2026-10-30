'use client';

import { useTheme } from '@/lib/hooks/useTheme';
import { useLang } from '@/lib/hooks/useLang';

const LABELS = {
  es: { toDark: 'Activar modo oscuro', toLight: 'Activar modo claro' },
  en: { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' },
};

/** Botón sol/luna para alternar entre modo claro y oscuro. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, toggle] = useTheme();
  const [lang] = useLang();
  const label = theme === 'dark' ? LABELS[lang].toLight : LABELS[lang].toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-text-faint)] transition-colors ${className}`.trim()}
    >
      {theme === 'dark' ? (
        // Sol: se muestra en modo oscuro (pasar a claro)
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Luna: se muestra en modo claro (pasar a oscuro)
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
        </svg>
      )}
    </button>
  );
}
