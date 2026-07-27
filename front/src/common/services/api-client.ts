import axios, {
  AxiosError,
  type AxiosProgressEvent,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/common/types";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3000/api/v1" : "/api/v1");

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
    if (error.response?.status === 401 && config && !config._retry) {
      config._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) return client(config);
    }
    return Promise.reject(error);
  }
);

function handleError(error: unknown): never {
  if (error instanceof AxiosError) {
    const responseMessage = (error.response?.data as { message?: string | string[] } | undefined)?.message;
    const message = Array.isArray(responseMessage)
      ? responseMessage.join(" ")
      : responseMessage;
    throw new ApiError(
      error.response?.status ?? 0,
      message ?? "Error de red"
    );
  }
  throw error;
}

export const api = {
  get: async <T>(path: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const res = await client.get<T>(path, { params });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
  post: async <T>(path: string, body?: unknown): Promise<T> => {
    try {
      const res = await client.post<T>(path, body);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
  put: async <T>(path: string, body: unknown): Promise<T> => {
    try {
      const res = await client.put<T>(path, body);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
  patch: async <T>(path: string, body: unknown): Promise<T> => {
    try {
      const res = await client.patch<T>(path, body);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
  delete: async <T>(path: string): Promise<T> => {
    try {
      const res = await client.delete<T>(path);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
  uploadMultipart: async <T>(
    path: string,
    formData: FormData,
    onProgress?: (percentage: number) => void,
  ): Promise<T> => {
    try {
      const res = await client.post<T>(path, formData, {
        // Clearing the JSON default lets the browser add the multipart boundary.
        headers: { "Content-Type": undefined },
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (event.total && onProgress) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
