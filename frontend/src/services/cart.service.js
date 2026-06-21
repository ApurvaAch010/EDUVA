import api from "../utils/api";

export const getCartApi = async () => {
  try {
    const response = await api.get("/cart");
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const addToCartApi = async (product_id, quantity = 1) => {
  try {
    const response = await api.post("/cart", { product_id, quantity });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateCartItemApi = async (itemId, quantity) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const removeCartItemApi = async (itemId) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const clearCartApi = async () => {
  try {
    const response = await api.delete("/cart");
    return response.data;
  } catch (err) {
    throw err;
  }
};