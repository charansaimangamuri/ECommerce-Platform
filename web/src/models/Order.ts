import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  variantSku: string;
  color?: string;
  size?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  buyerEmail: string;
  buyerName: string;
  buyerId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    country: string;
  };
  totalAmount: number;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE_CARD";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    variantSku: { type: String, required: true },
    color: { type: String },
    size: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerEmail: { type: String, required: true, index: true },
    buyerName: { type: String, required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    items: [OrderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      phone: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_DELIVERY", "ONLINE_CARD"],
      default: "CASH_ON_DELIVERY",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    orderStatus: {
      type: String,
      enum: ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PLACED",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
