import mongoose from "mongoose";
import User from "@/models/User";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Order from "@/models/Order";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mangamuricharansai_db_user:NxTv8YYd0jbfgckO@ac-zcdgolq-shard-00-00.fl3dqxg.mongodb.net:27017,ac-zcdgolq-shard-00-01.fl3dqxg.mongodb.net:27017,ac-zcdgolq-shard-00-02.fl3dqxg.mongodb.net:27017/ecommerce_db?ssl=true&replicaSet=atlas-ppxndz-shard-0&authSource=admin";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Ensure all Mongoose models are explicitly initialized and registered
  void User.schema;
  void Category.schema;
  void Product.schema;
  void Order.schema;

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI as string, opts).then((instance) => {
      console.log("Connected to MongoDB successfully.");
      return instance;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    throw error;
  }

  return cached!.conn;
}
