// src/routes/uploadRoutes.js
import express from "express";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { uploadCloud } from "../middleware/upload.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  uploadFile,
  uploadProductImages,
  getProductImages,
  getAllFiles,
  deleteFile,
  deleteByUrl,
  renameFile,
} from "../controllers/uploadController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Завантаження файлів (зображення товарів, аватари)
 */

/**
 * @swagger
 * /api/upload/file:
 *   post:
 *     summary: Завантажити файл (авторизований користувач)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Файл завантажено
 */
router.post("/file", verifyToken, uploadMiddleware.single("file"), uploadFile);

/**
 * POST /api/upload/products — завантажити 1..10 фото на Cloudinary (адмін)
 *
 * @swagger
 * /api/upload/products:
 *   post:
 *     summary: Завантажити 1..10 фото товару на Cloudinary (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: "{ urls: string[] } — Cloudinary URLs"
 */
router.post(
  "/products",
  verifyToken,
  isAdmin,
  uploadCloud.array("images", 10), // ✅ Cloudinary, не локальний диск
  uploadProductImages
);

/**
 * GET /api/upload/products — список фото товарів (адмін)
 *
 * @swagger
 * /api/upload/products:
 *   get:
 *     summary: Отримати список фото товарів (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список фото
 */
router.get("/products", verifyToken, isAdmin, getProductImages);

/**
 * @swagger
 * /api/upload/by-url:
 *   delete:
 *     summary: Видалити фото товару по URL (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string }
 *     responses:
 *       200:
 *         description: Видалено
 */
router.delete("/by-url", verifyToken, isAdmin, deleteByUrl);

/**
 * @swagger
 * /api/upload:
 *   get:
 *     summary: Отримати список усіх завантажених файлів (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Список файлів
 */
router.get("/", verifyToken, isAdmin, getAllFiles);

/**
 * @swagger
 * /api/upload/rename:
 *   put:
 *     summary: Перейменувати файл (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldName, newName]
 *             properties:
 *               oldName: { type: string }
 *               newName: { type: string }
 *     responses:
 *       200:
 *         description: Файл перейменовано
 */
router.put("/rename", verifyToken, isAdmin, renameFile);

/**
 * @swagger
 * /api/upload/{name}:
 *   delete:
 *     summary: Видалити файл (адмін)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Файл видалено
 */
router.delete("/:name", verifyToken, isAdmin, deleteFile);

export default router;
