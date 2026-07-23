import { findProductById } from "../products/product.service.js"
import { addCommentService, deleteCommentImage, deleteCommentService, getCommentsById, getProductCommentsService, updateCommentService } from "./comments.service.js"



export const addComment = async (req, res) => {
    try {
        const pid = req.params.pid
        const userId = req.user.id
        const { comment } = req.body
        const imageUrls = req.files ? req.files.map(file => file.path) : [];
        const productCheck = await findProductById(pid)
        if (!productCheck) {
            throw new Error("Product not found")
        }
        const result = await addCommentService(userId, pid, comment, imageUrls)

        return res.status(200).json({
            success: true,
            message: "Comment added successfully",
            result
        })

    }
    catch (err) {
        throw err;
    }
}

export const updateComment = async (req, res) => {
    try {
        const commentId = req.params.cid
        const { comment } = req.body
        const imageUrls = req.files ? req.files.map(file => file.path) : [];

        const commentCheck = await getCommentsById(commentId);
        if (!commentCheck) {
            throw new Error("Comment not found")
        }
        const new_comment = comment ? comment : commentCheck.comment

        if (imageUrls > 0) {
            await deleteCommentImage(commentId);
        }
        const result = await updateCommentService(commentId, new_comment, imageUrls)

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            result
        })

    }
    catch (err) {
        throw err
    }
}


export const getProductComments = async (req, res) => {
    try {
        const p_id = req.params.pid;
        const productCheck = await findProductById(p_id)
        if (!productCheck) {
            throw new Error("Product not found")
        }
        const result = await getProductCommentsService(p_id);
        return res.status(200).json({
            success: true,
            message: "Comment fetched successfully",
            result
        })

    }
    catch (err) {
        throw err
    }
}


export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.cid
        const commentCheck = await getCommentsById(commentId);
        const userId=req.user.id;

        if (!commentCheck) {
            throw new Error("Comment not found");
        }
        console.log(commentCheck)
        if(commentCheck.user_id!=userId){
            throw new Error("Not your comment to delete");
        }
        await deleteCommentImage(commentId)
        const commentd = await deleteCommentService(commentId);
        return res.status(200).json({
            success: true,
            message: "Successfully deleted comment"

        })

    }
    catch (err) {
        throw err
    }
}
