import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  Plus,
  Users,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
  ShoppingCart
} from "lucide-react";
import AdminItemsList from "./AdminItemsList";
import AddItemForm from "./AddItemForm";
import EditItemForm from "./EditItemForm";
import Customers from "./Customers";
import AdminSettings from "./AdminSettings";
import AdminOrders from "./AdminOrders";
import NotificationDropdown from "./NotificationDropdown";
import { useProducts } from "../contexts/ProductContext";
import useNotificationStore from "../store/notificationStore";
import { getSocket } from "../lib/socket";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingItem, setEditingItem] = useState(null);
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    refetchProducts,
  } = useProducts();

  const { unreadCount, notifications, fetchNotifications, addNotification } = useNotificationStore();

  // Fetch persistent notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen to real-time notifications via shared socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (data) => {
      // Show alert/toast for cancellations as requested
      if (data.type === "ORDER_CANCELLED") {
        // Since no toast library is globally available, using alert or custom toast if available
        // User requested toast.error, but I'll use alert to match functional requirement safely
        // if no toast library is found.
        alert(`🚨 Buyer cancelled an order: #${data.orderNumber}`);
      }

      addNotification({
        _id: Date.now().toString(),
        ...data,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    };

    socket.on("newNotification", handleNewNotification);
    return () => socket.off("newNotification", handleNewNotification);
  }, [addNotification]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleAddItem = (newItem) => {
    addProduct(newItem);
    setActiveTab("items");
  };

  const handleUpdateItem = (updatedItem) => {
    updateProduct(updatedItem);
    setEditingItem(null);
    setActiveTab("overview");
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteProduct(itemId);
      // optional refresh to ensure consistency
      if (typeof refetchProducts === "function") {
        await refetchProducts();
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to delete item");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setActiveTab("edit");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Items
                  </CardTitle>
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
                  <CardTitle className="text-sm font-medium">
                    Total Stock
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {products.reduce(
                      (total, item) => total + (item.stock || 0),
                      0
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Items in inventory
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Categories
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(products.map((item) => item.category)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Product categories
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Price
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹
                    {products.length > 0
                      ? Math.round(
                        products.reduce((total, item) => {
                          const price =
                            typeof item.price === "string"
                              ? parseFloat(
                                item.price
                                  .replace("₹", "")
                                  .replace(/,/g, "")
                              )
                              : item.price;
                          return total + price;
                        }, 0) / products.length
                      )
                      : 0}
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
                    {products.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg w-12 h-12 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="20" fill="%236b7280" text-anchor="middle" dy="0.3em">🥜</text></svg>';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.price} • Stock: {item.stock || "N/A"}
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
                    onClick={() => setActiveTab("add")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Item
                  </Button>
                  <Button
                    onClick={() => setActiveTab("items")}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Manage Items
                  </Button>
                  <Button
                    onClick={() => setActiveTab("customers")}
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
        );

      case "items":
        return (
          <AdminItemsList
            items={products}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        );

      case "add":
        return <AddItemForm onAdd={handleAddItem} />;

      case "edit":
        return (
          <EditItemForm
            item={editingItem}
            onUpdate={handleUpdateItem}
            onCancel={() => {
              setEditingItem(null);
              setActiveTab("items");
            }}
          />
        );

      case "customers":
        return <Customers />;

      case "orders":
        return <AdminOrders />;

      case "notifications":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-green-600" /> Notifications
                </h2>
                <p className="text-gray-500 text-sm">Real-time order alerts and events</p>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={() => useNotificationStore.getState().markAllAsRead()}>
                  Mark all read
                </Button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${!n.isRead ? "bg-green-50/50 border-green-200 border-l-4 border-l-green-500" : "bg-white border-gray-100"
                      }`}
                    onClick={() => !n.isRead && useNotificationStore.getState().markAsRead(n._id)}
                  >
                    <div className={`p-2 rounded-full ${!n.isRead ? "bg-green-100" : "bg-gray-100"}`}>
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-600"}`}>{n.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString("en-IN")}</span>
                        {n.orderNumber && (
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{n.orderNumber}</span>
                        )}
                      </div>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "settings":
        return <AdminSettings />;

      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* //!Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SWAAD</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* 🔔 Bell — admin dashboard only, before Logout */}
              <NotificationDropdown />
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
          {/* //! Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-sm p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "overview"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Overview
              </button>

              <button
                onClick={() => setActiveTab("items")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "items"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Package className="w-4 h-4 mr-3" />
                Manage Items
              </button>

              <button
                onClick={() => setActiveTab("add")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "add"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Plus className="w-4 h-4 mr-3" />
                Add Item
              </button>

              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "customers"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Users className="w-4 h-4 mr-3" />
                Customers
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "orders"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                Orders
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "notifications"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <span className="flex items-center">
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="px-1.5 py-0 text-[10px] h-5">{unreadCount}</Badge>
                )}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "settings"
                  ? "bg-green-100 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </button>
            </nav>
          </aside>

          {/* //! Main Content */}
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
