import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Variant Sub-Document Interface
export interface IVariant {
  sku: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
  images: string[];
}

// 2. Product Document Interface
export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  basePrice: number;
  discountPrice?: number;
  images: string[];
  variants: IVariant[];
  specs: Map<string, string>;
  ratingSummary: {
    average: number;
    totalReviews: number;
  };
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Variant Schema (Embedded inside Product)
const VariantSchema = new Schema<IVariant>(
  {
    sku: {
      type: String,
      required: [true, "SKU is required for each variant"],
      trim: true,
      uppercase: true,
    },
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    price: {
      type: Number,
      required: [true, "Variant price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock count is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: [{ type: String }],
  },
  { _id: true }
);

// Main Product Schema
const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must belong to a Category"],
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product must be linked to a Seller"],
      index: true,
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
    },
    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "A product must have at least one image",
      },
    },
    // Embedded Variants Array (Colors, Sizes, Stocks)
    variants: [VariantSchema],

    // Flexible Dynamic Specifications (e.g. RAM, Storage, Fabric)
    specs: {
      type: Map,
      of: String,
      default: {},
    },

    ratingSummary: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 1. Full-Text Search Index (Amazon-style keyword searching across title, brand, description)
ProductSchema.index({
  title: "text",
  brand: "text",
  description: "text",
});

// 2. Compound Index for Fast Filter Sorting: Category + Price
ProductSchema.index({ category: 1, basePrice: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
