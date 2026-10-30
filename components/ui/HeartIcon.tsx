/** Corazón vectorial para los "me gusta" (relleno o solo contorno). */
export function HeartIcon({ filled = false, className = 'w-4 h-4' }: { filled?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21s-7.4-4.5-9.7-9.3C.8 8.5 2.8 4.5 6.6 4.5c2.2 0 3.9 1.2 5.4 3.1 1.5-1.9 3.2-3.1 5.4-3.1 3.8 0 5.8 4 4.3 7.2C19.4 16.5 12 21 12 21z" />
    </svg>
  );
}
