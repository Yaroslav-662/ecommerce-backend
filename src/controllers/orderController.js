import Order from "../models/Order.js";
import Product from "../models/Product.js";

import { validateObjectId } from "../utils/validateObjectId.js";

import { getIO } from "../socket/singleton.js";

/**
 * CREATE ORDER
 */
export const createOrder = async (
  req,
  res,
  next
) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      total,
    } = req.body;

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message:
          "Order must contain at least one item",
      });
    }

    // validate products
    for (const item of items) {
      if (!item.price) {
        return res.status(400).json({
          message:
            "Item must contain price",
        });
      }

      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.product}`,
        });
      }
    }

    const order = await Order.create({
      user: req.user.id,

      items,

      total,

      paymentMethod,

      shippingAddress,

      status: "pending",
    });

    // SOCKET EVENTS
    try {
      const io = getIO();

      io.to(`user:${req.user.id}`).emit(
        "order:created",
        order
      );

      io.to("admin").emit(
        "order:created",
        order
      );
    } catch (err) {
      console.warn(
        "Socket emit failed:",
        err.message
      );
    }

    return res.status(201).json(order);
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    next(error);
  }
};

/**
 * GET USER ORDERS
 */
export const getUserOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    }).populate("items.product");

    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL ORDERS
 */
export const getAllOrders = async (
  req,
  res,
  next
) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price"
      );

    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ORDER STATUS
 */
export const updateOrderStatus =
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const { status } = req.body;

      if (!validateObjectId(id)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      const order =
        await Order.findById(id).populate(
          "user",
          "id"
        );

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (
        order.user._id.toString() !==
          req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      order.status = status;

      await order.save();

      // SOCKET EVENTS
      try {
        const io = getIO();

        io.to(
          `user:${order.user._id}`
        ).emit(
          "order:updated",
          order
        );

        io.to("admin").emit(
          "order:updated",
          order
        );
      } catch (err) {
        console.warn(
          "Socket emit failed:",
          err.message
        );
      }

      return res.json({
        message:
          "Order status updated",
        order,
      });
    } catch (error) {
      next(error);
    }
  };
