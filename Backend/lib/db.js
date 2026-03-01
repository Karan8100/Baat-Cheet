import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/Baat-cheet`);
    console.log("mongo connected")
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

