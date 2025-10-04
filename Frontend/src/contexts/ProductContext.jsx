/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/axios'

const ProductContext = createContext()

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const normalizeProduct = (p) => {
    const firstImageUrl = Array.isArray(p.images) && p.images.length > 0 ? p.images[0].url : ''
    return {
      id: p._id || p.id,
      name: p.name,
      price: typeof p.price === 'number' ? `₹${p.price.toFixed(2)}` : p.price,
      originalPrice: typeof p.originalPrice === 'number' && p.originalPrice > 0 ? `₹${p.originalPrice.toFixed(2)}` : p.originalPrice || '',
      image: firstImageUrl,
      images: Array.isArray(p.images) ? p.images.map(img => img.url) : [],
      rating: p.ratings ?? 4.5,
      reviews: p.numReviews ?? 0,
      description: p.description,
      category: p.category,
      isOnSale: !!(p.originalPrice && p.originalPrice > p.price),
      stock: p.stock,
      status: 'active',
    }
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/api/products')
      const serverProducts = res.data?.products || []
      setProducts(serverProducts.map(normalizeProduct))
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const getActiveProducts = () => products.filter(p => p.status === 'active')
  const getProductById = (id) => products.find(p => p.id === id)

  // Delete product (admin)
  const deleteProduct = async (id) => {
    try {
      await api.delete(`/api/products/${id}`)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to delete product')
      throw e
    }
  }

  const value = {
    products,
    loading,
    error,
    getActiveProducts,
    getProductById,
    refetchProducts: fetchProducts,
    deleteProduct,
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
}

// no default export to avoid Fast Refresh error
