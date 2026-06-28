import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload || [];
    },
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.items.findIndex(item => item.product_id === newItem.product_id);
      if (existingItemIndex >= 0) {
        state.items.items[existingItemIndex].quantity += (newItem.quantity || 1);
      } else {
        state.items.items.push(newItem);
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.items.filter(item => item.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCart, addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
