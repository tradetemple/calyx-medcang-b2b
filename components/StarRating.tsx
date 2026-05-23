import { Star } from 'lucide-react';
import Link from 'next/link';

// Utility function for conditional class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// StarRating component matching ReviewSection style
export function StarRating({
  value,
  size = 'small',
  showCount = false,
  count = 0,
  reviewsLink
}: {
  value: number;
  size?: 'small' | 'default' | 'large';
  showCount?: boolean;
  count?: number;
  reviewsLink?: string; // Optional link to reviews section
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  // Responsive size map: [mobile, desktop]
  const sizeMap = {
    small: { mobile: 12, desktop: 16 },
    default: { mobile: 16, desktop: 20 },
    large: { mobile: 16, desktop: 22 }
  };

  return (
    <div className="flex items-center gap-1" aria-label={`${value} out of 5 stars`} role="img">
      <div className="flex items-center">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled
            className={cn(
              'flex items-center justify-center cursor-default',
              star <= value
                ? 'text-static-black opacity-100'
                : 'text-static-black opacity-20'
            )}
            aria-label={`${star} stars`}
          >
            <Star 
              size={sizeMap[size].mobile}
              className="fill-current stroke-none md:hidden" 
              strokeLinejoin="miter" 
              strokeLinecap="square" 
            />
            <Star 
              size={sizeMap[size].desktop}
              className="fill-current stroke-none hidden md:block" 
              strokeLinejoin="miter" 
              strokeLinecap="square" 
            />
          </button>
        ))}
      </div>
      {showCount && count > 0 && (
        reviewsLink ? (
          <Link 
            href={reviewsLink}
            className="text-[10px] md:text-xs text-text-main/70 hover:text-secondary hover:underline transition-colors"
            aria-label={`Read ${count} reviews`}
          >
            ({count})
          </Link>
        ) : (
          <span className="text-[10px] md:text-xs text-text-main/70">
            ({count})
          </span>
        )
      )}
    </div>
  );
}
