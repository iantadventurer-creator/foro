'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { DoodleArrow, DoodleBrick, DoodleMinifig, DoodleSparkle, DoodleUnderline } from '@/components/ui/Doodles';
import { formatCategoryLabel } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Segundos que se ve cada foto antes de pasar a la siguiente. */
const SLIDE_SECONDS = 6.5;

/** Giro de cada miniatura, para que parezcan fotos sueltas pegadas a mano. */
const THUMB_TILT = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-1'];

/** Portada como la primera página de un cuaderno de bocetos: un saludo a
 * mano, el titular subrayado con bolígrafo y una minifigura garabateada; al
 * lado, la foto más reciente como una polaroid pegada con cinta, con una
 * nota y una flecha, y debajo las otras cuatro en miniatura. La foto va
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
  /** Número fijo de cada foto en el archivo (la más antigua es la 1). */
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
    <section id="top" className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-8 md:pt-14 pb-16 md:pb-24">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8 md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative md:col-span-5"
        >
          <p className="hand text-2xl text-[var(--color-accent-text)]">{t.hero.hello}</p>
          <h1 className="mt-2 font-display font-bold leading-[0.82] text-[clamp(4.25rem,10vw,8.5rem)] text-[var(--color-text)]">
            {t.hero.display[0]}{' '}
            <span className="relative inline-block">
              {t.hero.display[1]}.
              <DoodleUnderline className="absolute -bottom-1 left-0 h-4 w-full text-[var(--color-accent)]" />
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--color-text-muted)]">{t.hero.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#gallery">{t.hero.btnExplore} ↓</Button>
            <Button href="/comunidad" variant="secondary">
              {t.nav.community} →
            </Button>
          </div>
          <p className="hand mt-6 text-xl text-[var(--color-text-muted)]" aria-busy={loading}>
            {loading ? '—' : photoCount} {t.hero.stat1.toLowerCase()} · {loading ? '—' : universeCount} {t.hero.stat2.toLowerCase()}
          </p>

          <DoodleMinifig className="hidden lg:block absolute -right-2 top-4 w-16 rotate-6 text-[var(--color-line)] opacity-80" />
          <DoodleBrick className="hidden md:block absolute -left-3 -bottom-16 w-24 -rotate-3 text-[var(--color-text-faint)] opacity-70" />
        </motion.div>

        <div
          className="md:col-span-7 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <motion.figure
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: 1.5 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="polaroid tape relative w-full max-w-[440px]"
          >
            <p className="hand pointer-events-none absolute -top-12 -left-4 sm:-left-28 z-[3] flex items-end gap-1 text-xl text-[var(--color-accent-text)] -rotate-6">
              {t.hero.latestNote}
              <DoodleArrow className="w-12 h-9 translate-y-5" />
            </p>
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-surface-2)]">
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
                      className={`absolute inset-0 cursor-zoom-in transition-opacity duration-700 ease-out ${isActive ? 'z-[1] opacity-100' : 'pointer-events-none opacity-0'}`}
                    >
                      <Image src={item.src} alt="" fill priority={i === 0} sizes="(max-width: 768px) 100vw, 440px" className="object-cover" />
                    </button>
                  );
                })
              )}
            </div>
            <figcaption className="flex items-center justify-between gap-3 px-1 pt-2 pb-1">
              <span className="hand min-w-0 truncate text-2xl text-[var(--color-text)]">
                #{frameNumbers.get(active?.id ?? '') ?? current + 1}
                {active?.category && <span className="text-[var(--color-text-muted)]"> · {formatCategoryLabel(active.category)}</span>}
              </span>
              {autoplay && (
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={paused ? t.hero.play : t.hero.pause}
                  aria-pressed={paused}
                  className="link-underline shrink-0 text-xs font-semibold text-[var(--color-text-muted)]"
                >
                  {paused ? `▶ ${t.hero.playShort}` : `❚❚ ${t.hero.pauseShort}`}
                </button>
              )}
            </figcaption>
          </motion.figure>

          {count > 1 && (
            <div className="w-full max-w-[440px] lg:w-auto">
              <p className="hand mb-3 text-xl text-[var(--color-text-muted)] lg:hidden">{t.hero.latest}</p>
              <ol className="grid grid-cols-5 gap-3 lg:grid-cols-1 lg:gap-4 lg:pt-2">
                {slides.map((item, i) => {
                  const isActive = i === current;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`${t.hero.slide} ${i + 1}: ${item.title}`}
                        aria-current={isActive ? 'true' : undefined}
                        className={`polaroid block w-full lg:w-[72px] p-1 pb-1 transition-transform duration-300 hover:rotate-0 ${THUMB_TILT[i]} ${isActive ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-ink)]' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <span className="relative block aspect-square overflow-hidden bg-[var(--color-surface-2)]">
                          <Image src={item.src} alt="" fill sizes="80px" className="object-cover" />
                        </span>
                        <span className="mt-1 block h-[3px] overflow-hidden rounded-full bg-[var(--color-surface-2)]" aria-hidden="true">
                          {isActive &&
                            (autoplay ? (
                              <span
                                key={`${current}-${item.id}`}
                                onAnimationEnd={next}
                                className="hero-progress block h-full w-full origin-left bg-[var(--color-accent)]"
                                style={{ animationDuration: `${SLIDE_SECONDS}s`, animationPlayState: running ? 'running' : 'paused' }}
                              />
                            ) : (
                              <span className="block h-full w-full bg-[var(--color-accent)]" />
                            ))}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <DoodleSparkle className="hidden lg:block mx-auto mt-5 w-6 text-[var(--color-accent)] opacity-70" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
