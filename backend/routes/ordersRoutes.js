import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createOrder, getOrders } from "../controllers/ordersController.js";

const router = express.Router();

// Orders read/create endpoints are protected per authenticated user.
router.get("/", requireAuth, getOrders);
router.post("/", requireAuth, createOrder);

export default router;
