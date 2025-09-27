// stores/cartStore.js
import { create } from 'zustand';

export const useCartStore = create(
    (set, get) => ({
      // State
      cart: null,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      getCart: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/api/cart/${userId}`);
          set({ cart: response.data, error: null });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to fetch cart';
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      addToCart: async (userId, productId, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(`/api/cart/${userId}/add`, {
            productId,
            quantity
          });
          set({ cart: response.data, error: null });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to add to cart';
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartItem: async (userId, productId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/api/cart/${userId}/update/${productId}`, {
            quantity
          });
          set({ cart: response.data, error: null });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to update cart';
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (userId, productId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.delete(`/api/cart/${userId}/remove/${productId}`);
          set({ cart: response.data, error: null });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to remove from cart';
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.delete(`/api/cart/${userId}/clear`);
          set({ cart: response.data.cart, error: null });
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to clear cart';
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null })
    }),
   
);