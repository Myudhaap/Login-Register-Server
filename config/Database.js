import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function connect() {
  const db = await mongoose.connect(process.env.MONGO_URI);
  return db;
}
