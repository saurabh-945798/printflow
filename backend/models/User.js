import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    cartItems: {
      // Mixed payload keeps customize variants flexible without schema migration churn.
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    orders: {
      // Mixed payload stores checkout snapshot as created by current frontend flow.
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
