'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { categoryTextColor, type CategoryTheme } from '@/lib/categoryThemes';

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
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.96 }}
      style={
        active && theme
          ? { background: `${theme.accent}26`, color: categoryTextColor(theme), borderColor: `${theme.accent}99`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), inset 0 -2px 0 rgba(0,0,0,0.28), 0 6px 20px -10px ${theme.accent}` }
          : undefined
      }
      className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap border ${active
          ? theme
            ? ''
            : 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)] lego-bevel [--bevel-glow:var(--shadow-accent)]'
          : 'bg-[var(--color-surface)]/60 text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-text-faint)]'
        }`}
    >
      {children}
    </motion.button>
  );
}
