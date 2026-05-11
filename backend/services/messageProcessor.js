import { Message } from "../models/Message.js";
import { ThreatLog } from "../models/ThreatLog.js";
import { extractLinks } from "../utils/extractLinks.js";
import { combineThreatResults } from "../utils/threatScore.js";
import { scanUploadedFile } from "./fileScanner.js";
import { scanLink } from "./linkScanner.js";

export async function processAndStoreMessage({ senderId, receiverId, groupId, messageText = "", file }) {
  const detectedLinks = extractLinks(messageText);
  const linkResults = await Promise.all(detectedLinks.map((link) => scanLink(link)));
  const fileResult = file ? await scanUploadedFile(file) : { status: "safe", score: 0, reason: "No file attached." };
  const combined = combineThreatResults([...linkResults, fileResult]);
  const blocked = combined.status === "dangerous";

  const message = await Message.create({
    senderId,
    receiverId,
    groupId,
    messageText: blocked ? redactDangerousText(messageText, detectedLinks) : messageText,
    fileUrl: file && !blocked ? `/uploads/${file.filename}` : "",
    fileName: file?.originalname ?? "",
    fileType: file?.mimetype ?? "",
    detectedLinks,
    linkResults,
    fileResult,
    safetyStatus: combined.status,
    threatScore: combined.score,
    blocked,
    readBy: [senderId]
  });

  await Promise.all([
    ...detectedLinks.map((link, index) =>
      ThreatLog.create({
        userId: senderId,
        messageId: message._id,
        target: link,
        targetType: "url",
        status: linkResults[index]?.status ?? "safe",
        score: linkResults[index]?.score ?? 0,
        reason: linkResults[index]?.reason ?? "",
        domain: safeDomain(link)
      })
    ),
    file
      ? ThreatLog.create({
          userId: senderId,
          messageId: message._id,
          target: file.originalname,
          targetType: "file",
          status: fileResult.status,
          score: fileResult.score,
          reason: fileResult.reason,
          fileType: file.mimetype
        })
      : null
  ].filter(Boolean));

  return message.populate("senderId", "username profilePicture onlineStatus");
}

function redactDangerousText(text, links) {
  return links.reduce((safeText, link) => safeText.replace(link, "[dangerous link hidden]"), text);
}

function safeDomain(link) {
  try {
    return new URL(link).hostname;
  } catch {
    return "";
  }
}
