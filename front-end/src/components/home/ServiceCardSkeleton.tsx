interface ServiceCardSkeletonProps {
  variant?: "default" | "featured" | "compact";
}

export default function ServiceCardSkeleton({ variant = "default" }: ServiceCardSkeletonProps) {
  if (variant === "featured") {
    return (
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-neutral-100 animate-pulse">
        {/* Image skeleton */}
        <div className="h-64 bg-neutral-200" />
        
        {/* Content skeleton */}
        <div className="p-6">
          <div className="w-20 h-6 bg-neutral-200 rounded-full mb-3" />
          <div className="w-3/4 h-6 bg-neutral-200 rounded mb-2" />
          <div className="w-full h-4 bg-neutral-200 rounded mb-1" />
          <div className="w-2/3 h-4 bg-neutral-200 rounded mb-4" />
          
          {/* Price skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-24 h-8 bg-neutral-200 rounded" />
            <div className="w-20 h-6 bg-neutral-200 rounded" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex justify-between mb-4">
            <div className="w-16 h-4 bg-neutral-200 rounded" />
            <div className="w-20 h-4 bg-neutral-200 rounded" />
          </div>
          
          {/* Button skeleton */}
          <div className="w-full h-12 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-neutral-100 animate-pulse">
        {/* Image skeleton */}
        <div className="h-40 bg-neutral-200" />
        
        {/* Content skeleton */}
        <div className="p-4">
          <div className="w-3/4 h-5 bg-neutral-200 rounded mb-2" />
          <div className="w-full h-4 bg-neutral-200 rounded mb-1" />
          <div className="w-2/3 h-4 bg-neutral-200 rounded mb-3" />
          
          {/* Price skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-20 h-6 bg-neutral-200 rounded" />
            <div className="w-16 h-4 bg-neutral-200 rounded" />
          </div>
          
          {/* Stats skeleton */}
          <div className="flex justify-between">
            <div className="w-12 h-3 bg-neutral-200 rounded" />
            <div className="w-16 h-3 bg-neutral-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-neutral-100 animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 bg-neutral-200" />
      
      {/* Content skeleton */}
      <div className="p-5">
        <div className="w-16 h-5 bg-neutral-200 rounded-full mb-2" />
        <div className="w-3/4 h-5 bg-neutral-200 rounded mb-2" />
        <div className="w-full h-4 bg-neutral-200 rounded mb-1" />
        <div className="w-2/3 h-4 bg-neutral-200 rounded mb-3" />
        
        {/* Price skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-20 h-6 bg-neutral-200 rounded" />
          <div className="w-16 h-4 bg-neutral-200 rounded" />
        </div>
        
        {/* Stats skeleton */}
        <div className="flex justify-between mb-4">
          <div className="w-12 h-4 bg-neutral-200 rounded" />
          <div className="w-16 h-4 bg-neutral-200 rounded" />
        </div>
        
        {/* Button skeleton */}
        <div className="w-full h-10 bg-neutral-200 rounded-lg" />
      </div>
    </div>
  );
}