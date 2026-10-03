import type { Variants } from 'framer-motion';

/** Aparición suave de abajo hacia arriba, compartida por las secciones de la portada. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};
