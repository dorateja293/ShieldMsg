/** Same idea as backend extractLinks — split message for clickable URLs. */
const URL_RE = /\bhttps?:\/\/[^\s<>"']+/gi;

/**
 * @param {string} text
 * @returns {{ type: "text" | "url"; value: string }[]}
 */
export function splitTextWithUrls(text = "") {
  if (!text) return [];
  const parts = [];
  let last = 0;
  const re = new RegExp(URL_RE.source, "gi");
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({ type: "url", value: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts.length > 0 ? parts : [{ type: "text", value: text }];
}
