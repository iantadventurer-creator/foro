'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { CategoryTheme } from '@/lib/categoryThemes';

export function FilterPill({
  children,
  onClick,
  active,
  theme,
}: {
  children: ReactNode;
  onClick: () => void;
  active: boolean;
  theme?: CategoryTheme | null;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-pressed={active}
      whileTap={active ? { y: 1 } : undefined}
      style={
        active && theme
          ? { background: theme.accent, color: theme.ink, borderColor: theme.accent, boxShadow: `0 3px 0 0 ${theme.shadow}` }
          : undefined
      }
      className={`px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap border ${active
          ? theme
            ? ''
            : 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)] shadow-[0_3px_0_0_var(--shadow-accent)]'
          : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)]'
        }`}
    >
      {children}
    </motion.button>
  );
}
