import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(err: unknown, fallback = "Đã xảy ra lỗi, vui lòng thử lại"): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default api;

