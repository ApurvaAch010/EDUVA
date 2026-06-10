import fs from "fs";
import { addBannerService, getAllBannersService, updateBannerService, deleteBannerService, toggleBannerService, findBannerById } from "./banner.service.js";

export const addBanner = async (req, res) => {
    try {
        const { title, isActive } = req.body;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Banner image is required",
            });
        }

        const result = await addBannerService(
            title, isActive, req.file.path, userId
        );

        return res.status(201).json({
            success: true,
            message: "Banner added successfully",
            data: result,
        });
    } catch (err) {
        if (req.file) fs.unlink(req.file.path, () => { });
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const {title,isActive}=req.body;
        const banner = await findBannerById(id);

        const updatedTitle = title ?? banner.title;
        const updatedIsActive = isActive ?? banner.is_active;
        const updatedImage = req.file?.path ?? banner.image_path;

      const result=await updateBannerService(
            id,
            updatedTitle,
            updatedIsActive,
            updatedImage
        );

        return res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: result,
        });
    } catch (err) {
        if (req.files) req.files.forEach((file) => fs.unlink(file.path, () => { }));
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;

        await deleteBannerService(id);

        return res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const toggleBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await toggleBannerService(id);

        return res.status(200).json({
            success: true,
            message: `Banner ${result.isActive ? "activated" : "deactivated"} successfully`,
            data: result,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllBanners = async (req, res) => {
    try {
        const result = await getAllBannersService();

        return res.status(200).json({
            success: true,
            message: "Banners retrieved successfully",
            data: result,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};