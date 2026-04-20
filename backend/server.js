import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// routes
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";

// middleware
import { requireAuth, requireRole } from "./middleware/authMiddleware.js";

// 🔌 MongoDB connection
connectDB();

const app = express();

// =====================
// 🌐 Global Middlewares
// =====================
app.use(cors());
app.use(express.json());

// =====================
// 🚀 Health / Test Route
// =====================
app.get("/", (req, res) => {
  res.send("🚀 Promtathon Backend Running");
});

// =====================
// 🔐 Auth Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);

// =====================
// 👤 Protected Routes
// =====================

// Logged-in user check
app.get("/api/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user, // { userId, role }
  });
});

// Admin-only route
app.get("/api/admin", requireAuth, requireRole("admin"), (req, res) => {
  res.json({
    success: true,
    message: "👑 Welcome Admin",
  });
});

// =====================
// ❌ 404 Handler
// =====================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// =====================
// 🚀 Server Start
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("====================================");
  console.log("🚀 Server Status");
  console.log(`🟢 Server running on port: ${PORT}`);
  console.log("====================================");
});
