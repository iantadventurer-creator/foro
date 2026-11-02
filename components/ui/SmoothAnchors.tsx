'use client';

import { useEffect } from 'react';

/** Quita el "#seccion" de la dirección: devuelve la URL sin el fragmento. */
function cleanUrl() {
  window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
}

/** Lleva a la sección `id` ("top" o vacío = principio de la página). Devuelve
 * false si no existe en esta página, para dejar que el enlace actúe normal. */
function scrollToSection(id: string, smooth: boolean) {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
  if (id === '' || id === 'top') {
    window.scrollTo({ top: 0, behavior });
    return true;
  }
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ behavior, block: 'start' });
  // Para el enlace "Saltar al contenido": el foco va al destino, como haría el ancla.
  if (target.tabIndex >= 0 || target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  return true;
}

// Enlaces internos sin "#" en la URL: los enlaces a secciones de la misma
// página (#gallery, #about, #top...) hacen scroll suave sin cambiar la
// dirección, así la barra del navegador queda limpia (iantbuild.vercel.app)
// y se puede copiar y compartir tal cual. Si se entra con un enlace antiguo
// que trae "#seccion", se va a esa sección y luego se limpia la dirección.
export function SmoothAnchors() {
  useEffect(() => {
    const prefersSmooth = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function handleClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute('href')!.slice(1));
      if (!scrollToSection(id, prefersSmooth())) return;
      e.preventDefault();
      if (window.location.hash) cleanUrl();
    }

    document.addEventListener('click', handleClick);

    if (window.location.hash) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      // Espera un fotograma para que la página haya pintado sus secciones.
      requestAnimationFrame(() => {
        scrollToSection(id, false);
        cleanUrl();
      });
    }

    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
