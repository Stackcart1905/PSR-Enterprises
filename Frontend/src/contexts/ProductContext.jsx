import React, { createContext, useContext, useState, useEffect } from 'react'

const ProductContext = createContext()

const initialProducts = [
  {
    id: 1,
    name: "Premium Almonds",
    price: "₹2,499.99",
    originalPrice: "₹2,999.99",
    image: "🥜",
    rating: 4.8,
    reviews: 124,
    description: "Premium California almonds, rich in protein and healthy fats",
    category: "Nuts",
    isOnSale: true,
    stock: 50,
    status: 'active'
  },
  {
    id: 2,
    name: "Dried Apricots",
    price: "₹1,999.99",
    originalPrice: null,
    image: "🍑",
    rating: 4.9,
    reviews: 89,
    description: "Sun-dried Turkish apricots, naturally sweet and nutritious",
    category: "Dried Fruits",
    isOnSale: false,
    stock: 35,
    status: 'active'
  },
  {
    id: 3,
    name: "Mixed Berries",
    price: "₹3,299.99",
    originalPrice: "₹3,699.99",
    image: "🫐",
    rating: 4.7,
    reviews: 156,
    description: "Antioxidant-rich mix of blueberries, cranberries, and goji berries",
    category: "Berries",
    isOnSale: true,
    stock: 42,
    status: 'active'
  },
  {
    id: 4,
    name: "Cashew Nuts",
    price: "₹2,899.99",
    originalPrice: null,
    image: "🥜",
    rating: 4.8,
    reviews: 203,
    description: "Creamy and buttery cashews from premium Indian farms",
    category: "Nuts",
    isOnSale: false,
    stock: 30,
    status: 'active'
  },
  {
    id: 5,
    name: "Dates (Medjool)",
    price: "₹2,299.99",
    originalPrice: "₹2,599.99",
    image: "🫒",
    rating: 4.9,
    reviews: 167,
    description: "Large, soft Medjool dates - nature's candy with sweet flavour",
    category: "Dates",
    isOnSale: true,
    stock: 25,
    status: 'active'
  },
  {
    id: 6,
    name: "Walnuts",
    price: "₹2,600.99",
    originalPrice: null,
    image: "🌰",
    rating: 4.6,
    reviews: 98,
    description: "Brain-healthy walnuts packed with omega-3 fatty acids",
    category: "Nuts",
    isOnSale: false,
    stock: 40,
    status: 'active'
  },
  {
    id: 7,
    name: "Dried Mango",
    price: "₹1,800.99",
    originalPrice: "₹2,100.99",
    image: "🥭",
    rating: 4.7,
    reviews: 134,
    description: "Sweet and chewy dried mango slices from tropical farms",
    category: "Dried Fruits",
    isOnSale: true,
    stock: 28,
    status: 'active'
  },
  {
    id: 8,
    name: "Pistachios",
    price: "₹3,400.99",
    originalPrice: null,
    image: "🥜",
    rating: 4.8,
    reviews: 176,
    description: "Roasted and salted pistachios with rich, nutty flavor",
    category: "Nuts",
    isOnSale: false,
    stock: 22,
    status: 'active'
  }
]

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts)

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products')
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    }
  }, [])

  // Save products to localStorage whenever products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products))
  }, [products])

  const addProduct = (newProduct) => {
    const product = {
      ...newProduct,
      id: Date.now(),
      status: 'active',
      rating: 4.5,
      reviews: 0,
      isOnSale: false
    }
    setProducts(prev => [...prev, product])
  }

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ))
  }

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(product => product.id !== productId))
  }

  const getActiveProducts = () => {
    return products.filter(product => product.status === 'active')
  }

  const getProductById = (productId) => {
    return products.find(product => product.id === productId)
  }

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getActiveProducts,
    getProductById
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

export default ProductContext
