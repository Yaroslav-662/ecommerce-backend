import Order from "../models/Order.js";

export const getOrders = async (req, res) => {
  const orders = await Order.find().populate("user").populate("items.product");
  res.json(orders);
};

export const createOrder = async (req, res) => {
  const order = await Order.create(req.body);
  res.status(201).json(order);
};

export const updateOrderStatus = async (req, res) => {
  const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
};

export const deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
};
