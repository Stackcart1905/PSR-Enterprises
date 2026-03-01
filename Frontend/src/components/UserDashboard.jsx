import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";
import useNotificationStore from "../store/notificationStore";
import { getSocket } from "../lib/socket";
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
    ShoppingCart,
    User,
    Bell,
    LogOut,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    Calendar,
    MapPin,
    Receipt,
    ShoppingBag,
    TrendingUp,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import Orders from "./Orders";
import Cart from "./Cart";
import NotificationDropdown from "./NotificationDropdown";

// ─── Status Color Helper ────────────────────────────────────────────────
const getStatusColor = (status) => {
    switch (status) {
        case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Approved": return "bg-blue-100 text-blue-800 border-blue-200";
        case "Delivered": return "bg-green-100 text-green-800 border-green-200";
        case "Rejected": return "bg-red-100 text-red-800 border-red-200";
        case "Cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
        default: return "bg-gray-100 text-gray-800";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "Pending": return <Clock className="w-4 h-4" />;
        case "Approved": return <CheckCircle2 className="w-4 h-4" />;
        case "Delivered": return <Truck className="w-4 h-4" />;
        case "Rejected": return <XCircle className="w-4 h-4" />;
        case "Cancelled": return <XCircle className="w-4 h-4" />;
        default: return <Package className="w-4 h-4" />;
    }
};

