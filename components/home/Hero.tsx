'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { distinctCategoryLabel, formatCategoryLabel } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Segundos que se ve cada foto antes de pasar a la siguiente. */
const SLIDE_SECONDS = 6.5;

const pad = (n: number, size = 3) => String(n).padStart(size, '0');

/** Portada como la página de un manual LEGO: una fila de datos arriba, el
 * titular y, debajo, la foto destacada entera (sin recortar, en una caja de
 * esquinas suaves) con su número de paso, junto a una "caja de piezas" con
 * las cinco más recientes. La foto va
 * pasando sola; se detiene con el ratón encima, con el botón de pausa y con
 * "reducir movimiento" activado (entonces solo se cambia a mano). Al tocar
 * la foto se abre en grande. */
export function Hero({
  t,
  photos,
  frameNumbers,
  photoCount,
  universeCount,
  loading,
  onOpenItem,
}: {
  t: HomeContent;
  /** Las fotos más recientes de la galería (se usan las cinco primeras). */
  photos: FeedItem[];
  /** Número fijo de cada foto en el archivo (la más antigua es la 001). */
  frameNumbers: Map<string, number>;
  photoCount: number;
  universeCount: number;
  loading: boolean;
  onOpenItem: (item: FeedItem) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);

  const slides = photos.slice(0, 5);
  const count = slides.length;
  const current = count > 0 ? index % count : 0;
  const active = slides[current];
  const autoplay = count > 1 && !reduceMotion;
  const running = autoplay && !paused && !hovering;

  // El avance lo marca el final de la animación de la línea de progreso: así
  // la línea y el cambio de foto nunca se desincronizan al pausar y reanudar.
  const next = () => setIndex((i) => (i + 1) % Math.max(count, 1));

  return (
    <section id="top" className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 pb-16 md:pb-24">
      <div className="label-caps grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 border-b border-[var(--color-border)] pb-3 text-[var(--color-text-muted)]">
        <span>IanTBuild — {t.hero.meta}</span>
        <span className="hidden md:block">{t.hero.badge}</span>
        <span aria-busy={loading} className="text-right md:text-left">
          {loading ? '—' : pad(photoCount)} {t.hero.stat1} · {loading ? '—' : pad(universeCount, 2)} {t.hero.stat2}
        </span>
        <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="link-underline hidden md:block justify-self-end w-fit">
          @iantadventurer ↗
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="grid gap-6 md:grid-cols-12 md:items-end py-8 md:py-12"
      >
        <h1 className="md:col-span-8 font-display font-semibold leading-[0.9] tracking-[-0.055em] text-[clamp(3.2rem,9vw,8rem)] text-[var(--color-text)]">
          {t.hero.display[0]} <span className="text-[var(--color-accent-text)]">{t.hero.display[1]}.</span>
        </h1>
        <div className="md:col-span-4 md:pb-2">
          <p className="max-w-md text-sm sm:text-base leading-relaxed text-[var(--color-text-muted)]">{t.hero.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button href="#gallery">{t.hero.btnExplore} ↓</Button>
            <Button href="/comunidad" variant="secondary">
              {t.nav.community} →
            </Button>
          </div>
        </div>
      </motion.div>

      <div
        className="grid gap-3 md:grid-cols-12 md:gap-6"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <figure className="md:col-span-8">
          <div className="callout relative overflow-hidden aspect-[4/5] sm:aspect-[4/3] md:aspect-auto md:h-[min(74vh,760px)]">
            {count === 0 ? (
              <span className="absolute inset-0 animate-shimmer" aria-hidden="true" />
            ) : (
              slides.map((item, i) => {
                const isActive = i === current;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenItem(item)}
                    tabIndex={isActive ? 0 : -1}
                    aria-hidden={!isActive}
                    aria-label={`${t.hero.viewPhoto}: ${item.title}`}
                    className={`absolute inset-0 cursor-zoom-in p-3 sm:p-6 md:p-8 transition-opacity duration-700 ease-out ${isActive ? 'z-[1] opacity-100' : 'pointer-events-none opacity-0'}`}
                  >
                    <span className="relative block h-full w-full">
                      <Image src={item.src} alt="" fill priority={i === 0} sizes="(max-width: 768px) 100vw, 66vw" className="object-contain" />
                    </span>
                  </button>
                );
              })
            )}
          </div>
          <figcaption className="mt-3 flex items-center justify-between gap-4">
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="font-display text-3xl font-bold leading-none tracking-[-0.05em] text-[var(--color-accent-text)]">
                {frameNumbers.get(active?.id ?? '') ?? current + 1}
              </span>
              <span className="label-caps min-w-0 truncate text-[var(--color-text-muted)]">
                / {Math.max(photoCount, count)}
                {active?.category && <> — {formatCategoryLabel(active.category)}</>}
              </span>
            </span>
            {autoplay && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? t.hero.play : t.hero.pause}
                aria-pressed={paused}
                className="label-caps link-underline shrink-0 text-[var(--color-text-muted)]"
              >
                {paused ? `▶ ${t.hero.playShort}` : `❚❚ ${t.hero.pauseShort}`}
              </button>
            )}
          </figcaption>
        </figure>

        <div className="md:col-span-4 md:self-start callout p-3 md:p-4">
        <p className="label-caps mb-3 text-[var(--color-text-muted)]">{t.hero.latest}</p>
        <ol className="grid grid-cols-5 gap-2 md:grid-cols-1 md:gap-1.5">
          {slides.map((item, i) => {
            const isActive = i === current;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${t.hero.slide} ${i + 1}: ${item.title}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group relative flex w-full items-center gap-3 rounded-lg text-left md:p-2 transition-colors ${isActive ? 'md:bg-[var(--color-surface)]' : 'md:hover:bg-[var(--color-surface)]/60'}`}
                >
                  <span className={`relative block aspect-[4/5] w-full md:w-12 shrink-0 overflow-hidden rounded-md bg-[var(--color-surface)] transition-opacity ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                    <Image src={item.src} alt="" fill sizes="(max-width: 768px) 20vw, 56px" className="object-cover" />
                  </span>
                  <span className="hidden md:block shrink-0 font-mono text-sm font-semibold text-[var(--color-text)]">1x</span>
                  <span className="hidden md:block min-w-0 flex-1">
                    <span className="label-caps block text-[var(--color-text-faint)]">
                      {pad(frameNumbers.get(item.id) ?? i + 1)}
                      {distinctCategoryLabel(item.category, item.title) && <> — {distinctCategoryLabel(item.category, item.title)}</>}
                    </span>
                    <span className={`mt-1 block truncate text-sm ${isActive ? 'font-semibold text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>{item.title}</span>
                  </span>
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1.5 md:inset-x-2 md:bottom-1 h-0.5 rounded-full bg-[var(--color-border)] overflow-hidden" aria-hidden="true">
                      {autoplay ? (
                        <span
                          key={`${current}-${item.id}`}
                          onAnimationEnd={next}
                          className="hero-progress block h-full w-full origin-left bg-[var(--color-accent)]"
                          style={{ animationDuration: `${SLIDE_SECONDS}s`, animationPlayState: running ? 'running' : 'paused' }}
                        />
                      ) : (
                        <span className="block h-full w-full bg-[var(--color-accent)]" />
                      )}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
        </div>
      </div>
    </section>
  );
}
