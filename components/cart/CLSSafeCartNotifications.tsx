'use client'


export function CLSSafeCartBadge({ 
  count, 
  className = '',
  size = 'md' 
}: { 
  count: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-4 w-4 md:h-5 md:w-5 text-[10px] md:text-xs',
    lg: 'h-6 w-6 text-sm'
  }

  return (
    <span 
      className={`
        absolute -top-1 -right-1 
        ${sizeClasses[size]}
        bg-static-black text-static-white font-bold rounded-full 
        flex items-center justify-center
        transition-all duration-200 ease-out
        ${count > 0 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        ${className}
      `}
      aria-label={count > 0 ? `${count} items in cart` : 'Cart is empty'}
    >
      {count > 0 && (
        <span className="leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </span>
  )
}
