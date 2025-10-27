// src/app.js
console.log("🚧 Запуск застосунку...");

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Імпорт маршрутів
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Ініціалізація dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- Перевірка змінної середовища ---
console.log("MONGO_URI:", process.env.MONGO_URI);

// --- Підключення до MongoDB ---
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB error:", err));

// --- Маршрути API ---
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// --- Тестовий кореневий маршрут ---
app.get("/", (req, res) => {
  res.send("🛍️ E-commerce API is running");
});

// --- Обробник помилок ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
