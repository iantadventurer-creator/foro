import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'secondary' | 'onPhoto' | 'glass';
type Size = 'sm' | 'md' | 'lg';

const BASE =
  'lift font-button inline-flex items-center justify-center gap-2 rounded-md border font-medium uppercase tracking-[0.04em] disabled:opacity-50 disabled:pointer-events-none';

// Botones con forma de ladrillo LEGO: rectángulo de esquinas suaves con dos
// studs asomando por encima (clase brick de globals.css) y texto monoespaciado.
// "primary" es Sand Blue; "accent", el Sand Green de la comunidad;
// "secondary", un ladrillo gris claro de solo filete. "onPhoto" y "glass" van
// encima de una foto (blanco sólido y cristal translúcido), sin studs.
const VARIANTS: Record<Variant, string> = {
  primary: 'brick [--brick-color:var(--color-accent)] border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)] hover:opacity-85',
  accent: 'brick [--brick-color:var(--color-accent-3)] border-[var(--color-accent-3)] bg-[var(--color-accent-3)] text-[var(--color-accent-3-ink)] hover:opacity-85',
  secondary: 'brick [--brick-color:var(--color-border)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-highlight)]',
  onPhoto: 'border-transparent bg-white text-[#1d1d1f]',
  glass: 'border-white/35 bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-[11px]',
  md: 'px-5 py-3 text-xs',
  lg: 'px-7 py-4 text-sm',
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
