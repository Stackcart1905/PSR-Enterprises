import User from "../models/user.model.js";
import Order from "../models/order.model.js";

// GET /api/users - list users (admin only)
export const listUsers = async (req, res) => {
  try {
    // Use aggregation to fetch users and their order statistics
    // We use a pipeline lookup to ensure compatibility and handle potentially missing fields
    const users = await User.aggregate([
      { $match: { role: "user" } }, // Only list customers
      {
        $lookup: {
          from: "orders",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user", "$$userId"] } } },
            { $sort: { createdAt: -1 } }
          ],
          as: "userOrders"
        }
      },
      {
        $addFields: {
          ordersCount: { $size: "$userOrders" },
          totalSpent: { $sum: "$userOrders.totalAmount" },
          lastOrder: { $arrayElemAt: ["$userOrders", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          fullName: { $ifNull: ["$fullName", "Unknown Customer"] },
          email: 1,
          role: 1,
          createdAt: 1,
          ordersCount: 1,
          totalSpent: 1,
          lastOrderAt: "$lastOrder.createdAt",
          phone: { $ifNull: ["$lastOrder.deliveryInfo.contactNumber", ""] },
          city: { $ifNull: ["$lastOrder.deliveryInfo.addressText", ""] }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error in listUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export default listUsers;
