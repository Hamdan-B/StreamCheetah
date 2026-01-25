export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
    />
  );
}

export function LoadingSkeleton({
  className = "",
  count = 1,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-shimmer rounded-lg ${className}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </>
  );
}

export function LoadingCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <LoadingSkeleton className="h-40 w-full" />
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
