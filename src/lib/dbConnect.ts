import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};
async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGODB_URI ? "URI is set" : "URI is missing");
    
    const db = await mongoose.connect(process.env.MONGODB_URI ?? "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log("DB Connected successfully");
    console.log("Connected to database:", db.connections[0].name);
  } catch (error) {
    console.log("Database connection failed", error);
    process.exit(1);
  }
}
export default dbConnect;
