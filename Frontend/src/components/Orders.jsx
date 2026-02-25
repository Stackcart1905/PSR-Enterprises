import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Calendar, MapPin, Receipt, ChevronRight, CheckCircle2, History } from "lucide-react";

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

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const location = useLocation();
    const showSuccess = location.state?.orderSuccess;

    const toggleOrder = (id) => {
        setExpandedOrderId(prev => prev === id ? null : id);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get("/api/orders/my");
                setOrders(response.data.orders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {showSuccess && (
                    <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 flex items-center space-x-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-green-900">Order Placed Successfully!</h2>
                            <p className="text-green-700">Thank you for shopping with us. We'll notify you once it's approved.</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <History className="w-8 h-8 text-green-600" />
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    </div>
                    <Link to="/products">
                        <Button variant="outline" className="hidden sm:flex items-center">
                            <ShoppingBag className="w-4 h-4 mr-2" /> Continue Shopping
                        </Button>
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <Card className="text-center py-16 border-dashed border-2 bg-transparent">
                        <CardContent>
                            <div className="bg-white inline-flex p-6 rounded-full shadow-sm mb-6">
                                <Package className="w-16 h-16 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't placed any orders yet. Explore our premium dry fruits and mixed nuts!</p>
                            <Link to="/products">
                                <Button className="bg-green-600 hover:bg-green-700 h-12 px-8 font-bold rounded-lg shadow-lg shadow-green-100">
                                    Browse Products
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const isExpanded = expandedOrderId === order._id;
                            return (
                                <Card
                                    key={order._id}
                                    className={`overflow-hidden border-none shadow-md hover:shadow-lg transition-all border-l-4 border-l-green-500 cursor-pointer ${isExpanded ? 'ring-1 ring-green-100' : ''}`}
                                    onClick={() => toggleOrder(order._id)}
                                >
                                    <CardHeader className="bg-white border-b border-gray-100 sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 relative">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Order #</span>
                                                <span className="text-lg font-black text-gray-900">{order.orderNumber}</span>
                                                <Badge variant="outline" className={`ml-2 px-2.5 py-0.5 rounded-full border ${getStatusColor(order.status)} font-medium`}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500 space-x-4 pt-1">
                                                <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5" /> {new Date(order.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                <span className="flex items-center text-green-600 font-bold"><Package className="w-3.5 h-3.5 mr-1.5" /> {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-6">
                                            <div className="flex flex-col items-end">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total Amount</p>
                                                <p className="text-2xl font-black text-green-700">₹{order.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    {/* Collapsible Section */}
                                    <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                                        <CardContent className="p-0">
                                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                                <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100 space-y-4">
                                                    <div className="flex items-start space-x-3">
                                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                                            <p className="text-sm text-gray-700 leading-relaxed font-medium">{order.deliveryInfo.addressText}</p>
                                                        </div>
                                                    </div>

                                                    {order.deliveryDate && order.status === "Approved" && (
                                                        <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                                                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                                                            <div>
                                                                <p className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">Estimated Delivery</p>
                                                                <p className="text-sm text-blue-800 font-bold">
                                                                    {new Date(order.deliveryDate).toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {order.adminNotes && (
                                                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                            <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">Note from Admin</p>
                                                            <p className="text-sm text-amber-800 italic">"{order.adminNotes}"</p>
                                                        </div>
                                                    )}

                                                    {order.status === "Pending" && (
                                                        <div className="pt-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={async (e) => {
                                                                    e.stopPropagation(); // Prevent card collapse when clicking button
                                                                    if (window.confirm("Are you sure you want to cancel this order?")) {
                                                                        try {
                                                                            await api.patch(`/api/orders/${order._id}/cancel`);
                                                                            // Refresh orders
                                                                            const response = await api.get("/api/orders/my");
                                                                            setOrders(response.data.orders);
                                                                        } catch (error) {
                                                                            alert(error.response?.data?.message || "Failed to cancel order");
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700 h-9 px-4 font-bold"
                                                            >
                                                                Cancel Order
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-6 bg-gray-50/50">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items Snapshot</p>
                                                        <Receipt className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-white rounded border border-gray-200 p-1 flex-shrink-0">
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">{item.quantity} x ₹{item.price.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
