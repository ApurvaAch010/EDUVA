import api from "../utils/api";

export const getProductComments = async (pid) => {
  const response = await api.get(`/comments/get-product-comments/${pid}`);
  return response.data;
};

export const addComment = async (pid, formData) => {
  const response = await api.post(`/comments/add-comment/${pid}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateComment = async (cid, formData) => {
  const response = await api.put(`/comments/update-comment/${cid}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteComment = async (cid) => {
  const response = await api.delete(`/comments/delete-comment/${cid}`);
  return response.data;
};
