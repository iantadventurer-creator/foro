/** Cuadrícula de miniaturas "cargando" (feed y perfil). */
export function PostGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-square animate-shimmer" />
      ))}
    </div>
  );
}

/** Lista de filas "cargando" (actividad). */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-16 rounded-xl animate-shimmer" />
      ))}
    </div>
  );
}
