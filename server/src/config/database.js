import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured");
  }
  await mongoose.connect(process.env.MONGODB_URI);
}
