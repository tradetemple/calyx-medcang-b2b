'use client'

import { useEffect } from 'react'
import { useB2BCartStore } from '@/stores/optimized-cart-store'
import { useUserRoleStore } from '@/stores/userRoleStore'
import { setUserRoleAction, clearUserRoleAction } from '@/lib/actions/auth'

export default function StoreHydration() {
  useEffect(() => {
    // 1. Manually rehydrate the Zustand store from localStorage
    useUserRoleStore.persist.rehydrate();

    // 2. Synchronize localStorage state with the Next.js Server Cookie
    // This bridges the gap if the user refreshes and the cookie was lost/out-of-sync
    const syncServerState = async () => {
      const { userRole } = useUserRoleStore.getState();
      if (userRole && userRole !== 'guest') {
        await setUserRoleAction(userRole).catch(console.error);
      }
    };
    
    syncServerState();

    // 3. Handle specific URL cleanup commands (e.g., Logging out)
    if (window.location.search.includes('clear_cart_data=true')) {
      useB2BCartStore.getState().clearCart();
      useUserRoleStore.getState().clearUserRole(); // Clear Zustand
      clearUserRoleAction().catch(console.error);  // Clear Server Cookie
      
      // Clean up the URL for a polished demo experience
      if (window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('clear_cart_data');
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, []);

  return null; // Invisible global worker component
}