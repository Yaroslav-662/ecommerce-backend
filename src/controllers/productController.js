// src/controllers/productController.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { validateObjectId } from "../utils/validateObjectId.js";
import socket from "../socket/index.js";
import createDebug from "debug";

const debug = createDebug("app:productController");

/* =======================
   CACHE
======================= */
let redisClient;
try {
  const IORedis = await import("ioredis").then(m => m.default);
  redisClient = new IORedis(process.env.REDIS_URL);
  debug("Redis enabled");
} catch {
  debug("Redis not available, using memory cache");
}

const memCache = {};

const setCache = async (key, value, ttl = 60) => {
  if (redisClient) {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } else {
    memCache[key] = { value, exp: Date.now() + ttl * 1000 };
  }
};

const getCache = async (key) => {
  if (redisClient) {
    const raw = await redisClient.get(key);
    return raw ? JSON.parse(raw) : null;
  }
  const hit = memCache[key];
  if (hit && hit.exp > Date.now()) return hit.value;
  return null;
};

const invalidateCache = async (key) => {
  if (redisClient) {
    await redisClient.del(key);
  } else {
    delete memCache[key];
  }
};

/* =======================
   HELPERS
======================= */
const escapeRegex = (str = "") =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeImages = (req) => {
  const out = [];

  if (Array.isArray(req.files) && req.files.length) {
    out.push(...req.files.map(f => f.secure_url || f.path).filter(Boolean));
  }

  const urls = req.body.imagesUrls;
  if (urls) {
    if (Array.isArray(urls)) {
      out.push(...urls.filter(Boolean));
    } else if (typeof urls === "string") {
      out.push(...urls.split(",").map(s => s.trim()).filter(Boolean));
    }
  }

  const imgs = req.body.images;
  if (imgs && imgs !== "string") {
    if (Array.isArray(imgs)) {
      out.push(...imgs.filter(Boolean));
    } else if (typeof imgs === "string") {
      out.push(...imgs.split(",").map(s => s.trim()).filter(Boolean));
    }
  }

  return out.length ? out : null;
};

// ✅ Парсить знижку з body (може прийти як рядок або число)
const parseDiscount = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.min(100, Math.max(0, num));
};

/* =======================
   GET /api/products
======================= */
export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = await Product.countDocuments(),
      q,
      category,
      sort = "-createdAt",
      discount, // ✅ фільтр: discount=true → тільки зі знижкою
    } = req.query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (q) {
      const safe = escapeRegex(q.trim());
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    if (category) {
      if (validateObjectId(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({
          $or: [{ name: category }, { slug: category }],
        }).lean();
        if (!cat) return res.json({ total: 0, products: [] });
        filter.category = cat._id;
      }
    }

    // ✅ Фільтр тільки зі знижкою
    if (discount === "true" || discount === "1") {
      filter.discount = { $gt: 0 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }), // ✅ включає discountPrice
      Product.countDocuments(filter),
    ]);

    res.json({
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products,
    });
  } catch (e) {
    next(e);
  }
};

/* =======================
   GET /api/products/:id
======================= */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const cacheKey = `product:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const product = await Product.findById(id)
      .populate("category", "name")
      .lean({ virtuals: true }); // ✅ включає discountPrice

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    await setCache(cacheKey, product, 300);
    res.json(product);
  } catch (e) {
    next(e);
  }
};

/* =======================
   POST /api/products
======================= */
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      description = "",
      category,
      stock = 0,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const images = normalizeImages(req) || [];
    const discount = parseDiscount(req.body.discount) ?? 0;

    const product = await Product.create({
      name,
      price: Number(price),
      description,
      category,
      stock: Number(stock),
      images,
      discount,
    });

    // Повертаємо з virtuals
    const result = await Product.findById(product._id)
      .populate("category", "name")
      .lean({ virtuals: true });

    socket?.io?.emit("products:created", result);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};

/* =======================
   PUT /api/products/:id
======================= */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const updateData = { ...req.body };
    const images = normalizeImages(req);

    if (images !== null) {
      updateData.images = images;
    } else {
      delete updateData.images;
    }

    delete updateData.imagesUrls;

    // ✅ Обробляємо знижку
    const discount = parseDiscount(req.body.discount);
    if (discount !== undefined) {
      updateData.discount = discount;
    }

    // Числові поля
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

    const updated = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("category", "name").lean({ virtuals: true }); // ✅ virtuals

    if (!updated) {
      return res.status(404).json({ message: "Not found" });
    }

    // Інвалідуємо кеш
    await invalidateCache(`product:${id}`);

    socket?.io?.emit("products:updated", updated);
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

/* =======================
   DELETE /api/products/:id
======================= */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const removed = await Product.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: "Not found" });
    }

    await invalidateCache(`product:${id}`);
    socket?.io?.emit("products:deleted", { id });
    res.json({ message: "Deleted", id });
  } catch (e) {
    next(e);
  }
};
