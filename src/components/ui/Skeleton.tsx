interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div
      className={`shimmer animate-pulse bg-surface-100 ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

/** Common skeleton patterns */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-surface-200/60 overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton variant="text" className="w-16 h-3" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-2/3 h-3" />
      </div>
    </div>
  );
}
