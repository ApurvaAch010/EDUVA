import { addToCart, deleteCart, getCart, removeItemCart, updateCart } from "./cart.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import express from "express"

const cartRouter=express.Router();


cartRouter.get("/", authMiddleware, getCart)
cartRouter.post("/", authMiddleware, addToCart)
cartRouter.put("/:itemId", authMiddleware, updateCart)
cartRouter.delete("/:itemId", authMiddleware, removeItemCart)
cartRouter.delete("/", authMiddleware, deleteCart)


                     
export default cartRouter