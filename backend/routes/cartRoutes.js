import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { addCartItem, getCart, setCart } from "../controllers/cartController.js";

const router = express.Router();

// Cart read/update endpoints are protected per authenticated user.
router.get("/", requireAuth, getCart);
router.post("/add", requireAuth, addCartItem);
router.put("/", requireAuth, setCart);

export default router;
