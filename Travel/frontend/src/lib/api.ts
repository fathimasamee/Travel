import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("travelsphere_access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("travelsphere_refresh_token");
        if (refreshToken) {
          try {
            const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            localStorage.setItem("travelsphere_access_token", accessToken);
            if (newRefresh) localStorage.setItem("travelsphere_refresh_token", newRefresh);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch (refreshErr) {
            localStorage.removeItem("travelsphere_access_token");
            localStorage.removeItem("travelsphere_refresh_token");
            localStorage.removeItem("travelsphere_user");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
