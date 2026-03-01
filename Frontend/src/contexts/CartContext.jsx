import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import api from '../lib/axios'
import useAuthStore from '../store/authStore'

const CartContext = createContext()

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload
      }
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => (item.id || item._id) === (action.payload.id || action.payload._id))
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            (item.id || item._id) === (action.payload.id || action.payload._id)
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => (item.id || item._id) !== action.payload)
      }

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          (item.id || item._id) === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }

    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    default:
      return state
  }
}

const initialState = {
  items: [],
  isLoading: true // Initial load state
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthStore()

  // helper to normalize backend items to frontend structure
  const normalizeCart = (backendCart) => {
    if (!backendCart || !backendCart.products) return []
    return backendCart.products
      .filter(item => item.product !== null) // Safety check for deleted products
      .map(item => {
        let price = item.product.price
        if (typeof price === 'string') {
          price = parseFloat(price.replace('₹', '').replace(/,/g, ''))
        }
        return {
          ...item.product,
          id: item.product._id, // ensure id is available
          quantity: item.quantity,
          price: price // ensure it's a number
        }
      })
  }

  // Fetch cart from API
  const fetchDBCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      console.log("🛒 Fetching cart from database...")
      const response = await api.get('/api/cart/')
      const normalizedItems = normalizeCart(response.data)
      dispatch({ type: 'SET_ITEMS', payload: normalizedItems })
      console.log("🛒 DB Cart loaded:", normalizedItems.length, "items")
    } catch (error) {
      console.error('Error fetching cart from DB:', error)
      if (error.response?.status === 404) {
        dispatch({ type: 'SET_ITEMS', payload: [] })
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Initial load - wait for auth check to finish
  useEffect(() => {
    if (isAuthLoading) return; // Wait for checkAuth() to finish

    const loadInitialCart = async () => {
      if (isAuthenticated) {
        await fetchDBCart()
      } else {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) })
        }
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    loadInitialCart()
  }, [isAuthenticated, isAuthLoading, fetchDBCart])

  // Sync Guest Cart to DB upon login
  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      const guestCartJson = localStorage.getItem('cart');
      const guestCart = JSON.parse(guestCartJson || '[]');

      if (guestCart.length > 0) {
        const syncCart = async () => {
          console.log("🔄 Syncing guest cart to database...");
          dispatch({ type: 'SET_LOADING', payload: true })
          for (const item of guestCart) {
            try {
              await api.post('/api/cart/add', {
                productId: item.id || item._id,
                quantity: item.quantity
              })
              console.log(`✅ Synced: ${item.name}`);
            } catch (err) {
              console.error('❌ Failed to sync guest item:', item.name, err)
            }
          }
          localStorage.removeItem('cart')
          await fetchDBCart()
        }
        syncCart()
      }
    }
  }, [isAuthenticated, isAuthLoading, fetchDBCart])

  // Save guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(state.items))
    }
  }, [state.items, isAuthenticated])

  const addToCart = async (product) => {
    console.log("🛒 addToCart triggered for:", product.name, "ID:", product.id || product._id);
    // Optimistic update
    dispatch({ type: 'ADD_TO_CART', payload: product })

    if (isAuthenticated) {
      try {
        const prodId = product.id || product._id;
        console.log("🔄 Syncing item to DB...", prodId);
        await api.post('/api/cart/add', { productId: prodId, quantity: 1 })
        console.log("✅ DB sync successful for:", product.name);
      } catch (error) {
        console.error('❌ Error adding to DB cart:', error)
      }
    } else {
      console.log("ℹ️ User not authenticated, saving to local storage only.");
    }
  }

  const removeFromCart = async (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId })

    if (isAuthenticated) {
      try {
        await api.delete(`/api/cart/remove/${productId}`)
      } catch (error) {
        console.error('Error removing from DB cart:', error)
      }
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } })

    if (isAuthenticated) {
      try {
        await api.put(`/api/cart/update/${productId}`, { quantity })
      } catch (error) {
        console.error('Error updating DB cart:', error)
      }
    }
  }

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' })

    if (isAuthenticated) {
      try {
        await api.delete('/api/cart/clear/')
      } catch (error) {
        console.error('Error clearing DB cart:', error)
      }
    }
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      let price = item.price
      if (typeof price === 'string') {
        price = parseFloat(price.replace('₹', '').replace(/,/g, ''))
      }
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const value = {
    cartItems: state.items,
    isCartLoading: state.isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    refreshCart: fetchDBCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
