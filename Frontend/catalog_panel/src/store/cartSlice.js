import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [], // Массив объектов { product, quantity }
    },
    reducers: {
        addToCart: (state, action) => {
            const { product } = action.payload;
            const existingItem = state.items.find(item => item.product.tag === product.tag);
            if (existingItem) {
                existingItem.quantity += 1; // Увеличиваем количество, если товар уже есть
            } else {
                state.items.push({ product, quantity: 1 }); // Добавляем новый товар
            }
        },
        removeFromCart: (state, action) => {
            const productTag = action.payload;
            state.items = state.items.filter(item => item.product.tag !== productTag);
        },
        updateQuantity: (state, action) => {
            const { productTag, quantity } = action.payload;
            const item = state.items.find(item => item.product.tag === productTag);
            if (item) {
                item.quantity = quantity > 0 ? quantity : 1; // Не допускаем количество меньше 1
            }
        },
        clearCart: (state) => {
            state.items = [];
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;