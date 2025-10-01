// courtly-project/frontend/src/api-client/custom-client.ts
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { getAccess, getRefresh, setTokens, clearTokens } from "@/lib/auth/tokenStore";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { extractRoleFromAccess } from "@/lib/auth/role";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // ex. http://localhost:8000
  withCredentials: true,
});

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/token/refresh/",
];

const isPublic = (url?: string) => !!url && PUBLIC_ENDPOINTS.some((p) => url.includes(p));

// ---------- แนบ Bearer ----------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!isPublic(config.url)) {
      const token = getAccess();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------- 401 → refresh (กันยิงซ้ำ) ----------
let refreshing = false;
let waiters: Array<() => void> = [];

function nukeAndRedirect() {
  clearTokens();
  clearSessionCookie();
  if (typeof window !== "undefined") window.location.href = "/login";
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const orig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!orig || isPublic(orig.url)) return Promise.reject(error);

    if (status === 401 && !orig._retry) {
      orig._retry = true;

      if (refreshing) {
        await new Promise<void>((res) => waiters.push(res));
      } else {
        refreshing = true;
        try {
          const refresh = getRefresh();
          if (!refresh) throw new Error("no refresh token");

          const { data } = await axiosInstance.post("/api/auth/token/refresh/", { refresh });
          const newAccess = (data as any)?.access;
          if (!newAccess) throw new Error("no access in refresh");

          setTokens({ access: newAccess, refresh }, true);

          // อัปเดต cookie role จาก access ใหม่นี้ด้วย
          const role = extractRoleFromAccess(newAccess);
          if (role) setSessionCookie(role, 8);

          waiters.forEach((fn) => fn());
          waiters = [];
        } catch {
          waiters.forEach((fn) => fn());
          waiters = [];
          nukeAndRedirect();
          return Promise.reject(error);
        } finally {
          refreshing = false;
        }
      }

      const token = getAccess();
      if (token) {
        orig.headers = orig.headers ?? {};
        (orig.headers as any).Authorization = `Bearer ${token}`;
      }
      return axiosInstance.request(orig);
    }

    return Promise.reject(error);
  },
);

// ---------- ให้ Orval เรียก ----------
export const customRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.request<T>(config);
  return response.data;
};
