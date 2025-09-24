// stores/contactStore.js
import { create } from 'zustand';

export const useContactStore = create((set, get) => ({
  // State
  isLoading: false,
  error: null,
  success: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  submitContactForm: async (formData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post('/api/contact', formData);
      set({ success: true, error: null });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit form';
      set({ error: message, success: false });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: false })
}));