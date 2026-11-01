'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { formatCategoryLabel } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Segundos que se ve cada foto antes de pasar a la siguiente. */
const SLIDE_SECONDS = 6.5;

/** Portada: una foto a toda pantalla que va pasando sola entre las cinco más
 * recientes, con barras de progreso arriba como las historias de Instagram y
 * el texto encima, abajo. Al tocar la foto se abre en grande. El pase se
 * detiene con el ratón encima, con el botón de pausa y con "reducir
 * movimiento" activado (entonces solo se cambia de foto a mano). */
export function Hero({
  t,
  photos,
  photoCount,
  universeCount,
  loading,
  onOpenItem,
}: {
  t: HomeContent;
  /** Las fotos más recientes de la galería (se usan las cinco primeras). */
  photos: FeedItem[];
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

  // El avance lo marca el final de la animación de la barra activa: así la
  // barra y el cambio de foto nunca se desincronizan al pausar y reanudar.
  const next = () => setIndex((i) => (i + 1) % Math.max(count, 1));

  return (
    <section id="top" className="px-3 sm:px-6 pt-2 sm:pt-4 pb-14 md:pb-20">
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative mx-auto max-w-[1600px] h-[min(84svh,860px)] min-h-[520px] overflow-hidden rounded-[1.75rem] bg-[var(--color-dark)]"
      >
        {count === 0 ? (
          <span className="absolute inset-0 animate-shimmer opacity-60" aria-hidden="true" />
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
                className={`absolute inset-0 cursor-zoom-in transition-opacity duration-1000 ease-out ${isActive ? 'z-[1] opacity-100' : 'pointer-events-none opacity-0'}`}
              >
                <Image
                  src={item.src}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1600px) 100vw, 1600px"
                  className={`object-cover transition-transform duration-[8000ms] ease-out ${reduceMotion || isActive ? 'scale-100' : 'scale-[1.06]'}`}
                />
              </button>
            );
          })
        )}

        {/* Degradados para que el texto y las barras se lean sobre cualquier foto */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-28 bg-gradient-to-b from-black/45 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[75%] bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {count > 1 && (
          <div className="absolute inset-x-4 sm:inset-x-6 top-3 sm:top-4 z-[3] flex items-center gap-3">
            <div className="flex flex-1 gap-1.5">
              {slides.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${t.hero.slide} ${i + 1} / ${count}`}
                  aria-current={i === current ? 'true' : undefined}
                  className="group flex h-7 flex-1 items-center"
                >
                  <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/30 group-hover:bg-white/45 transition-colors">
                    {i === current && autoplay ? (
                      <span
                        key={`${current}-${item.id}`}
                        onAnimationEnd={next}
                        className="hero-progress block h-full w-full origin-left rounded-full bg-white"
                        style={{ animationDuration: `${SLIDE_SECONDS}s`, animationPlayState: running ? 'running' : 'paused' }}
                      />
                    ) : (
                      <span className={`block h-full w-full origin-left rounded-full bg-white ${i < current || (i === current && !autoplay) ? 'scale-x-100' : 'scale-x-0'}`} />
                    )}
                  </span>
                </button>
              ))}
            </div>
            {autoplay && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? t.hero.play : t.hero.pause}
                aria-pressed={paused}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              >
                {paused ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" /></svg>
                )}
              </button>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] grid gap-6 p-5 sm:p-8 md:p-12 md:grid-cols-[1fr_auto] md:items-end">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            <p className="label-caps text-white/75">{t.hero.badge} · @iantadventurer</p>
            <h1 className="mt-3 font-display font-bold leading-[0.92] tracking-[-0.045em] text-[clamp(3rem,8vw,6.5rem)] text-white">
              {t.hero.display[0]} <span className="text-[#c3d1ee]">{t.hero.display[1]}.</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed text-white/80">{t.hero.description}</p>
            <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
              <Button href="#gallery" variant="onPhoto">
                {t.hero.btnExplore} ↓
              </Button>
              <Button href="/comunidad" variant="glass">
                {t.nav.community} →
              </Button>
            </div>
          </motion.div>

          {active && (
            <div className="hidden md:flex flex-col items-end gap-1.5 text-right">
              {active.category && <p className="label-caps text-white/65">{formatCategoryLabel(active.category)}</p>}
              <p className="max-w-xs text-sm font-semibold leading-snug text-white line-clamp-2">{active.title}</p>
              <p className="label-caps mt-2 text-white/55" aria-busy={loading}>
                {loading ? '—' : photoCount} {t.hero.stat1} · {loading ? '—' : universeCount} {t.hero.stat2}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
