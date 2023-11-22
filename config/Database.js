import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export default async function connect() {
  const mongod = await MongoMemoryServer.create();
  const getUri = mongod.getUri();

  mongoose.set("strictQuery", true);
  // const db = await mongoose.connect(getUri);
  const db = await mongoose.connect(process.env.MONGO_URI);
  console.log("Database Connected");
  return db;
}
