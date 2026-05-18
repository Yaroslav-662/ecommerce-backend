// src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: { type: [String], default: [] },
  stock: { type: Number, default: 0 },

  // ✅ Знижка
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },

  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: "text", description: "text" });

// ✅ Віртуальне поле — ціна зі знижкою
productSchema.virtual("discountPrice").get(function () {
  if (!this.discount || this.discount <= 0) return this.price;
  return Math.round(this.price * (1 - this.discount / 100));
});

// Включаємо virtuals в JSON і Object
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
