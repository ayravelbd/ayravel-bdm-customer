// lib/slices/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string;
  productId: string; // product ID
  name: string;
  brand?: string;
  image?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock?: number;
  selected: boolean;
  superDeal?: boolean;
  shopInfo?: string; // shop ID
  // New fields for specification system
  variantId?: string;
  selectedSpecs?: { [key: string]: string };
  sku?: string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      
      console.log('🛒 Cart Slice - Adding item:', {
        id: newItem.id,
        name: newItem.name,
        selectedSpecs: newItem.selectedSpecs,
        variantId: newItem.variantId,
        hasSpecs: newItem.selectedSpecs && Object.keys(newItem.selectedSpecs).length > 0
      });
      
      // Create unique ID based on product + variant + specs
      const uniqueId = newItem.variantId ? 
        `${newItem.id}-${newItem.variantId}` : 
        newItem.selectedSpecs ? 
          `${newItem.id}-${Object.values(newItem.selectedSpecs).join('-')}` : 
          newItem.id;
      
      const existingIndex = state.items.findIndex(
        (i) => {
          // Match by product ID and variant/specs
          if (newItem.variantId) {
            return i.id === newItem.id && i.variantId === newItem.variantId;
          }
          if (newItem.selectedSpecs) {
            return i.id === newItem.id && 
              JSON.stringify(i.selectedSpecs) === JSON.stringify(newItem.selectedSpecs);
          }
          return i.id === newItem.id && !i.variantId && !i.selectedSpecs;
        }
      );
      
      if (existingIndex >= 0) {
        // Increase quantity without exceeding stock
        const stock = state.items[existingIndex].stock;
        if (
          typeof stock === "number" &&
          state.items[existingIndex].quantity < stock
        ) {
          state.items[existingIndex].quantity += newItem.quantity;
          console.log('✅ Updated existing cart item quantity');
        }
      } else {
        // Add new item with unique ID
        const itemToAdd = { ...newItem, id: uniqueId };
        state.items.push(itemToAdd);
        console.log('✅ Added new cart item:', itemToAdd);
      }
      
      console.log('📋 Current cart items:', state.items.map(item => ({
        id: item.id,
        name: item.name,
        selectedSpecs: item.selectedSpecs,
        hasSpecs: item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0
      })));
    },

    toggleSelectItem: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) item.selected = !item.selected;
    },
    toggleSelectAll: (state, action: PayloadAction<boolean>) => {
      state.items.forEach((i) => (i.selected = action.payload));
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        const newQty = item.quantity + action.payload.quantity;
        item.quantity = newQty > 0 ? newQty : 1;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    // ✅ Remove a single item
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
  },
});

export const {
  addToCart,
  toggleSelectItem,
  toggleSelectAll,
  updateQuantity,
  clearCart,
  removeItem,
} = cartSlice.actions;

export default cartSlice.reducer;
