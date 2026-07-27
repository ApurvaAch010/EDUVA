import dbPool from "../../config/db.config.js";
import fs from "fs";

export const addCommentService = async (userId, pid, comment, imageUrl) => {
    try {
        const query = `INSERT INTO comments (user_id, product_id, comment) VALUES (?,?,?)`;
        const [commentResult] = await dbPool.query(query, [userId, pid, comment]);

        let imageResult = null;
        if (imageUrl.length > 0) {
            const query2 = `INSERT INTO comment_images (comment_id, image_url) VALUES ?`;
            const values = imageUrl.map(url => [commentResult.insertId, url.replace(/\\/g, "/")]);
            const [imageInsertResult] = await dbPool.query(query2, [values]);
            imageResult = imageInsertResult;
        }

        const response = {
            commentId: commentResult.insertId,
            imageId: imageResult ? imageResult.insertId : null,
        };
        return response;
    } catch (error) {
        throw error;
    }
};

export const updateCommentService = async (cid, comment, imageUrl) => {
    try {
        const [commentResult] = await dbPool.query(`UPDATE comments SET comment=? WHERE id=?`, [comment, cid]);
        let imageResult = null;
        if (imageUrl.length > 0) {
            const query2 = `INSERT INTO comment_images (comment_id, image_url) VALUES ?`;
            const values = imageUrl.map(url => [cid, url.replace(/\\/g, "/")]);
            const [imageInsertResult] = await dbPool.query(query2, [values]);
            imageResult = imageInsertResult;
        }
        const response = {
            commentId: cid,
            imageId: imageResult ? imageResult.insertId : null,
        };
        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteCommentService = async (cid) => {
    try {
        const query = `DELETE FROM comments WHERE id = ?`;
        const result = await dbPool.query(query, [cid]);
        return result;
    } catch (error) {
        throw error;
    }
};

export const getCommentsById = async (cid) => {
    try {
        const [result] = await dbPool.execute("SELECT * FROM comments WHERE id=?", [cid]);
        if (result.length > 0) {
            return result[0];
        }
        return null;
    } catch (error) {
        throw error;
    }
};

export const getProductCommentsService = async (pid) => {
    try {
        const [comments] = await dbPool.query(
            `SELECT c.*, u.username, u.email, u.profile_pic 
             FROM comments c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.product_id = ? 
             ORDER BY c.id DESC`,
            [pid]
        );

        if (comments.length === 0) {
            return [];
        }

        const commentIds = comments.map(c => c.id);

        const [images] = await dbPool.query(
            `SELECT * FROM comment_images WHERE comment_id IN (?)`,
            [commentIds]
        );

        const response = comments.map(comment => ({
            ...comment,
            username: comment.username || "User",
            c_images: images
                .filter(img => img.comment_id === comment.id)
                .map(img => ({
                    ...img,
                    image_url: img.image_url ? img.image_url.replace(/\\/g, "/") : ""
                })),
        }));

        return response;
    } catch (error) {
        throw error;
    }
};

export const deleteCommentImage = async (cid) => {
    try {
        const [existing] = await dbPool.query(
            "SELECT * FROM comment_images WHERE comment_id = ?",
            [cid]
        );

        if (existing.length === 0) return false;

        existing.forEach(img => {
            if (img.image_url) fs.unlink(img.image_url, () => { });
        });

        const [result] = await dbPool.query(
            "DELETE FROM comment_images WHERE comment_id = ?",
            [cid]
        );

        return true;
    } catch (error) {
        throw error;
    }
};