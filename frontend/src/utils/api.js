import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Check if the request that failed was your "getMe" profile endpoint or an auth endpoint
    const isGetMeRequest = error.config?.url?.includes("/user/me");
    const isAuthRequest = error.config?.url?.includes("/auth/");

    if (error.response?.status === 401 && !isGetMeRequest && !isAuthRequest) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    
    return Promise.reject(error);
  }
);

export default api;