import {
    createProductService,
    deleteProductByService,
    findProductById,
    updateProductByService,
    getAllProductsService,
} from "./product.service.js";
import fs from "fs";

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, discount_price, stock, category_id, is_active } = req.body;
        const imagePath = req.file?.path ?? null;
        const userId = req.user.id;

        const data = { 
            name, 
            description: description === "" || description === "null" ? null : description, 
            price, 
            discount_price: discount_price === "" || discount_price === "null" ? null : discount_price, 
            stock, 
            category_id, 
            is_active 
        };
        const result = await createProductService(data, imagePath, userId);

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: result,
        });
    } catch (err) {
        if (req.file) fs.unlink(req.file.path, () => { });
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const newImagePath = req.file?.path ?? null;
        const data = req.body;

        if (data.description === "" || data.description === "null") data.description = null;
        if (data.discount_price === "" || data.discount_price === "null") data.discount_price = null;

        const result = await updateProductByService(data, newImagePath, id);

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: result,
        });
    } catch (err) {
        // cleanup new upload if service failed
        if (req.file) fs.unlink(req.file.path, () => { });
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { identifier } = req.params;
        const result = await findProductById(identifier);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || null;
        const category_id = req.query.category_id || null;
        const sort = req.query.sort || "newest";

        const result = await getAllProductsService(limit, page, search, category_id, sort);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            ...result,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteProductByService(id);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};