/**
 * WhatsApp Message Templates for Order Lifecycle
 */
export const WHATSAPP_TEMPLATES = {
    ORDER_PLACED: (order) => `
🛒 *Order Placed Successfully!*

*Order ID:* ${order.orderNumber}
*Total:* ₹${order.totalAmount.toLocaleString()}
*Status:* Pending Approval

We have received your order and will notify you once it is approved by the admin. 
Thank you for shopping with Swaadhbog Mewa Enterprises!
    `.trim(),

    ADMIN_NEW_ORDER: (order, customerName) => `
🔔 *New Order Received!*

*Order ID:* ${order.orderNumber}
*Customer:* ${customerName}
*Total:* ₹${order.totalAmount.toLocaleString()}
*Items:* ${order.items.length}

Please log in to the dashboard to review and approve.
    `.trim(),

    ORDER_APPROVED: (order) => `
✅ *Order Approved!*

*Order ID:* ${order.orderNumber}
*Expected Delivery:* ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'TBD'}

Your order has been approved and is being prepared for dispatch.
    `.trim(),

    ORDER_REJECTED: (order) => `
❌ *Order Rejected*

*Order ID:* ${order.orderNumber}

Unfortunately, your order could not be accepted at this time. Please contact our support team for more details.
    `.trim(),

    ORDER_CANCELLED_ADMIN: (order, customerName) => `
⚠️ *Order Cancelled by Buyer*

*Order ID:* ${order.orderNumber}
*Customer:* ${customerName}

The buyer has cancelled this order. Please check the dashboard for details.
    `.trim()
};
