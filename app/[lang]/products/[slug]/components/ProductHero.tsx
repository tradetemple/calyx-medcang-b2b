import { preload } from 'react-dom';
import ProductHeroClient from './ProductHeroClient';
import { MedicalProduct } from '@/types/medical-product';
import { StarRating } from '@/components/StarRating';
import { getCdnUrl } from '@/app/[lang]/utils/image-cdn';
import DynamicPrice from '@/components/DynamicPrice';

interface ProductHeroProps {
  product: MedicalProduct;
  translation?: {
    name?: string;
    description?: string;
    specifications?: string;
    slug?: string;
    descriptive_name?: string;
  };
  locale: string;
  t: any;
  price: number;
  siteUrl: string;
}

// Server Component for critical above-the-fold content
export default function ProductHero({
  product,
  translation,
  locale,
  t,
  price,
  siteUrl,
}: ProductHeroProps) {
  if (product.product_image) {
    // Generate the EXACT URLs that OptimizedProductImage uses to ensure a cache hit
    const url400 = getCdnUrl(product.product_image, { width: 400 });
    const url800 = getCdnUrl(product.product_image, { width: 800 });
    const url1200 = getCdnUrl(product.product_image, { width: 1200 });
    
    const srcSet = `${url400} 400w, ${url800} 800w, ${url1200} 1200w`;
    const sizes = "(max-width: 768px) 100vw, 50vw";

    preload(url1200, { 
      as: 'image', 
      fetchPriority: 'high',
      imageSrcSet: srcSet,
      imageSizes: sizes
    });
  }

  const displayName = translation?.name || product.name;

  // Parse additional images for the hero section
  let additionalImages: string[] = [];
  const rawAdditionalImages: any = (product as any).additional_images;
  if (rawAdditionalImages) {
    if (typeof rawAdditionalImages === 'string') {
      try {
        const parsed = JSON.parse(rawAdditionalImages);
        if (Array.isArray(parsed)) {
          additionalImages = parsed;
        }
      } catch { }
    } else if (Array.isArray(rawAdditionalImages)) {
      additionalImages = rawAdditionalImages;
    }
  }

  const heroDict = {
    common: {
      images: {
        noMedia: t.common.images.noMedia
      },
      product: t.common.product
    },
    productDetail: t.productDetail,
    mobileMenu: {
      close: t.navigation.mobileMenu.close
    }
  };

  return (
    <>
      {/* Image Gallery - Both Mobile and Desktop (appears first on mobile) */}
      <div className="relative w-full mb-2 md:mb-6 lg:mb-0 flex justify-center bg-transparent" style={{ aspectRatio: '1 / 1.15' }}>
        
        {/* Static LCP image - ALWAYS visible, no z-index competition */}
        {product.product_image && (
          <img 
            src={getCdnUrl(product.product_image, { width: 800 })}
            srcSet={`${getCdnUrl(product.product_image, { width: 400 })} 400w, ${getCdnUrl(product.product_image, { width: 800 })} 800w, ${getCdnUrl(product.product_image, { width: 1200 })} 1200w`}
            sizes="(max-width: 768px) 100vw, 50vw"
            alt={translation?.name || product.name}
            fetchPriority="high"
            loading="eager"
            decoding="sync"
            width={800}
            height={880} 
            className="w-full h-full object-contain" 
          />
        )}
        
        {/* Interactive gallery overlays AFTER hydration */}
        <ProductHeroClient
          productId={product.id}
          mainImage={product.product_image || ''}
          additionalImages={additionalImages}
          t={heroDict}
        />
      </div>

      {/* Mobile: Show title (after image, but NO duplicated purchase section) */}
      <div className="lg:hidden md:space-y-6 px-2 pb-2 md:px-0">
        {/* Product Title */}
        <div>
          <h1 className="text-lg font-bold leading-tight md:mb-2">
            <span className="text-static-black leading-wide font-medium">
              <span className='font-bold tracking-wide'>{displayName}</span> - <span className='tracking-wide font-medium'>{translation?.descriptive_name || product.descriptive_name}</span>
            </span>
          </h1>

          {/* Star Rating Display */}
          {(product as any).review_count != null && (product as any).review_count > 0 && (product as any).average_rating != null && (
            <div className="my-[4px] md:mt-4">
              <StarRating 
                value={Math.round((product as any).average_rating)} 
                size="large"
                showCount={true}
                count={(product as any).review_count}
                reviewsLink="#reviews"
              />
            </div>
          )}

          <div className="mt-3 flex flex-col gap-1">
            
            <div className='inline-flex gap-2 items-center'>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold bg-status-error py-1 px-3 text-static-white uppercase tracking-wide">
                    <DynamicPrice basePrice={price} lang={locale} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
