import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'secondary' | 'onPhoto' | 'glass';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'lift font-button inline-flex items-center justify-center gap-2 rounded-full border font-semibold disabled:opacity-50 disabled:pointer-events-none';

// Botones: píldoras sobrias que se elevan un poco al pasar el ratón (utilidad
// lift de globals.css). "primary" es el acento pizarra; "accent", el salvia
// de la comunidad; "secondary", neutro con filete. "onPhoto" y "glass" son
// para ir encima de una foto (blanco sólido y cristal translúcido).
const VARIANTS: Record<Variant, string> = {
  primary: 'border-transparent bg-[var(--color-accent)] text-[var(--color-accent-ink)]',
  accent: 'border-transparent bg-[var(--color-accent-3)] text-[var(--color-accent-3-ink)]',
  secondary: 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]',
  onPhoto: 'border-transparent bg-white text-[#1d1d1f]',
  glass: 'border-white/35 bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
};

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
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
