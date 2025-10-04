import { create } from 'zustand'
import api from '../lib/axios.js'

export const useProductStore = create((set, get) => ({
  // State
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  totalProducts: 0,
  filters: {
    name: '',
    categories: '',
    minPrice: '',
    maxPrice: '',
    tags: '',
    page: 1,
    limit: 10,
    sort: ''
  },

  // Helpers
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => set({ filters: { ...get().filters, ...newFilters } }),
  clearError: () => set({ error: null }),
  clearCurrentProduct: () => set({ currentProduct: null }),

  // Fetch list
  getProducts: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const currentFilters = { ...get().filters, ...filters }
      const params = new URLSearchParams()
      Object.keys(currentFilters).forEach((key) => {
        if (currentFilters[key]) params.append(key, currentFilters[key])
      })

      const response = await api.get(`/api/products?${params}`)
      set({
        products: response.data.products || [],
        totalProducts: response.data.total || 0,
        filters: currentFilters,
        error: null,
      })
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch products'
      set({ error: message })
      throw new Error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  // Fetch one
  getProductById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get(`/api/products/${id}`)
      set({ currentProduct: response.data.product || null, error: null })
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch product'
      set({ error: message })
      throw new Error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  // Create
  createProduct: async (productData) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      Object.keys(productData).forEach((key) => {
        if (key === 'images' && Array.isArray(productData.images)) {
          productData.images.forEach((file) => formData.append('images', file))
        } else if (key === 'tags' && Array.isArray(productData.tags)) {
          formData.append('tags', productData.tags.join(','))
        } else if (
          productData[key] !== undefined && productData[key] !== null && productData[key] !== ''
        ) {
          formData.append(key, productData[key])
        }
      })

      const response = await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create product'
      set({ error: message })
      throw new Error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  // Update
  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      Object.keys(productData).forEach((key) => {
        if (key === 'images' && Array.isArray(productData.images)) {
          productData.images.forEach((file) => {
            if (file instanceof File) formData.append('images', file)
          })
        } else if (key === 'tags' && Array.isArray(productData.tags)) {
          formData.append('tags', productData.tags.join(','))
        } else if (
          productData[key] !== undefined && productData[key] !== null && productData[key] !== ''
        ) {
          formData.append(key, productData[key])
        }
      })

      const response = await api.patch(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update product'
      set({ error: message })
      throw new Error(message)
    } finally {
      set({ isLoading: false })
    }
  },

  // Delete
  deleteProduct: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.delete(`/api/products/${id}`)
      set((state) => ({ products: state.products.filter((p) => p._id !== id && p.id !== id) }))
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete product'
      set({ error: message })
      throw new Error(message)
    } finally {
      set({ isLoading: false })
    }
  },
}))

export default useProductStore







