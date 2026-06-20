import express from "express";
import authRouter from "../modules/auth/auth.router.js";
import userRouter from "../modules/user/user.router.js";
import  productRouter  from "../modules/products/products.router.js";
import categoryRouter from "../modules/categories/category.router.js";
import bannerRouter from "../modules/banner/banner.router.js";
import cartRouter from "../modules/cart/cart.router.js";
import orderRouter from "../modules/order/order.router.js";

const mainRouter = express.Router();


mainRouter.use("/auth", authRouter);
mainRouter.use("/user", userRouter);
mainRouter.use("/banners",bannerRouter);
mainRouter.use("/categories",categoryRouter);
mainRouter.use("/products",productRouter);
mainRouter.use("/cart",cartRouter);
mainRouter.use("/orders",orderRouter);


export default mainRouter;
