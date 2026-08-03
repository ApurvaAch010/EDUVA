import express from "express";
import { addComment, deleteComment, getProductComments, updateComment } from "./comments.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { addCommentSchema } from "./comments.validator.js";
import uploader from "../../middlewares/uploader.middleware.js";
import { cacheMiddleware, invalidateCache } from "../../middlewares/cache.middleware.js";

const commentRouter = express.Router();

commentRouter.post("/add-comment/:pid", authMiddleware, uploader.array('comment_images', 5), validateRequest(addCommentSchema), invalidateCache("comments"), addComment);
commentRouter.put("/update-comment/:cid", authMiddleware, uploader.array('comment_images', 5), validateRequest(addCommentSchema), invalidateCache("comments"), updateComment);
commentRouter.delete("/delete-comment/:cid", authMiddleware, invalidateCache("comments"), deleteComment);
commentRouter.get("/get-product-comments/:pid", cacheMiddleware("comments", 60), getProductComments);

export default commentRouter;