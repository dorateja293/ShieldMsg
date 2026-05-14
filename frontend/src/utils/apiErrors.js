/**
 * Reads flattened Zod errors from API `{ details: { fieldErrors } }`.
 * @param {unknown} error Axios-like error from failed request
 * @returns {Record<string, string>} First message per field key
 */
export function extractFieldErrors(error) {
  const raw = error?.response?.data?.details?.fieldErrors;
  if (!raw || typeof raw !== "object") return {};

  /** @type {Record<string, string>} */
  const out = {};
  for (const [key, arr] of Object.entries(raw)) {
    if (Array.isArray(arr) && typeof arr[0] === "string" && arr[0]) {
      out[key] = arr[0];
    }
  }
  return out;
}

export function firstApiMessage(error) {
  if (!error?.response) {
    const code = error?.code;
    const msg = typeof error?.message === "string" ? error.message : "";
    if (code === "ERR_NETWORK" || msg === "Network Error") {
      return "Cannot reach the API. Set VITE_API_URL on Vercel to https://your-backend.onrender.com/api (or the host only; /api is added automatically), redeploy, and set CLIENT_URL on Render to this site’s origin (https://…, no path).";
    }
    if (msg) return msg;
    return "No response from the server.";
  }
  const data = error.response.data;
  if (typeof data?.message === "string") return data.message;
  return "";
}
