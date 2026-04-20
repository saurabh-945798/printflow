import User from "../models/User.js";

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("cartItems");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ items: user.cartItems || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const { item } = req.body;
    if (!item) return res.status(400).json({ message: "Item required" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!Array.isArray(user.cartItems)) user.cartItems = [];
    user.cartItems.unshift(item);
    await user.save();

    res.json({ items: user.cartItems });
  } catch (err) {
    res.status(500).json({ message: "Failed to add item" });
  }
};

export const setCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items array required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { cartItems: items },
      { new: true }
    ).select("cartItems");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ items: user.cartItems || [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to update cart" });
  }
};
