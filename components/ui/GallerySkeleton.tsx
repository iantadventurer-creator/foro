const HEIGHTS = ['h-72', 'h-56', 'h-80', 'h-64', 'h-72', 'h-60', 'h-80', 'h-56', 'h-72'];

export function GallerySkeleton() {
    return (
        <div className="columns-2 lg:columns-3 gap-4 sm:gap-8" aria-hidden="true">
            {HEIGHTS.map((h, i) => (
                <div key={i} className="mb-8 sm:mb-12 break-inside-avoid">
                    <div className={`w-full rounded-2xl animate-shimmer ${h}`} />
                    <div className="mt-3 h-3 w-2/3 rounded-full animate-shimmer" />
                </div>
            ))}
        </div>
    );
}
