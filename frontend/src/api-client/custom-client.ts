// /src/api-client/custom-client.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import {
  getAccess,
  getRefresh,
  setTokens,
  clearTokens,
  willExpireSoon,
  schedulePreemptiveRefresh,
} from "@/lib/auth/tokenStore";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { extractRoleFromAccess } from "@/lib/auth/role";

/* --------------------------------------------------------------------------
   ⚙️ Base Configuration
   -------------------------------------------------------------------------- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8001";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

/* --------------------------------------------------------------------------
   Public Endpoints
   -------------------------------------------------------------------------- */
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

const isPublic = (url?: string) => {
  const path = getPathname(url);
  return !!path && PUBLIC_ENDPOINTS.some((p) => path.startsWith(p));
};

/* --------------------------------------------------------------------------
   Request Interceptor
   -------------------------------------------------------------------------- */
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const path = getPathname(config.url);

    // Refresh access token if nearly expired
    if (!isPublic(path) && willExpireSoon(90)) {
      try {
        await refreshAccessToken();
      } catch {
        // ignore refresh error; handled by response interceptor
      }
    }

    // Attach Bearer token if private API
    if (!isPublic(path)) {
      const token = getAccess();
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* --------------------------------------------------------------------------
   Token Refresh Queue
   -------------------------------------------------------------------------- */
let refreshing = false;
let waiters: Array<() => void> = [];

function nukeAndRedirect() {
  clearTokens();
  clearSessionCookie();
  if (typeof window !== "undefined") window.location.href = "/login";
}

/* --------------------------------------------------------------------------
   Response Interceptor (handle 401/403)
   -------------------------------------------------------------------------- */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const orig = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (!orig || isPublic(orig.url)) return Promise.reject(error);

    const shouldTryRefresh = (status === 401 || status === 403) && !orig._retry;
    if (!shouldTryRefresh) return Promise.reject(error);

    orig._retry = true;

    if (refreshing) {
      await new Promise<void>((res) => waiters.push(res));
    } else {
      refreshing = true;
      try {
        await refreshAccessToken();
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

    return axiosInstance.request(orig);
  }
);

/* --------------------------------------------------------------------------
   Custom Request Wrapper
   -------------------------------------------------------------------------- */
export const customRequest = async <T>({
  url,
  method = "GET",
  data,
  params,
  signal,
  headers,
}: AxiosRequestConfig & {
  params?: Record<string, any>;
}): Promise<T> => {
  const response = await axiosInstance.request<T>({
    url,
    method,
    data,
    params, // for query e.g. ?club=1&month=2025-10
    signal,
    headers,
  });

  return response.data as T;
};
