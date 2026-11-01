import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantSku: string;
  title: string;
  brand: string;
  color?: string;
  size?: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantSku: string) => void;
  updateQuantity: (variantSku: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addItem: (newItem) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.variantSku === newItem.variantSku);

        if (existingIndex > -1) {
          // If already in cart, increment quantity if stock allows
          const currentQty = items[existingIndex].quantity;
          if (currentQty < newItem.stock) {
            const updatedItems = [...items];
            updatedItems[existingIndex].quantity += 1;
            set({ items: updatedItems, isDrawerOpen: true });
          }
        } else {
          // Add new item with quantity = 1
          set({
            items: [...items, { ...newItem, quantity: 1 }],
            isDrawerOpen: true, // Automatically open cart drawer to delight user
          });
        }
      },

      removeItem: (variantSku) => {
        set({ items: get().items.filter((i) => i.variantSku !== variantSku) });
      },

      updateQuantity: (variantSku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantSku);
          return;
        }

        const updated = get().items.map((i) => {
          if (i.variantSku === variantSku) {
            const finalQty = Math.min(quantity, i.stock);
            return { ...i, quantity: finalQty };
          }
          return i;
        });

        set({ items: updated });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((total, i) => total + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, i) => total + i.price * i.quantity, 0),
    }),
    {
      name: "ecommerce-cart-storage", // Key in browser localStorage
    }
  )
);
