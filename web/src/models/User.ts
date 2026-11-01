import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Address Sub-Document Interface
export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// 2. User Document Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "buyer" | "seller" | "admin";
  avatar?: string;
  phone?: string;
  // Seller-specific details
  storeName?: string;
  storeDescription?: string;
  isSellerVerified: boolean;
  // Multiple delivery addresses
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "India" },
    phone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Prevents returning the hashed password in standard queries
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
    },
    storeName: {
      type: String,
      trim: true,
      sparse: true, // Only indexes sellers who actually have a storeName
    },
    storeDescription: {
      type: String,
      maxlength: [1000, "Store description cannot exceed 1000 characters"],
    },
    isSellerVerified: {
      type: Boolean,
      default: false,
    },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
