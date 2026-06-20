import api from "../utils/api";

export const getAllProducts = async (params = {}) => {
    const { limit = 10, page = 1, search = "", category_id = "", sort = "newest" } = params;
    const query = new URLSearchParams();
    if (limit) query.set("limit", limit);
    if (page) query.set("page", page);
    if (search) query.set("search", search);
    if (category_id) query.set("category_id", category_id);
    if (sort) query.set("sort", sort);
    const response = await api.get(`/products?${query.toString()}`);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const updateProduct = async (id, formData) => {
  try {
    const response = await api.put(`/products/${id}`, formData);
    return response.data;
  } catch (err) {
    console.log("Error response:", err.response?.data);
    console.log("Error status:", err.response?.status);
    throw err; 
  }
};

export const createProduct = async (formData) => {
  const response = await api.post("/products", formData);
  return response.data;
};