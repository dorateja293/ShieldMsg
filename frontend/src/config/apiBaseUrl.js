const DEFAULT_API_BASE = "http://localhost:5000/api";

/**
 * @param {unknown} raw value of import.meta.env.VITE_API_URL
 * @returns {string}
 */
export function normalizeApiBaseUrl(raw) {
  if (raw == null || typeof raw !== "string") return DEFAULT_API_BASE;
  let u = raw.trim().replace(/\/+$/, "");
  if (u === "") return DEFAULT_API_BASE;
  if (!/\/api$/i.test(u)) {
    u = `${u}/api`;
  }
  return u;
}

/**
 * @param {unknown} socketRaw import.meta.env.VITE_SOCKET_URL
 * @param {unknown} apiRaw import.meta.env.VITE_API_URL
 */
export function normalizeSocketBaseUrl(socketRaw, apiRaw) {
  if (socketRaw != null && typeof socketRaw === "string" && socketRaw.trim() !== "") {
    return socketRaw.trim().replace(/\/+$/, "").replace(/\/api$/i, "");
  }
  return normalizeApiBaseUrl(apiRaw).replace(/\/api\/?$/i, "");
}

export function getApiBaseUrl() {
  return normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
}

export function getSocketBaseUrl() {
  return normalizeSocketBaseUrl(import.meta.env.VITE_SOCKET_URL, import.meta.env.VITE_API_URL);
}
