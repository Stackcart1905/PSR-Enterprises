import { create } from "zustand";
import api from "../lib/axios.js";
import { getSocket } from "../lib/socket.js";

/**
 * Zustand store for notification state management.
 *
 * Centralises:
 *  - HTTP fetching (GET /api/notifications)
 *  - Real-time socket subscription (newNotification, orderStatusUpdate)
 *  - Read/unread state
 *
 * Call initSocketListeners(role) once on login.
 * It returns a cleanup function — call it on logout.
 */
const useNotificationStore = create((set, get) => ({
    // ── State ────────────────────────────────────────────────────────
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    dropdownOpen: false,

    // ── Dropdown helpers ─────────────────────────────────────────────
    setDropdownOpen: (open) => set({ dropdownOpen: open }),
    toggleDropdown: () => set((s) => ({ dropdownOpen: !s.dropdownOpen })),

    // ── Fetch from API ───────────────────────────────────────────────
    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get("/api/notifications");
            set({
                notifications: response.data.notifications,
                unreadCount: response.data.unreadCount,
            });
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    // ── Add incoming real-time notification ──────────────────────────
    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    // ── Update a single order's status locally (buyer real-time) ────
    updateOrderStatus: (orderId, newStatus) => {
        // This is consumed by UserDashboard via a separate orderStatusUpdate
        // listener; kept here so any component can also subscribe if needed.
        console.log(`📦 Order ${orderId} → ${newStatus}`);
    },

    // ── Mark single notification as read ────────────────────────────
    markAsRead: async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    },

    // ── Mark all as read ─────────────────────────────────────────────
    markAllAsRead: async () => {
        try {
            await api.patch("/api/notifications/read-all");
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            }));
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    },

    /**
     * initSocketListeners(role)
     *
     * - Fetches initial notifications from API.
     * - Subscribes to socket events appropriate for the role:
     *     admin → "newNotification"
     *     user  → "newNotification" (order approvals)
     *
     * Returns a cleanup function to unsubscribe (call on logout/unmount).
     */
    initSocketListeners: (role) => {
        // Fetch persisted notifications immediately
        get().fetchNotifications();

        const socket = getSocket();
        if (!socket) return () => { };

        const handleNewNotification = (data) => {
            console.log(`🔔 [${role}] newNotification:`, data);
            get().addNotification({
                _id: Date.now().toString(), // temp ID; store will refetch on next mount
                ...data,
                isRead: false,
                createdAt: new Date().toISOString(),
            });
        };

        socket.on("newNotification", handleNewNotification);

        // Cleanup function returned to the caller (Navbar useEffect)
        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    },
}));

export default useNotificationStore;
