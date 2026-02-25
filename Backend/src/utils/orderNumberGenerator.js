import crypto from "crypto";

/**
 * Generates a unique order number in the format: SWB-YYYYMMDD-XXXXX
 * Where XXXXX is a random alphanumeric string.
 */
export const generateOrderNumber = () => {
    const prefix = "SWB";
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 5);

    return `${prefix}-${date}-${randomStr}`;
};
