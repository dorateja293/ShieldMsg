import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MONGODB_URI is not set. Scan history will use in-memory storage.");
    return false;
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME ?? "shieldmsg"
    });
    console.log("MongoDB connected for ShieldMsg scan history.");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. Falling back to in-memory scan history.", error);
    return false;
  }
}
