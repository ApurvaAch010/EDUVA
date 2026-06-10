import dbPool from "../../config/db.config.js";
import fs from "fs";

export const addBannerService = async (title, isActive, imagePath, userId) => {
    try {
        const result = await dbPool.execute(
            "INSERT INTO banners (title, is_active, image_path, created_by) VALUES (?, ?, ?, ?)",
            [title, isActive ?? true, imagePath, userId]
        );

        return {
            id: result.insertId,
            title,
            isActive: isActive ?? true,
            image: imagePath,
        };
    } catch (err) {
        throw err;
    }
};

export const getAllBannersService = async () => {
    try {
        const [banners] = await dbPool.query(
            "SELECT banner_id,title,is_active,image_path FROM banners"
        );
        return banners;
    } catch (err) {
        throw err;
    }
};

export const updateBannerService = async (bannerId, title, isActive, newImage) => {
    try {
        const [existing] = await dbPool.query(
            "SELECT * FROM banners WHERE banner_id = ?",
            [bannerId]
        );
        console.log("isActive",isActive)
        if (!existing) throw new Error("Banner not found");
        console.log("existing banner",existing[0])
        // delete old image 
        if (newImage && existing.image_path) {
            fs.unlink(existing.image_path, () => { });
        }

        const updated = {
            title: title ?? existing.title,
            isActive: isActive ?? existing.is_active,
            imagePath: newImage ?? existing.image_path,
        };
        console.log(updated)

        await dbPool.execute(
            "UPDATE banners SET title=?, is_active=?, image_path=? WHERE banner_id=?",
            [updated.title, updated.isActive, updated.imagePath, bannerId]
        );

        return { id: bannerId, ...updated };
    } catch (err) {
        throw err;
    }
};

export const findBannerById=async (bannerId) => {
    try {
        const [existing] = await dbPool.query(
            "SELECT * FROM banners WHERE banner_id = ?",
            [bannerId]
        );
        if (!existing) throw new Error("Banner not found");
        return existing[0];
    } catch (error) {
        throw error;
    }
}

export const deleteBannerService = async (bannerId) => {
    try {
        
        const [existing] = await dbPool.query(
            "SELECT * FROM banners WHERE banner_id = ?",
            [bannerId]
        );
        if (!existing) throw new Error("Banner not found");

     
        if (existing.image_path) fs.unlink(existing.image_path, () => { });

        const result = await dbPool.execute(
            "DELETE FROM banners WHERE banner_id = ?",
            [bannerId]
        );
        if (result[0].affectedRows === 0) throw new Error("Failed to delete banner");

        return true;
    } catch (err) {
        throw err;
    }
};

export const toggleBannerService = async (bannerId) => {
    try {
        const [banner] = await dbPool.query(
            "SELECT is_active FROM banners WHERE banner_id = ?",
            [bannerId]
        );
        if (!banner) throw new Error("Banner not found");

        const newStatus = !banner.is_active;
        await dbPool.execute(
            "UPDATE banners SET is_active = ? WHERE banner_id = ?",
            [newStatus, bannerId]
        );

        return { id: bannerId, isActive: newStatus };
    } catch (err) {
        throw err;
    }
};