import express from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "./products.controller.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.validator.js";
import uploader from "../../middlewares/uploader.middleware.js";
import { cacheMiddleware, invalidateCache } from "../../middlewares/cache.middleware.js";

const productRouter = express.Router();

productRouter.post("/", authMiddleware, roleMiddleware('admin','mod'), uploader.single("productImg"), validateRequest(createProductSchema), invalidateCache("products"), createProduct);
productRouter.put("/:id", authMiddleware, roleMiddleware('admin','mod'), uploader.single("productImg"), validateRequest(updateProductSchema), invalidateCache("products"), updateProduct);
productRouter.get("/:identifier", cacheMiddleware("products", 120), getProductById);
productRouter.get("/", cacheMiddleware("products", 120), getAllProducts);
productRouter.delete("/:id", authMiddleware, roleMiddleware('admin'), invalidateCache("products"), deleteProduct);

export default productRouter;