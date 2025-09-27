// src/api-client/custom-client.ts
import axios, { AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/token/refresh/",
];

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ENDPOINTS.some((path) => config.url?.includes(path));
    if (!isPublic) {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor (auto refresh)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/auth/token/refresh/`,
            { refresh },
          );
          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);

          error.config.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance.request(error.config);
        } catch {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
        }
      }
    }
    return Promise.reject(error);
  },
);

export const customRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.request<T>(config);
  return response.data;
};
