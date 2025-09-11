import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  Users, 
  TrendingUp, 
  LogOut,
  Settings,
  Bell
} from 'lucide-react'
import AdminItemsList from './AdminItemsList'
import AddItemForm from './AddItemForm'
import EditItemForm from './EditItemForm'
import { useProducts } from '../contexts/ProductContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [editingItem, setEditingItem] = useState(null)
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()

  useEffect(() => {
    // Check if user is authenticated and is admin
    const userRole = localStorage.getItem('userRole')
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('isAuthenticated')
    navigate('/login')
  }

  const handleAddItem = (newItem) => {
    addProduct(newItem)
    setActiveTab('items')
  }

  const handleUpdateItem = (updatedItem) => {
    updateProduct(updatedItem)
    setEditingItem(null)
    setActiveTab('items')
  }

  const handleDeleteItem = (itemId) => {
    deleteProduct(itemId)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setActiveTab('edit')
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active products in store
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.reduce((total, item) => total + (item.stock || 0), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Items in inventory
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(products.map(item => item.category)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Product categories
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{products.length > 0 ? Math.round(products.reduce((total, item) => {
                      const price = typeof item.price === 'string' ? 
                        parseFloat(item.price.replace('₹', '').replace(/,/g, '')) : 
                        item.price;
                      return total + price;
                    }, 0) / products.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average item price
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Items</CardTitle>
                  <CardDescription>Latest added products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 3).map(item => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg w-12 h-12 flex items-center justify-center">
                          <span className="text-2xl">{item.image}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.price} • Stock: {item.stock || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('add')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Item
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('items')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Manage Items
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Customers
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      
      case 'items':
        return (
          <AdminItemsList 
            items={products}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )
      
      case 'add':
        return <AddItemForm onAdd={handleAddItem} />
      
      case 'edit':
        return (
          <EditItemForm 
            item={editingItem}
            onUpdate={handleUpdateItem}
            onCancel={() => {
              setEditingItem(null)
              setActiveTab('items')
            }}
          />
        )
      
      default:
        return <div>Content not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PSR</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-sm p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('items')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'items'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-4 h-4 mr-3" />
                Manage Items
              </button>
              
              <button
                onClick={() => setActiveTab('add')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'add'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-4 h-4 mr-3" />
                Add Item
              </button>
              
              <button
                className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Users className="w-4 h-4 mr-3" />
                Customers
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  )
}
