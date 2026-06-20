import api from "../utils/api";

export const getMeApi = async () => {
  try {
    const response = await api.get("/user/me");
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getAllUsersApi = async ({ limit = 10, page = 1, filter = "" } = {}) => {
  try {
    const response = await api.get("/user/get-allUsers", {
      params: { limit, page, filter },
    });
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getUserByIdApi = async (id) => {
  try {
    const response = await api.get(`/user/get-user/${id}`);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const updateUserApi = async (id, data) => {
  try {
    const response = await api.put(`/user/updateUser/${id}`, data);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const getAdminStatsApi = async () => {
  try {
    const response = await api.get("/user/admin-stats");
    return response.data;
  } catch (err) {
    throw err;
  }
};