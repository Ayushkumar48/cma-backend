import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB");
    } else {
      console.log("Already connected to MongoDB");
    }
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}
