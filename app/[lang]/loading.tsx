export default function Loading() {
  return (
    <div className="bg-bg-main min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="relative h-[100vh] max-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-white" />
        
        <div className="relative z-20 max-w-7xl mx-auto text-center px-4">
          <div className="flex sm:flex-row gap-8 justify-center items-center">
            <div className="h-6 w-6 bg-bg-secondary/20 animate-pulse rounded-full"></div>
            <div className="h-6 w-6 bg-bg-secondary/20 animate-pulse rounded-full"></div>
            <div className="h-6 w-6 bg-bg-secondary/20 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}