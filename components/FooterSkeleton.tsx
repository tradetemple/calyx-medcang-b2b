export default function FooterSkeleton() {
  return (
    <footer className="bg-bg-main border-t border-text-main/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Newsletter skeleton */}
        <div className="bg-text-main/10 rounded-3xl p-6 md:p-8 mb-8 animate-pulse">
          <div className="h-20 md:h-24" />
        </div>
        
        {/* Top row skeleton */}
        <div className="flex md:flex-row justify-between items-start mb-8">
          <div className="mb-6 md:mb-0">
            <div className="w-40 h-12 bg-text-main/10 animate-pulse rounded mb-2" />
            <div className="w-64 h-4 bg-text-main/10 animate-pulse rounded mb-2" />
            <div className="w-48 h-4 bg-text-main/10 animate-pulse rounded" />
          </div>
          <div className="hidden sm:block">
            <div className="w-32 h-10 bg-text-main/10 animate-pulse rounded" />
          </div>
        </div>
      </div>
      
      {/* Middle section skeleton */}
      <div className="bg-text-main/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="w-24 h-6 bg-text-main/10 animate-pulse rounded mb-4" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-20 h-4 bg-text-main/10 animate-pulse rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom section skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-text-main/10 animate-pulse rounded" />
            ))}
          </div>
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-text-main/10 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}