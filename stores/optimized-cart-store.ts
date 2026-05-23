import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MedicalProductSchema } from '@/types/medical-product'
import { CartItem, CartItemSchema } from '@/types/cart'

export type { CartItem }
export { CartItemSchema }

interface CartState {
  items: CartItem[]
  isSidebarOpen: boolean
  addItem: (product: unknown, quantityGrams: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantityGrams: number) => void
  clearCart: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

export const useB2BCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isSidebarOpen: false,

      addItem: (rawProduct, quantityGrams) => {
        // Gatekeeper: SafeParse on input
        const parsed = MedicalProductSchema.safeParse(rawProduct)
        if (!parsed.success) {
          console.error("Cart Schema Rejection:", parsed.error)
          return
        }
        
        const product = parsed.data

        set((state) => {
          const existingItem = state.items.find((i) => i.product.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantityGrams: i.quantityGrams + quantityGrams }
                  : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id: crypto.randomUUID(), // Native browser UUID
                product,
                quantityGrams,
                addedAt: Date.now(),
              },
            ],
          }
        })
      },

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      updateQuantity: (itemId, quantityGrams) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantityGrams } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
      openSidebar: () => set({ isSidebarOpen: true }),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: 'calyx-medical-cart',
    }
  )
)
