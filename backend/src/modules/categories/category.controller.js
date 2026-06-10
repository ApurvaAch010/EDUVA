import { createCategoryService, updateCategoryService, deleteCategoryService, getCategoryByIdService, getAllCategoriesService } from "./category.service.js";



export const createCategory = async (req, res) => {
    try {
        const { name } = req.body
        await createCategoryService(name);
        return res.status(201).json({ success: true, message: "Category created successfully" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body
        await updateCategoryService(id, name);
        return res.status(200).json({ success: true, message: "Succesfully updated" });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        await deleteCategoryService(id);
        return res.status(200).json({ success: true, message: "Succesfully deleted category" });
    }
    catch (error) {
        return res.status(500).json({ success: false, data: error.message });
    }
}

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params
        const category = await getCategoryByIdService(id);
        return res.status(200).json({ success: true, data: category });
    }
    catch (error) {
        return res.status(500).json({ success: false, data: error.message });
    }
}

export const getAllCategories = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const filter = req.query.filter || null;

        const result = await getAllCategoriesService(limit, filter, page);

        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            ...result, 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
   
