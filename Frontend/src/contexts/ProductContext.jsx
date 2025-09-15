import React, { createContext, useContext, useState, useEffect } from 'react'

const ProductContext = createContext()

const initialProducts = [
  {
    id: 1,
    name: "Kaju (Cashew)",
    price: "₹2,899.99",
    originalPrice: "₹3,199.99",
    image: "https://cdn.shopclues.com/images/detailed/39608/82115108cashew00114260782071441391958_1466586483.jpg",
    images: [
      "https://cdn.shopclues.com/images/detailed/39608/82115108cashew00114260782071441391958_1466586483.jpg",
      "https://karnatakatv.net/wp-content/uploads/2022/12/kaju.jpg"
    ],
    rating: 4.9,
    reviews: 210,
    description: "Creamy and buttery cashews from premium Indian farms, perfect for snacking and cooking",
    category: "Nuts",
    isOnSale: true,
    stock: 40,
    status: "active"
  },
  {
    id: 2,
    name: "Kismiss (Raisins)",
    price: "₹1,499.99",
    originalPrice: "₹1,799.99",
    image: "https://attarayurveda.com/wp-content/uploads/2017/11/81quI-W0UJL._SL1500_-compressor.jpg",
    images: [
      "https://attarayurveda.com/wp-content/uploads/2017/11/81quI-W0UJL._SL1500_-compressor.jpg",
      "https://moslawala.com/wp-content/uploads/2019/08/KISSMISS-%E0%A6%95%E0%A6%BF%E0%A6%B8%E0%A6%AE%E0%A6%BF%E0%A6%B8.jpg"
    ],
    rating: 4.7,
    reviews: 134,
    description: "Naturally sweet raisins full of energy and iron, perfect for healthy snacking",
    category: "Dried Fruits",
    isOnSale: true,
    stock: 50,
    status: "active"
  },
  {
    id: 3,
    name: "Badam (Almonds)",
    price: "₹2,499.99",
    originalPrice: "₹2,999.99",
    image: "https://www.aahaarexpert.com/wp-content/uploads/2018/01/almond-1024x1024.jpg",
    images: [
      "https://www.aahaarexpert.com/wp-content/uploads/2018/01/almond-1024x1024.jpg",
      "https://www.health.com/thmb/xklPFBrlPpwcHND_ov5EZwLHAwc=/2000x0/filters:no_upscale():max_bytes(150000):strip_icc()/almonds-GettyImages-683814187-2000-44a06e730fac4c60a10cbb5f9642b589.jpg"
    ],
    rating: 4.8,
    reviews: 124,
    description: "Premium California almonds, rich in protein and healthy fats, ideal for brain health",
    category: "Nuts",
    isOnSale: true,
    stock: 50,
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
