import { AlertTriangle, CheckCheck, Download, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { formatTime } from "../utils/formatters.js";
import { mediaUrl } from "../utils/mediaUrl.js";
import { splitTextWithUrls } from "../utils/linkifyText.js";

function isImageAttachment(message) {
  const mime = (message.fileType ?? "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  const name = (message.fileName ?? "").toLowerCase();
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(name);
}

function ThreatDot({ status }) {
  if (status === "safe") return null;
  const color =
    status === "dangerous" ? "bg-red-500" : status === "suspicious" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <span
      className={`ml-0.5 inline-block h-2 w-2 shrink-0 rounded-full align-middle ${color}`}
      title={`Scan: ${status}`}
    />
  );
}

function ReadReceipt({ message, mine, peerId }) {
  if (!mine || !peerId) return null;
  const raw = message.readBy ?? [];
  const ids = raw.map((x) => String(x?._id ?? x));
  const readByPeer = ids.includes(String(peerId));

  return (
    <CheckCheck
      aria-label={readByPeer ? "Read" : "Delivered"}
      className={`shrink-0 ${readByPeer ? "text-[#53bdeb]" : "text-[#8696a0]"}`}
      size={15}
      strokeWidth={2}
    />
  );
}

/** One short line only: safe / caution / dangerous */
function SafetyVerdictBanner({ status, mine }) {
  const base = "mb-1.5 flex items-center gap-2 rounded-md border px-2 py-1 text-[13px] font-semibold";

  if (status === "dangerous") {
    return (
      <div
        className={`${base} border-red-300 bg-red-50 text-red-900 ${
          mine ? "border-red-400/80 bg-red-950/20 text-red-950" : ""
        }`}
        role="status"
      >
        <ShieldAlert className="shrink-0 text-red-600" size={17} />
        Dangerous — do not open
      </div>
    );
  }

  if (status === "suspicious") {
    return (
      <div
        className={`${base} border-amber-300 bg-amber-50 text-amber-950 ${
          mine ? "border-amber-400/70 bg-amber-950/15" : ""
        }`}
        role="status"
      >
        <AlertTriangle className="shrink-0 text-amber-600" size={17} />
        Caution — may not be safe
      </div>
    );
  }

  return (
    <div
      className={`${base} border-emerald-300 bg-emerald-50 text-emerald-950 ${
        mine ? "border-emerald-400/60 bg-emerald-950/12" : ""
      }`}
      role="status"
    >
      <ShieldCheck className="shrink-0 text-emerald-600" size={17} />
      Safe to open
    </div>
  );
}

function FileSafetyRow({ fileResult, mine }) {
  if (!fileResult?.status) return null;
  const s = fileResult.status;
  const label =
    s === "safe" ? "File: safe to open" : s === "suspicious" ? "File: caution" : "File: dangerous — do not open";

  const box =
    s === "safe"
      ? mine
        ? "border-emerald-700/30 bg-emerald-900/10 text-emerald-900"
        : "border-emerald-200 bg-emerald-50 text-emerald-900"
      : s === "suspicious"
        ? mine
          ? "border-amber-700/30 bg-amber-950/15 text-amber-950"
          : "border-amber-200 bg-amber-50 text-amber-900"
        : mine
          ? "border-red-700/40 bg-red-950/20 text-red-950"
          : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className={`mt-1.5 rounded-md border px-2 py-0.5 text-[12px] font-semibold ${box}`} role="status">
      {label}
    </div>
  );
}

function LinkifiedParagraph({ text, mine }) {
  const parts = splitTextWithUrls(text);
  const linkClass = mine
    ? "font-medium text-[#005c4b] underline decoration-[#005c4b]/60 underline-offset-2 hover:text-[#004a3d]"
    : "font-medium text-[#027eb5] underline decoration-blue-300 underline-offset-2 hover:text-[#026aa1]";

  return (
    <p className="wrap-break-word pr-[52px] text-[15px] leading-[1.42] text-[#111b21] whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.type === "url" ? (
          <a key={i} className={linkClass} href={part.value} rel="noopener noreferrer" target="_blank">
            {part.value}
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </p>
  );
}

function MessageBubble({ message, mine, peerId }) {
  const [confirmed, setConfirmed] = useState(false);
  const dangerous = message.safetyStatus === "dangerous";

  const hasLinks = Array.isArray(message.linkResults) && message.linkResults.length > 0;
  const hasFile = Boolean(message.fileUrl || message.fileName);
  const textEmpty = !(message.messageText ?? "").trim();

  const imageOnlySafe =
    message.safetyStatus === "safe" &&
    message.fileUrl &&
    isImageAttachment(message) &&
    textEmpty &&
    !hasLinks;

  const showVerdict = !imageOnlySafe && (hasLinks || hasFile || message.safetyStatus !== "safe");
  const showFileSafetyRow = Boolean(
    hasFile && message.fileResult && !imageOnlySafe
  );

  return (
    <article className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`wa-bubble relative max-w-[min(85%,520px)] rounded-lg px-2 py-1.5 pb-6 shadow-sm ${
          mine ? "rounded-br-sm bg-[#d9fdd3] text-[#111b21]" : "rounded-bl-sm bg-white text-[#111b21]"
        }`}
      >
        {dangerous && !confirmed ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-red-900">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
              <EyeOff size={14} />
              Blocked — high threat score
            </div>
            <button
              className="mt-2 rounded bg-red-700 px-2 py-1 text-xs font-semibold text-white"
              onClick={() => setConfirmed(true)}
              type="button"
            >
              Show anyway
            </button>
          </div>
        ) : (
          <>
            {showVerdict ? <SafetyVerdictBanner mine={mine} status={message.safetyStatus} /> : null}
            {message.messageText ? <LinkifiedParagraph mine={mine} text={message.messageText} /> : null}
            {message.fileUrl ? (
              isImageAttachment(message) ? (
                <a
                  className={`mt-1 block max-w-full overflow-hidden rounded-lg ${
                    mine ? "ring-1 ring-black/10" : "ring-1 ring-black/5"
                  }`}
                  href={mediaUrl(message.fileUrl)}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={message.fileName || "Open image"}
                >
                  <img
                    alt={message.fileName || "Photo"}
                    className="max-h-64 w-full max-w-[280px] object-cover object-center sm:max-w-sm"
                    loading="lazy"
                    src={mediaUrl(message.fileUrl)}
                  />
                </a>
              ) : (
                <a
                  className={`mt-1 inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium ${
                    mine ? "bg-black/5 text-[#005c4b]" : "bg-[#f0f2f5] text-[#111b21]"
                  }`}
                  href={mediaUrl(message.fileUrl)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Download size={16} />
                  <span className="truncate">{message.fileName || "File"}</span>
                </a>
              )
            ) : null}
            {hasFile && message.fileResult && showFileSafetyRow ? (
              <FileSafetyRow fileResult={message.fileResult} mine={mine} />
            ) : null}
          </>
        )}

        {!(dangerous && !confirmed) ? (
          <div className="absolute bottom-1 right-1.5 flex items-center gap-1">
            <ThreatDot status={message.safetyStatus} />
            <time className="text-[11px] leading-none text-[#667781]" dateTime={message.createdAt}>
              {formatTime(message.createdAt)}
            </time>
            <ReadReceipt message={message} mine={mine} peerId={peerId} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default MessageBubble;
