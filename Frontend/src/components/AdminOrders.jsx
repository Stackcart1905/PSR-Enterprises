import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";
import api from "../lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    Calendar,
    MapPin,
    CheckCircle2,
    XCircle,
    Truck,
    MessageSquare,
    User,
    Clock,
    Eye,
    ChevronDown,
    Search,
    Filter,
    Receipt,
    Bell
} from "lucide-react";

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

const OrderCard = ({ order, onUpdateStatus, onApprove }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                    {/* Primary Info */}
                    <div className="p-5 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">#{order.orderNumber}</span>
                            <Badge className={`${getStatusColor(order.status)} border rounded-full font-medium`}>
                                {order.status}
                            </Badge>
                        </div>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 leading-tight">{order.user?.fullName || "Guest"}</p>
                                <p className="text-xs text-gray-500 truncate w-40">{order.user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {new Date(order.createdAt).toLocaleString()}</div>
                            <div className="flex items-start"><MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" /> <span className="flex-1 line-clamp-2">{order.deliveryInfo?.addressText}</span></div>
                        </div>
                    </div>

                    {/* Order Summary & Snapshot */}
                    <div className="p-5 flex-1 bg-gray-50/30 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Summary</span>
                                <span className="text-xl font-black text-green-700">₹{order.totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="space-y-2">
                                {order.items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700 font-medium truncate max-w-[200px]">{item.quantity}x {item.name}</span>
                                        <span className="text-gray-500 font-mono text-xs">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                {order.items.length > 2 && (
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="text-xs text-green-600 font-bold hover:underline flex items-center"
                                    >
                                        + {order.items.length - 2} more items <ChevronDown className={`w-3 h-3 ml-1 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {order.status === "Approved" && order.deliveryDate ? (
                            <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded flex items-center space-x-2">
                                <Truck className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-tighter">Exp Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="h-8 text-xs text-gray-500 hover:text-green-600 px-0"
                                >
                                    <Eye className="w-3.5 h-3.5 mr-1" /> {isExpanded ? 'Hide' : 'View Full Details'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-5 lg:w-48 bg-gray-50/50 flex flex-col justify-center space-y-2">
                        {order.status === "Pending" ? (
                            <>
                                <Button
                                    onClick={() => onApprove(order)}
                                    className="w-full bg-green-600 hover:bg-green-700 h-10 font-bold"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onUpdateStatus(order._id, "Rejected")}
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 h-10"
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                </Button>
                            </>
                        ) : order.status === "Approved" ? (
                            <Button
                                onClick={() => onUpdateStatus(order._id, "Delivered")}
                                className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold"
                            >
                                <Truck className="w-4 h-4 mr-2" /> Deliver
                            </Button>
                        ) : (
                            <div className="text-center py-2 flex flex-col items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1 font-mono">Archive Record</span>
                                <Badge variant="secondary" className="text-[10px] opacity-60">ID: {order._id.slice(-6)}</Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="border-t border-gray-100 p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Complete Item List</h4>
                                <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="w-12 h-12 rounded border p-1 bg-white">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.quantity} x ₹{item.price.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center"><Receipt className="w-3 h-3 mr-1.5" /> Shipping Logistics</h4>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-4 shadow-inner">
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-4 h-4 text-green-600 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">GPS Location</p>
                                                <p className="text-xs font-mono text-gray-900 uppercase bg-white px-2 py-0.5 rounded border inline-block mt-0.5">
                                                    {order.deliveryInfo?.coordinates?.lat.toFixed(6)}, {order.deliveryInfo?.coordinates?.lng.toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MessageSquare className="w-4 h-4 text-green-600 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Contact Channel</p>
                                                <p className="text-sm font-bold text-gray-900 mt-0.5">{order.deliveryInfo?.contactNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {order.adminNotes && (
                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Admin Remarks</h4>
                                        <p className="text-sm text-gray-700 italic bg-amber-50 p-3 rounded-lg border border-amber-100 font-medium">"{order.adminNotes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const AdminOrders = () => {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);

    // Notification state
    const [notification, setNotification] = useState(null);

    // Modal state
    const [deliveryDate, setDeliveryDate] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get("/api/orders/admin/all");
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Error fetching admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        // Socket.io Connection
        const socketToken = localStorage.getItem("token");
        const socket = io(import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3000", {
            auth: { token: socketToken },
            transports: ["websocket", "polling"]
        });

        socket.on("connect", () => {
            console.log("Admin connected to socket server");
        });

        socket.on("newOrder", (data) => {
            console.log("New order received via socket:", data);
            setNotification(data);
            fetchOrders(); // Refresh the list
        });

        socket.on("newNotification", (data) => {
            console.log("New notification received via socket:", data);
            if (data.type === "ORDER_CANCELLED") {
                fetchOrders(); // Auto-refresh list on cancellation
            }
        });

        // Auto-hide notification after 10 seconds
        setTimeout(() => setNotification(null), 10000);

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleApprove = async () => {
        if (!selectedOrder || !deliveryDate) return;

        setIsProcessing(true);
        try {
            await api.patch(`/api/orders/${selectedOrder._id}/approve`, {
                deliveryDate,
                adminNotes
            });
            setShowApproveModal(false);
            setSelectedOrder(null);
            fetchOrders(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || "Failed to approve order");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        if (!window.confirm(`Are you sure you want to set order status to ${status}?`)) return;

        try {
            await api.patch(`/api/orders/${orderId}/status`, { status });
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            <style>
                {`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-progress {
                    animation: progress 10s linear forwards;
                }
                `}
            </style>
            {/* Live Notification Toast */}
            {notification && (
                <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-full duration-500">
                    <Card className="w-80 border-none shadow-2xl bg-green-900 text-white overflow-hidden">
                        <div className="p-4 flex items-start space-x-4">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                                <Bell className="w-5 h-5 text-white fill-current" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-300">New Order Alert</p>
                                    <button onClick={() => setNotification(null)} className="text-white opacity-50 hover:opacity-100"><XCircle className="w-4 h-4" /></button>
                                </div>
                                <p className="font-bold text-sm mt-1">#{notification.orderNumber}</p>
                                <p className="text-xs text-green-100 opacity-80">{notification.customerName} placed an order of ₹{notification.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="h-1 bg-green-400 animate-progress"></div>
                    </Card>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Package className="w-6 h-6 mr-2 text-green-600" /> Order Management
                    </h2>
                    <p className="text-gray-500">View and manage customer orders, approvals, and logistics.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={fetchOrders} className="h-10 hover:bg-green-50 hover:text-green-700 transition-colors">
                        <Clock className="w-4 h-4 mr-2" /> Refresh Records
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-none shadow-sm h-auto md:h-16 flex items-center p-4 bg-white">
                <div className="flex flex-col md:flex-row flex-1 items-center gap-4">
                    <div className="relative flex-1 w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order # or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-gray-50 border-none rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none pr-8 appearance-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </Card>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Syncing Cloud Orders...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <Card className="border-dashed border-2 py-20 text-center bg-transparent">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            onUpdateStatus={handleUpdateStatus}
                            onApprove={(o) => {
                                setSelectedOrder(o);
                                setDeliveryDate("");
                                setAdminNotes("");
                                setShowApproveModal(true);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl border-none animate-in zoom-in-95 duration-200">
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tighter">Approve Dispatch</CardTitle>
                            <CardDescription className="font-mono text-xs">ORDER TRACKING: {selectedOrder?.orderNumber}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                    <Calendar className="w-3 h-3 mr-2 text-green-600" /> Target Delivery Date
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                                    <MessageSquare className="w-3 h-3 mr-2 text-green-600" /> Dispatch Instructions
                                </label>
                                <textarea
                                    rows={3}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add delivery instructions or tracking info..."
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all resize-none text-sm font-medium"
                                />
                                <p className="text-[10px] text-gray-400 italic">Visible to customer on their dashboard.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-12 font-bold"
                                    onClick={() => setShowApproveModal(false)}
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 h-12 font-black shadow-lg shadow-green-100"
                                    onClick={handleApprove}
                                    disabled={isProcessing || !deliveryDate}
                                >
                                    {isProcessing ? "PROCESSING..." : "CONFIRM DISPATCH"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
