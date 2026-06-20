import api from "../utils/api";

export const getAllBannersApi = async () => {
  const response = await api.get("/banners");
  return response.data;
};

export const createBanner = async (formData) => {
  const response = await api.post("/banners", formData);
  return response.data;
};

export const updateBanner = async (id, formData) => {
  const response = await api.put(`/banners/${id}`, formData);
  return response.data;
};

export const deleteBanner = async (id) => {
  const response = await api.delete(`/banners/${id}`);
  return response.data;
};

export const toggleBanner = async (id) => {
  const response = await api.patch(`/banners/${id}/toggle`);
  return response.data;
};