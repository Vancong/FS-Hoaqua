import { createSlice } from '@reduxjs/toolkit';
import getDiscountPrice from '../../utils/getDiscountPrice';

const initialState = {
  items: [],
  totalPrice: 0,
  total: 0,
  appliedVoucher: null,
};

const updateTotals = (state) => {
  state.total = state.items.reduce((sum, item) => sum + item.quantity, 0);
  state.totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
};

const CartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = (action.payload?.items || []).map((item) => {
        const discountPrice = getDiscountPrice(
          item.price,
          item.product?.discount || 0
        );
        return { ...item, price: discountPrice };
      });
      updateTotals(state);
    },
    addToCart: (state, action) => {
      const { product, quantity, price } = action.payload;
      const basePrice = product.price || price || 0;
      const discountPrice = getDiscountPrice(basePrice, product.discount || 0);
      const checkItem = state.items.find(
        (item) => item.product._id === product._id
      );

      if (checkItem) {
        checkItem.quantity += quantity;
      } else {
        state.items.push({ product, quantity, price: discountPrice });
      }
      updateTotals(state);
    },

    increaseQuantity: (state, action) => {
      const { productId } = action.payload;
      const item = state.items.find((item) => item.product._id === productId);
      if (item) {
        item.quantity += 1;
      }
      updateTotals(state);
    },

    decreaseQuantity: (state, action) => {
      const { productId } = action.payload;
      const item = state.items.find((item) => item.product._id === productId);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
      updateTotals(state);
    },

    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item.product._id === productId);
      if (item) {
        item.quantity = Number(quantity);
      }
      updateTotals(state);
    },
    removeCart: (state, action) => {
      const { productId } = action.payload;
      state.items = state.items.filter(
        (item) => item.product._id !== productId
      );
      updateTotals(state);
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.totalPrice = 0;
      state.appliedVoucher = null;
    },

    applyVoucher: (state, action) => {
      state.appliedVoucher = action.payload;
    },

    removeVoucher: (state) => {
      state.appliedVoucher = null;
    },
  },
});

export const {
  addToCart,
  removeCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  clearCart,
  setCart,
  applyVoucher,
  removeVoucher,
} = CartSlice.actions;
export default CartSlice.reducer;
