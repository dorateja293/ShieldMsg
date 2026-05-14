import { getApiBaseUrl } from "../config/apiBaseUrl.js";

/** Resolve stored paths for <img src> and links. */
export function mediaUrl(path) {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Same-origin `/uploads/...` so Vite dev proxy and typical reverse-proxy setups work.
  if (typeof window !== "undefined" && trimmed.startsWith("/uploads/")) {
    return trimmed;
  }

  const api = getApiBaseUrl();
  const origin = api.replace(/\/api\/?$/i, "") || "http://localhost:5000";
  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}
