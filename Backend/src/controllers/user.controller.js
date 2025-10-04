import User from "../models/user.model.js";

// GET /api/users - list users (admin only)
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("fullName email role createdAt");

    // shape optionally enriched fields for frontend compatibility
    const mapped = users.map((u) => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      // optional placeholders for UI fields not tracked in schema
      phone: u.phone || "",
      city: u.city || "",
      ordersCount: 0,
      totalSpent: 0,
      lastOrderAt: null,
    }));

    return res.status(200).json({ success: true, users: mapped });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

export default listUsers;


