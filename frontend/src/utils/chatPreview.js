/** Short preview line for chat list (matches WhatsApp-style snippets). */
export function previewLineFromMessage(message) {
  if (!message) return "";
  if (message.fileUrl || message.fileName) {
    return `📎 ${message.fileName?.trim() || "Attachment"}`;
  }
  const t = (message.messageText ?? "").trim();
  if (!t.length) return "";
  return t.length > 48 ? `${t.slice(0, 46)}…` : t;
}
