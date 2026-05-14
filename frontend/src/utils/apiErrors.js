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
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  return "";
}
