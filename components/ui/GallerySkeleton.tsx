const HEIGHTS = ['h-72', 'h-56', 'h-80', 'h-64', 'h-72', 'h-60', 'h-80', 'h-56', 'h-72'];

export function GallerySkeleton() {
    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]" aria-hidden="true">
            {HEIGHTS.map((h, i) => (
                <div
                    key={i}
                    className={`mb-6 break-inside-avoid rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden ${h}`}
                >
                    <div className="w-full h-full animate-shimmer" />
                </div>
            ))}
        </div>
    );
}
