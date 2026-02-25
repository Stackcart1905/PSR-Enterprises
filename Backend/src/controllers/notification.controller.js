import Notification from "../models/notification.model.js";

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Ownership check — users can only mark their own notifications
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
