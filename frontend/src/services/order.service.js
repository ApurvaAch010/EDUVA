import api from "../utils/api";

export const placeOrderApi = async (data) => {
  try {
    const response = await api.post("/orders", data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getMyOrdersApi = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getAllOrdersApi = async ({ limit = 10, page = 1, status = "" } = {}) => {
  try {
    const response = await api.get("/orders/all", {
      params: { limit, page, status },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getOrderByIdApi = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const cancelOrderApi = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateOrderStatusApi = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (err) {
    throw err;
  }
};