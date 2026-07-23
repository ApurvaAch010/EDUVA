import express from "express"
import { addComment, deleteComment, getProductComments, updateComment } from "./comments.controller.js"
import authMiddleware from "../../middlewares/auth.middleware.js"
import validateRequest from "../../middlewares/validation.middleware.js";
import { addCommentSchema } from "./comments.validator.js";
import uploader from "../../middlewares/uploader.middleware.js";


const commentRouter=express.Router()

commentRouter.post("/add-comment/:pid",authMiddleware,validateRequest(addCommentSchema),uploader.array('comment_images',5),addComment);
commentRouter.put("/update-comment/:cid",authMiddleware,validateRequest(addCommentSchema),uploader.array('comment_images',5),updateComment);
commentRouter.delete("/delete-comment/:cid",authMiddleware,deleteComment);
commentRouter.get("/get-product-comments/:pid",authMiddleware,getProductComments);

export default commentRouter