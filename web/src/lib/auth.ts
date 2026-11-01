import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://admin:password123@localhost:27017/ecommerce_db?authSource=admin";

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
