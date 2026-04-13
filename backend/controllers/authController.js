import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const signJwt = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Normalize user input so lookup and persistence stay consistent.
    const normalizedEmail = email?.trim().toLowerCase();
    const trimmedName = name?.trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = signJwt({ userId: user._id, role: user.role });

    res.status(201).json({
      success: true,
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Register failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Use the same normalization strategy as registration before lookup.
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signJwt({ userId: user._id, role: user.role });

    res.json({
      success: true,
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
