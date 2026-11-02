export function GallerySkeleton() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-8" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
                <div key={i}>
                    <div className="w-full aspect-[4/5] animate-shimmer" />
                    <div className="mt-2 h-3 w-2/3 animate-shimmer" />
                </div>
            ))}
        </div>
    );
}
