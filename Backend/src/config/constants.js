export const DELIVERY_CONFIG = {
  MAX_RADIUS_KM: 5,
  SHOP_COORDINATES: {
    lat: parseFloat(process.env.SHOP_LAT) || 26.1209,
    lng: parseFloat(process.env.SHOP_LNG) || 85.3647,
  },
};

export const DELIVERY_PRICING = {
  FREE_RADIUS_KM: 0, // No free radius - charges apply from 0km
  TIER_0_RADIUS_KM: 1, // 0-1 km
  TIER_0_FEE: 20,
  TIER_1_RADIUS_KM: 3, // 1-3 km
  TIER_1_FEE: 40,
  TIER_2_RADIUS_KM: 5, // 3-5 km
  TIER_2_FEE: 60,
  TIER_3_RADIUS_KM: 5, // Beyond 5 km (same as tier 2 for now)
  TIER_3_FEE: 60,
};

export const PRICING_CONFIG = {
  TAX_RATE: 0.18,
  FREE_SHIPPING_THRESHOLD: 500, // Free delivery for orders above ₹500
  DEFAULT_SHIPPING_FEE: 20, // Standard delivery fee
  FIRST_ORDER_FREE_DELIVERY: true, // Free delivery for first order
};

export const ORDER_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
};

export const VALID_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.APPROVED,
    ORDER_STATUS.REJECTED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.APPROVED]: [
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.REJECTED]: [],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};
