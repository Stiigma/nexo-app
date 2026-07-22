import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiError } from "@/common/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) return client(config);
    }
    return Promise.reject(error);
  }
);

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    throw new ApiError(
      error.response?.status ?? 0,
      (error.response?.data as { message?: string })?.message ?? "Error de red"
    );
  }
  throw error;
}

export const api = {
  get: async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
    const res = await client.get<T>(path, { params });
    return res.data;
  },
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    const res = await client.post<T>(path, body);
    return res.data;
  },
  put: async <T>(path: string, body: unknown): Promise<T> => {
    const res = await client.put<T>(path, body);
    return res.data;
  },
  patch: async <T>(path: string, body: unknown): Promise<T> => {
    const res = await client.patch<T>(path, body);
    return res.data;
  },
  delete: async <T>(path: string): Promise<T> => {
    const res = await client.delete<T>(path);
    return res.data;
  },
};
