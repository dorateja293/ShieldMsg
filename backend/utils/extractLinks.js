export function extractLinks(messageText = "") {
  const matches = messageText.match(/\bhttps?:\/\/[^\s<>"']+/gi);
  return [...new Set(matches ?? [])];
}
