'use client'

import { useB2BCartStore } from '@/stores/optimized-cart-store'
import { useAuditStore } from '@/stores/useAuditStore'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import DynamicPrice from '@/components/DynamicPrice'
import { AddToCartButtonProps } from '@/types/cart'

export default function AddToCartButton({
  productId,
  moqGrams,
  defaultQuantity = 50,
  t,
  disabled = false,
  product,
  locale,
  price,
  selectedVariantImage,
}: AddToCartButtonProps) {

  const addItemToCart = useB2BCartStore(state => state.addItem)
  const openSidebar = useB2BCartStore(state => state.openSidebar)
  const addAuditLog = useAuditStore(state => state.addLog)
  
  const [isAdding, setIsAdding] = useState(false);

  const isValidQty = () => defaultQuantity >= moqGrams;

  const buttonDisplayText = (
    <>
      {t?.productDetail?.cart?.addToCart || 'Add to Manifest'}{' '}
      <span className="md:hidden ml-1">
        (<DynamicPrice basePrice={price || 0} lang={locale || 'en'} />)
      </span>
    </>
  );

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isValidQty()) {
      toast.error(`Minimum order quantity is ${moqGrams}g`);
      return;
    }

    if (isAdding) return;
    setIsAdding(true);

    try {
      const imageUrl = selectedVariantImage || product?.product_image || null;
      
      const productSnapshot = {
        id: productId,
        name: product?.name || 'Unknown Strain',
        descriptive_name: product?.descriptive_name || '',
        slug: product?.slug || 'unknown-strain',
        product_image: imageUrl,
        price_chart: product?.price_chart,
        moq_grams: moqGrams,
        test_results: product?.test_results,
        category: product?.category || 'Flower',
        status: product?.status || 'active'
      };
      
      addItemToCart(productSnapshot, defaultQuantity);
      
      addAuditLog('PROCUREMENT_ADD', `Added ${defaultQuantity}g of ${productSnapshot.name} to manifest`, 'SUCCESS');

      openSidebar();
      toast.success(t?.addedToCart || 'Manifest Updated');
    } catch (err) {
      console.error('Error updating manifest:', err);
      toast.error('Failed to add batch to manifest.');
    } finally {
      setIsAdding(false);
    }
  };

  return (    
    <div className="space-y-1 md:space-y-2 w-full">
      <Button
        type="button"
        onClick={handleAdd}
        disabled={disabled || isAdding || !isValidQty()}
        className="w-full h-12 rounded-none font-mono text-xs md:text-sm uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-colors"
      >
        {isAdding ? 'Updating Manifest...' : buttonDisplayText}
      </Button>
    </div>
  );
}