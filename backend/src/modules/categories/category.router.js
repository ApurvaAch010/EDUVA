import express from "express"
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "./category.controller.js"
import { createCategorySchema, updateCategorySchema } from "./category.validator.js"
import authMiddleware from "../../middlewares/auth.middleware.js"
import { roleMiddleware } from "../../middlewares/role.middleware.js"
import validateRequest from "../../middlewares/validation.middleware.js"



const categoryRouter = express.Router()


categoryRouter.post("/", authMiddleware, roleMiddleware("admin", "mod"), validateRequest(createCategorySchema), createCategory);
categoryRouter.put("/:id", authMiddleware, roleMiddleware("admin", "mod"), validateRequest(updateCategorySchema), updateCategory); 
categoryRouter.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCategory);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.get("/", getAllCategories);

export default categoryRouter