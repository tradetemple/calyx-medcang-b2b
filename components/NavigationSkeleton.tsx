export default function NavigationSkeleton() {
  return (
    <nav className="sticky top-0 w-full z-[100]">
      <div className="w-full mx-auto">
        <div className="bg-bg-main/60 backdrop-blur-xl border-b border-text-main/5">
          <div className="relative flex h-16 md:h-20 items-center justify-between px-6">
            {/* Mobile menu skeleton */}
            <div className="md:hidden">
              <div className="w-6 h-6 bg-text-main/10 animate-pulse rounded" />
            </div>
            
            {/* Logo skeleton */}
            <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-8 bg-text-main/10 animate-pulse rounded" />
            </div>
            
            {/* Cart skeleton */}
            <div className="w-6 h-6 bg-text-main/10 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </nav>
  );
}