// ─── Main UserDashboard Component ───────────────────────────────────────
export default function UserDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { notifications, unreadCount, initSocketListeners } = useNotificationStore();
    const { getCartCount } = useCart();

    const [activeTab, setActiveTab] = useState("overview");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // ─── Bootstrap notifications + socket on mount ────────────────────
    useEffect(() => {
        const cleanup = initSocketListeners("user");
        return () => cleanup?.();
    }, [initSocketListeners]);

    // ─── Fetch User Orders ────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get("/api/orders/my");
            setOrders(res.data.orders);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // ─── Socket — orderStatusUpdate (real-time approval) ──────────────
    // Note: newNotification is handled centrally by notificationStore.initSocketListeners
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleStatusUpdate = (data) => {
            console.log("📡 Order status update received:", data);

            // Update order locally — no manual refresh needed
            setOrders((prev) =>
                prev.map((order) =>
                    order._id === data.orderId
                        ? {
                            ...order,
                            status: data.newStatus,
                            deliveryDate: data.deliveryDate || order.deliveryDate,
                            adminNotes: data.adminNotes || order.adminNotes,
                        }
                        : order
                )
            );

            // Toast on approval
            setToast({
                message: `🎉 Order #${data.orderNumber} has been ${data.newStatus}!`,
                type: data.newStatus === "Approved" ? "success" : "info",
            });
            setTimeout(() => setToast(null), 6000);
        };

        socket.on("orderStatusUpdate", handleStatusUpdate);
        return () => socket.off("orderStatusUpdate", handleStatusUpdate);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    // ─── Computed Stats ──────────────────────────────────────────────
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;
    const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
    const approvedOrders = orders.filter((o) => o.status === "Approved").length;
    const lastOrder = orders.length > 0 ? orders[0] : null;

    // ─── Sidebar Menu Items ─────────────────────────────────────────
    const menuItems = [
        { key: "overview", label: "Overview", icon: LayoutDashboard },
        { key: "orders", label: "My Orders", icon: Package },
        { key: "cart", label: "My Cart", icon: ShoppingCart, badge: getCartCount() },
        { key: "profile", label: "Profile Settings", icon: User },
        { key: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    ];

    // ─── Content Renderer ───────────────────────────────────────────
    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Package className="h-4 w-4 text-green-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{totalOrders}</div>
                                    <p className="text-xs text-gray-400 mt-1">Lifetime orders placed</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{pendingOrders}</div>
                                    <p className="text-xs text-gray-400 mt-1">Awaiting approval</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{approvedOrders}</div>
                                    <p className="text-xs text-gray-400 mt-1">Ready for delivery</p>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">Delivered</CardTitle>
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Truck className="h-4 w-4 text-emerald-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-black text-gray-900">{deliveredOrders}</div>
                                    <p className="text-xs text-gray-400 mt-1">Successfully received</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Last Order Summary */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Last Order</CardTitle>
                                    <CardDescription>Your most recent order details</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {lastOrder ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm font-bold text-gray-400">#</span>
                                                    <span className="text-lg font-black text-gray-900">{lastOrder.orderNumber}</span>
                                                </div>
                                                <Badge className={`${getStatusColor(lastOrder.status)} border rounded-full`}>
                                                    {getStatusIcon(lastOrder.status)}
                                                    <span className="ml-1">{lastOrder.status}</span>
                                                </Badge>
                                            </div>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {new Date(lastOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </div>
                                                <div className="flex items-center">
                                                    <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                                                    {lastOrder.items.reduce((acc, i) => acc + i.quantity, 0)} items
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="truncate">{lastOrder.deliveryInfo?.addressText}</span>
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total</span>
                                                <span className="text-2xl font-black text-green-700">₹{lastOrder.totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                            <p className="text-sm text-gray-500">No orders yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                                    <CardDescription>Go to key sections</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        onClick={() => navigate("/products")}
                                        className="w-full justify-start"
                                        variant="outline"
                                    >
                                        <ShoppingBag className="w-4 h-4 mr-2" />
                                        Browse Products
                                    </Button>
                                    <Button
                                        onClick={() => setActiveTab("orders")}
                                        className="w-full justify-start"
                                        variant="outline"
                                    >
                                        <Package className="w-4 h-4 mr-2" />
                                        View All Orders
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/cart")}
                                        className="w-full justify-start"
                                        variant="outline"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Go to Cart
                                        {getCartCount() > 0 && (
                                            <Badge variant="destructive" className="ml-auto">{getCartCount()}</Badge>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Orders Preview */}
                        {orders.length > 0 && (
                            <Card className="border-none shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Recent Orders</CardTitle>
                                        <CardDescription>Your last 3 orders</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")} className="text-green-600">
                                        View All →
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {orders.slice(0, 3).map((order) => (
                                            <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-full ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-700">₹{order.totalAmount.toLocaleString()}</p>
                                                    <Badge variant="outline" className={`text-[10px] ${getStatusColor(order.status)} border rounded-full`}>
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                );

            case "orders":
                return <Orders />;

            case "cart":
                return (
                    <div>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                                My Cart
                            </h2>
                            <p className="text-sm text-gray-500">Review and manage your cart items</p>
                        </div>
                        <Cart />
                    </div>
                );

            case "profile":
                return (
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>Manage your account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                        <User className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{user?.fullName || "User"}</h3>
                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                        <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                                            {user?.role?.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="pt-4 border-t space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Member since</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "N/A"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Total Orders</span>
                                        <span className="text-sm font-bold text-gray-900">{totalOrders}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-500">Email Verified</span>
                                        <Badge className={user?.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                            {user?.isVerified ? "Verified" : "Not Verified"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case "notifications":
                return (
                    <Card className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>All your notification history</CardDescription>
                            </div>
                            {unreadCount > 0 && (
                                <Button variant="outline" size="sm" onClick={() => useNotificationStore.getState().markAllAsRead()}>
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Mark all read
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            className={`flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-50 ${!n.isRead ? "bg-green-50/50 border-l-2 border-l-green-500" : ""
                                                }`}
                                            onClick={() => {
                                                if (!n.isRead) useNotificationStore.getState().markAsRead(n._id);
                                            }}
                                        >
                                            <div className={`p-2 rounded-full ${!n.isRead ? "bg-green-100" : "bg-gray-100"}`}>
                                                {n.type === "ORDER_APPROVED" ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Package className="w-4 h-4 text-green-600" />}
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
                        </CardContent>
                    </Card>
                );

            default:
                return <div>Content not found</div>;
        }
    };

    // ─── JSX ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full duration-500">
                    <Card className={`w-80 border-none shadow-2xl overflow-hidden ${toast.type === "success" ? "bg-green-900 text-white" : "bg-blue-900 text-white"}`}>
                        <div className="p-4 flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === "success" ? "bg-green-500" : "bg-blue-500"}`}>
                                {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{toast.message}</p>
                            </div>
                            <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <div className={`h-1 animate-progress ${toast.type === "success" ? "bg-green-400" : "bg-blue-400"}`}></div>
                    </Card>
                </div>
            )}

            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">PSR</span>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                My Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                                ← Back to Store
                            </Button>
                            {/* 🔔 Bell — buyer dashboard only, before Logout */}
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
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 pb-4 mb-4 border-b">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || "User"}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveTab(item.key)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === item.key
                                        ? "bg-green-100 text-green-700 shadow-sm"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <item.icon className="w-4 h-4 mr-3" />
                                        {item.label}
                                    </div>
                                    {item.badge > 0 && (
                                        <Badge variant="destructive" className="px-1.5 py-0 text-[10px] h-5">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">{renderContent()}</main>
                </div>
            </div>

            {/* Progress animation for toast */}
            <style>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 6s linear forwards;
                }
            `}</style>
        </div>
    );
}
