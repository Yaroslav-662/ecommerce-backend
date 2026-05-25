import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    name: {
      type: String,
    },

    image: {
      type: String,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [itemSchema],

  total: {
    type: Number,
    required: true,
  },

  shippingAddress: {
    type: String,
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["card", "cash", "monobank"],
    default: "card",
  },

  status: {
    type: String,
    enum: [
      "pending",
      "paid",
      "shipped",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
