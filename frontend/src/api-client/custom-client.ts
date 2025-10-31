import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getAccess,
  willExpireSoon,
  clearTokens,
} from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { clearSessionCookie } from "@/lib/auth/session";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ||  "http://backend.courtlyeasy.app/";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

const PUBLIC_ENDPOINTS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/token/",
  "/api/auth/token/refresh/",
];

function getPathname(url?: string) {
  if (!url) return "";
  try {
    return url.startsWith("http") ? new URL(url).pathname : url;
  } catch {
    return url;
  }
}

function isPublic(url?: string) {
  const path = getPathname(url);
  return !!path && PUBLIC_ENDPOINTS.some((p) => path.startsWith(p));
}

/* -------------------------------------------------------------------------- */
/* 🔹 Request Interceptor: แนบ access token และ refresh ล่วงหน้า               */
/* -------------------------------------------------------------------------- */
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const path = getPathname(config.url);

    // ถ้าไม่ใช่ public และ token ใกล้หมด ให้รีเฟรชก่อน
    if (!isPublic(path) && willExpireSoon(90)) {
      try {
        const newAccess = await refreshAccessToken();
        if (newAccess) {
          config.headers = config.headers ?? {};
          (config.headers as any).Authorization = `Bearer ${newAccess}`;
        }
      } catch (err) {
        console.warn("[request] preemptive refresh failed", err);
      }
    }

    // แนบ access token ปัจจุบัน
    if (!isPublic(path)) {
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

/* -------------------------------------------------------------------------- */
/* 🔹 Response Interceptor: handle 401 → refresh แล้ว retry                     */
/* -------------------------------------------------------------------------- */
let refreshing = false;
let waiters: Array<() => void> = [];

function nukeAndRedirect() {
  clearTokens();
  clearSessionCookie();
  if (typeof window !== "undefined") {
    console.warn("[auth] ❌ token expired, redirecting to /login");
    window.location.href = "/login";
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const orig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!orig || isPublic(orig.url)) {
      return Promise.reject(error);
    }

    const shouldTryRefresh = (status === 401 || status === 403) && !orig._retry;
    if (!shouldTryRefresh) return Promise.reject(error);

    orig._retry = true;

    if (refreshing) {
      await new Promise<void>((res) => waiters.push(res));
    } else {
      refreshing = true;
      try {
        const newAccess = await refreshAccessToken(); // ✅ คืน token ใหม่แล้ว
        if (newAccess && orig.headers) {
          (orig.headers as any).Authorization = `Bearer ${newAccess}`;
        }
        waiters.forEach((fn) => fn());
        waiters = [];
      } catch (err) {
        console.error("[response] refresh failed", err);
        waiters.forEach((fn) => fn());
        waiters = [];
        nukeAndRedirect();
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }

    return axiosInstance.request(orig);
  },
);

/* -------------------------------------------------------------------------- */
/* 🔹 Export Custom Request Helper                                            */
/* -------------------------------------------------------------------------- */
export const customRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await axiosInstance.request<T>(config);
  return response.data as T;
};
