import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "./category.controller.js";
import { createCategorySchema, updateCategorySchema } from "./category.validator.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { cacheMiddleware, invalidateCache } from "../../middlewares/cache.middleware.js";

const categoryRouter = express.Router();

categoryRouter.post("/", authMiddleware, roleMiddleware("admin", "mod"), validateRequest(createCategorySchema), invalidateCache(["categories", "products"]), createCategory);
categoryRouter.put("/:id", authMiddleware, roleMiddleware("admin", "mod"), validateRequest(updateCategorySchema), invalidateCache(["categories", "products"]), updateCategory); 
categoryRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), invalidateCache(["categories", "products"]), deleteCategory);
categoryRouter.get("/:id", cacheMiddleware("categories", 300), getCategoryById);
categoryRouter.get("/", cacheMiddleware("categories", 300), getAllCategories);

export default categoryRouter;