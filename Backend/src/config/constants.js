export const DELIVERY_CONFIG = {
    MAX_RADIUS_KM: 100,
    SHOP_COORDINATES: {
        lat: parseFloat(process.env.SHOP_LAT) || 26.1209,
        lng: parseFloat(process.env.SHOP_LNG) || 85.3647
    }
};

export const PRICING_CONFIG = {
    TAX_RATE: 0.18,
    FREE_SHIPPING_THRESHOLD: 1000,
    DEFAULT_SHIPPING_FEE: 0 // For now it's free, but good to have
};

export const ORDER_STATUS = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled"
};

export const PAYMENT_STATUS = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed"
};

export const VALID_STATUS_TRANSITIONS = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.APPROVED, ORDER_STATUS.REJECTED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.APPROVED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.REJECTED]: [],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: []
};
