import { Download, EyeOff } from "lucide-react";
import { useState } from "react";
import SecurityBadge from "./SecurityBadge.jsx";
import { formatTime } from "../utils/formatters.js";

function MessageBubble({ message, mine }) {
  const [confirmed, setConfirmed] = useState(false);
  const dangerous = message.safetyStatus === "dangerous";

  return (
    <article className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] rounded-lg border p-3 shadow-sm ${mine ? "bg-teal-700 text-white" : "bg-white text-slate-950"}`}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <SecurityBadge status={message.safetyStatus} score={message.threatScore} />
          <time className={`text-xs ${mine ? "text-teal-100" : "text-slate-400"}`}>{formatTime(message.createdAt)}</time>
        </div>

        {dangerous && !confirmed ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
            <div className="mb-2 flex items-center gap-2 font-bold">
              <EyeOff size={16} />
              Dangerous content hidden
            </div>
            <p className="mb-3 text-sm">SentinelChat blocked this content because the threat score is high.</p>
            <button className="rounded-lg bg-red-700 px-3 py-2 text-sm font-bold text-white" onClick={() => setConfirmed(true)} type="button">
              Show anyway
            </button>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words leading-6">{message.messageText}</p>
            {message.fileUrl ? (
              <a
                className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
                  mine ? "bg-white/15 text-white" : "bg-slate-100 text-slate-800"
                }`}
                href={message.fileUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Download size={16} />
                {message.fileName || "Download file"}
              </a>
            ) : null}
          </>
        )}

        {message.linkResults?.length ? (
          <div className="mt-3 grid gap-1 text-xs">
            {message.linkResults.map((result, index) => (
              <div className={mine ? "text-teal-50" : "text-slate-500"} key={`${message._id}-link-${index}`}>
                Link scan: {result.reason}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default MessageBubble;
