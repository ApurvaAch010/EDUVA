import dbPool from "../../config/db.config.js";
import fs from "fs";

export const addCommentService = async (userId, pid, comment, imageUrl) => {
    try {
        const query = `INSERT INTO comments (user_id, product_id, comment) VALUES (?,?,?)`;
        const [commentResult] = await dbPool.query(query, [userId, pid, comment]);

        let imageResult = null;
        if (imageUrl.length > 0) {
            const query2 = `INSERT INTO comment_images (comment_id, image_url) VALUES ?`;
            const values = imageUrl.map(url => [commentResult.insertId, url]);
            const [imageInsertResult] = await dbPool.query(query2, [values]);
            imageResult = imageInsertResult;
        }

        const response = {
            commentId: commentResult.insertId,
            imageId: imageResult ? imageResult.insertId : null,
        };
        return response
    } catch (error) {
        throw error
    }
}

export const updateCommentService = async (cid, comment, imageUrl) => {
    try {
        const [commentResult] = await dbPool.query(`UPDATE comments SET comment=? WHERE id=?`, [comment, cid]);
        let imageResult = null;
        if (imageUrl.length > 0) {
            const query2 = `INSERT INTO comment_images (comment_id, image_url) VALUES ?`;
            const values = imageUrl.map(url => [cid, url]);
            const [imageInsertResult] = await dbPool.query(query2, [values]);
            imageResult = imageInsertResult;
        }
        const response = {
            commentId: cid,
            imageId: imageResult ? imageResult.insertId : null,
        };
        return response
    } catch (error) {
        throw error
    }
}

export const deleteCommentService = async (cid) => {
    try {
        const query = `DELETE FROM comments WHERE id = ?`
        const result = await dbPool.query(query, [cid])
        return result
    } catch (error) {
        throw error
    }
}

export const getCommentsById = async (cid) => {
    try {
     const[result]= await dbPool.execute("SELECT * from comments WHERE id=?", [cid])
       if(result.length>0){
        return true;
       }
       return false;
    }
    catch (error) {
        throw error;
    }
}

export const getProductCommentsService = async (pid) => {
    try {
        const [comments] = await dbPool.query(
            `SELECT * FROM comments WHERE product_id = ?`,
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
            data: comment,
            c_images: images.filter(img => img.comment_id === comment.id),
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

        if (result.affectedRows === 0) throw new Error("Failed to delete comment image");

        return true;
    } catch (error) {
        throw error;
    }
};