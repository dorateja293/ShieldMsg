import axios from "axios";
import { getApiBaseUrl } from "../config/apiBaseUrl.js";
import { logoutSocket } from "./socket.js";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  // JWT is sent via Authorization header; cookies are not required for auth.
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sentinelchat_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logoutSocket();
      localStorage.removeItem("sentinelchat_token");
      localStorage.removeItem("sentinelchat_user");
    }
    return Promise.reject(error);
  }
);

export default api;
