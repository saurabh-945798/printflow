import User from "../models/User.js";

export const getOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("orders");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ orders: user.orders || [] });
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { order } = req.body;
    if (!order) return res.status(400).json({ message: "Order required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.orders)) user.orders = [];
    user.orders.unshift(order);
    await user.save();

    res.json({ orders: user.orders });
  } catch {
    res.status(500).json({ message: "Failed to create order" });
  }
};
