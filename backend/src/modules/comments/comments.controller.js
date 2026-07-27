import { findProductById } from "../products/product.service.js";
import { addCommentService, deleteCommentImage, deleteCommentService, getCommentsById, getProductCommentsService, updateCommentService } from "./comments.service.js";

export const addComment = async (req, res, next) => {
    try {
        const pid = req.params.pid;
        const userId = req.user.id;
        const { comment } = req.body;
        const imageUrls = req.files ? req.files.map(file => file.path) : [];

        const productCheck = await findProductById(pid);
        if (!productCheck) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const result = await addCommentService(userId, pid, comment, imageUrls);

        return res.status(200).json({
            success: true,
            message: "Comment added successfully",
            result
        });
    } catch (err) {
        next(err);
    }
};

export const updateComment = async (req, res, next) => {
    try {
        const commentId = req.params.cid;
        const userId = req.user.id;
        const { comment } = req.body;
        const imageUrls = req.files ? req.files.map(file => file.path) : [];

        const commentCheck = await getCommentsById(commentId);
        if (!commentCheck) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        if (commentCheck.user_id != userId) {
            return res.status(403).json({ success: false, message: "Not authorized to update this comment" });
        }

        const new_comment = comment ? comment : commentCheck.comment;

        if (imageUrls.length > 0) {
            await deleteCommentImage(commentId);
        }

        const result = await updateCommentService(commentId, new_comment, imageUrls);

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            result
        });
    } catch (err) {
        next(err);
    }
};

export const getProductComments = async (req, res, next) => {
    try {
        const p_id = req.params.pid;
        const productCheck = await findProductById(p_id);
        if (!productCheck) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const result = await getProductCommentsService(p_id);
        return res.status(200).json({
            success: true,
            message: "Comments fetched successfully",
            result
        });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.cid;
        const userId = req.user.id;
        const commentCheck = await getCommentsById(commentId);

        if (!commentCheck) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        if (commentCheck.user_id != userId) {
            return res.status(403).json({ success: false, message: "Not your comment to delete" });
        }

        await deleteCommentImage(commentId);
        await deleteCommentService(commentId);

        return res.status(200).json({
            success: true,
            message: "Successfully deleted comment"
        });
    } catch (err) {
        next(err);
    }
};
