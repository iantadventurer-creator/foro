import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'blue' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[0_8px_24px_-8px_var(--shadow-accent)] hover:brightness-110',
  blue: 'bg-[var(--color-accent-3)] text-white shadow-[0_8px_24px_-8px_var(--shadow-accent-3)] hover:brightness-110',
  secondary:
    'bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-text-faint)]',
};

const SIZES: Record<Size, string> = {
  sm: 'px-5 py-2.5 text-xs uppercase tracking-wide',
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-3.5 text-sm uppercase tracking-wide font-button',
};

type Common = { variant?: Variant; size?: Size; fullWidth?: boolean; className?: string; children: ReactNode };
type AsLink = Common & { href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;
type AsButton = Common & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

/** Botón de la web. Con `href` es un enlace (`next/link`); sin él, un `<button>`.
 * Un solo lugar para el aspecto de los botones principales, en vez de repetir
 * las clases en cada página. */
export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', size = 'md', fullWidth, className = '', children, ...rest } = props;
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`.trim();

  if ('href' in rest && rest.href !== undefined) {
    return (
      <Link {...(rest as Omit<AsLink, keyof Common>)} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" {...(rest as Omit<AsButton, keyof Common>)} className={classes}>
      {children}
    </button>
  );
}
