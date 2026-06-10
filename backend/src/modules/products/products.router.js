
import express from "express"
import authMiddleware from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "./products.controller.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.validator.js";
import uploader from "../../middlewares/uploader.middleware.js";

const productRouter = express.Router();


productRouter.post("/", authMiddleware, roleMiddleware('admin','mod'), uploader.single("productImg"), validateRequest(createProductSchema), createProduct)
productRouter.put("/:id", authMiddleware, roleMiddleware('admin','mod'), uploader.single("productImg"), validateRequest(updateProductSchema), updateProduct)
productRouter.get("/:identifier",getProductById)
productRouter.get("/", getAllProducts)
productRouter.delete("/:id", authMiddleware, roleMiddleware('admin'), deleteProduct)

export default productRouter