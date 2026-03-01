import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Package, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useNotificationStore from "../store/notificationStore";
import useAuthStore from "../store/authStore";

/**
 * NotificationDropdown
 * Bell icon with unread count badge + scrollable dropdown panel.
 * Fetches notifications on mount and listens for real-time updates.
 */
export default function NotificationDropdown() {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { user } = useAuthStore();
    const {
        notifications,
        unreadCount,
        isLoading,
        dropdownOpen,
        setDropdownOpen,
        toggleDropdown,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotificationStore();

    // Fetch notifications on mount
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user, fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setDropdownOpen]);

    const handleNotificationClick = (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // Navigate based on role
        if (user?.role === "admin") {
            navigate("/admin/dashboard");
        } else {
            navigate("/dashboard");
        }
        setDropdownOpen(false);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "ORDER_PLACED":
                return <Package className="w-4 h-4 text-green-600" />;
            case "ORDER_APPROVED":
                return <Check className="w-4 h-4 text-blue-600" />;
            case "ORDER_REJECTED":
                return <Package className="w-4 h-4 text-red-600" />;
            case "ORDER_DELIVERED":
                return <Package className="w-4 h-4 text-emerald-600" />;
            default:
                return <Bell className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:text-green-700 rounded-full hover:bg-gray-100 transition-all duration-200"
                title="Notifications"
                id="notification-bell"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? "animate-wiggle" : ""}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm animate-in zoom-in-50 duration-200">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {dropdownOpen && (
                <div
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    id="notification-dropdown"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-green-600" />
                            Notifications
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-[10px]">
                                    {unreadCount}
                                </Badge>
                            )}
                        </h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs text-green-600 hover:text-green-700 h-7 px-2"
                            >
                                <CheckCheck className="w-3 h-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {isLoading ? (
                            <div className="py-8 text-center">
                                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-xs text-gray-400">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                                <p className="text-xs text-gray-400 mt-1">You'll be notified about order updates here</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start space-x-3 ${!n.isRead ? "bg-green-50/50 border-l-2 border-l-green-500" : ""
                                        }`}
                                >
                                    <div className={`mt-0.5 p-1.5 rounded-full ${!n.isRead ? "bg-green-100" : "bg-gray-100"}`}>
                                        {getNotificationIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                            {n.message}
                                        </p>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <span className="text-[10px] text-gray-400 flex items-center">
                                                <Clock className="w-3 h-3 mr-0.5" />
                                                {formatTime(n.createdAt)}
                                            </span>
                                            {n.orderNumber && (
                                                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    #{n.orderNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* CSS for bell shake animation */}
            <style>{`
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    15% { transform: rotate(15deg); }
                    30% { transform: rotate(-12deg); }
                    45% { transform: rotate(8deg); }
                    60% { transform: rotate(-5deg); }
                    75% { transform: rotate(3deg); }
                }
                .animate-wiggle {
                    animation: wiggle 0.8s ease-in-out;
                    animation-iteration-count: 3;
                }
            `}</style>
        </div>
    );
}
