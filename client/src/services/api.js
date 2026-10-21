import axios from "axios";

/**
 * Resolves and formats the backend API URL.
 * Automatically adds missing protocol (http/https) and defaults to http://localhost:5000 if not specified.
 */
const getBackendUrl = () => {
  let url = import.meta.env.VITE_BACKEND_URL;
  if (!url || typeof url !== "string" || !url.trim()) {
    return "http://localhost:5000";
  }
  url = url.trim();
  if (!/^https?:\/\//i.test(url)) {
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  return url.replace(/\/+$/, "");
};

export const API_URL = getBackendUrl();

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API_URL;
