'use client'

import { useEffect } from 'react'
import { useB2BCartStore } from '@/stores/optimized-cart-store'
import { useUserRoleStore } from '@/stores/userRoleStore'
import { setUserRoleAction, clearUserRoleAction } from '@/lib/actions/auth'

export default function StoreHydration() {
  useEffect(() => {
    useUserRoleStore.persist.rehydrate();

    const syncServerState = async () => {
      const { userRole } = useUserRoleStore.getState();
      if (userRole && userRole !== 'guest') {
        await setUserRoleAction(userRole).catch(console.error);
      }
    };
    
    syncServerState();

    if (window.location.search.includes('clear_cart_data=true')) {
      useB2BCartStore.getState().clearCart();
      useUserRoleStore.getState().clearUserRole();
      clearUserRoleAction().catch(console.error);
      
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('clear_cart_data');
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, []);

  return null;
}