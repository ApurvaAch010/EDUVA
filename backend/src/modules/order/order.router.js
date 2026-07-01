import express from "express";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "./order.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { placeOrderSchema } from "./order.validator.js";

const orderRouter = express.Router();


orderRouter.post("/", authMiddleware,validateRequest(placeOrderSchema), placeOrder);
orderRouter.get("/", authMiddleware, getMyOrders);
orderRouter.get("/all", authMiddleware, roleMiddleware("admin", "mod"), getAllOrders); 
orderRouter.get("/:orderId", authMiddleware, getOrderById);
orderRouter.delete("/:orderId/cancel", authMiddleware, cancelOrder);
orderRouter.put("/:orderId/status", authMiddleware, roleMiddleware("admin", "mod"), updateOrderStatus);

export default orderRouter;