import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://mangamuricharansai_db_user:NxTv8YYd0jbfgckO@ac-zcdgolq-shard-00-00.fl3dqxg.mongodb.net:27017,ac-zcdgolq-shard-00-01.fl3dqxg.mongodb.net:27017,ac-zcdgolq-shard-00-02.fl3dqxg.mongodb.net:27017/ecommerce_db?ssl=true&replicaSet=atlas-ppxndz-shard-0&authSource=admin";

// Create native MongoClient for Better Auth adapter
const client = new MongoClient(MONGODB_URI);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "ecommerce_secret_key_987654321_learn_project",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically logs the user in after signing up
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "buyer", // "buyer" | "seller" | "admin"
        input: true, // Allows selecting role during sign-up
      },
    },
  },
});
