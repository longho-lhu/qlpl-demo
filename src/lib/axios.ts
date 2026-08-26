import axios from "axios";

function dispatchLoading(active: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("api-loading-change", { detail: { active } }));
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  dispatchLoading(true);
  return config;
});

api.interceptors.response.use(
  (response) => {
    dispatchLoading(false);
    return response;
  },
  (error) => {
    dispatchLoading(false);
    return Promise.reject(error);
  },
);

export function getErrorMessage(err: unknown, fallback = "Đã xảy ra lỗi, vui lòng thử lại"): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default api;

