// stores/reviewStore.js
import { create } from 'zustand';

export const useReviewStore = create((set, get) => ({
  // State
  reviews: [],
  isLoading: false,
  error: null,
  pagination: {
    totalReviews: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10
  },

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  getProductReviews: async (productId, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/reviews/${productId}?page=${page}&limit=${limit}`);
      set({ 
        reviews: response.data.reviews,
        pagination: response.data.pagination,
        error: null 
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch reviews';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  addReview: async (productId, reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/api/reviews/${productId}`, reviewData);
      // Add to local state
      set(state => ({
        reviews: [response.data.review, ...state.reviews],
        error: null
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add review';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateReview: async (reviewId, reviewData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
      // Update in local state
      set(state => ({
        reviews: state.reviews.map(review =>
          review._id === reviewId ? response.data.review : review
        ),
        error: null
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update review';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteReview: async (reviewId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/api/reviews/${reviewId}`);
      // Remove from local state
      set(state => ({
        reviews: state.reviews.filter(review => review._id !== reviewId),
        error: null
      }));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete review';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));