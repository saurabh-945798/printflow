import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("====================================");
    console.log("🍃 MongoDB Status");
    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    console.log("====================================");
  } catch (error) {
    console.error("🔴 MongoDB Connection Failed ❌");
    console.error(error.message);
    process.exit(1);
  }
};

export default connectDB;
