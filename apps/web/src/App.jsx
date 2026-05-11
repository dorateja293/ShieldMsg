import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Link2,
  Loader2,
  MessageCircle,
  Paperclip,
  RefreshCcw,
  Send,
  Shield,
  ShieldAlert,
  UserRound,
  X
} from "lucide-react";
import { fetchScanHistory, scanMessage } from "./api";

const initialMessages = [
  {
    id: 1,
    sender: "friend",
    text: "Can you check this before I open it? http://whatsapp-security-update.xyz/install.apk",
    files: [],
    scan: {
      level: "dangerous",
      score: 95,
      urls: [],
      files: [],
      summary: "Dangerous content was detected. Do not open it until verified.",
      scannedAt: new Date().toISOString()
    },
    time: "09:24"
  },
  {
    id: 2,
    sender: "me",
    text: "Blocked. Ask them to send it through the official store link.",
    files: [],
    scan: {
      level: "safe",
      score: 0,
      urls: [],
      files: [],
      summary: "No links or files were detected in this message.",
      scannedAt: new Date().toISOString()
    },
    time: "09:25"
  }
];

const sampleDrafts = [
  "https://instagram.com/reel/C9demo",
  "Urgent bonus claim: https://bit.ly/free-gift-verify",
  "Please install this update http://whatsapp-security-update.xyz/install.apk"
];

function App() {
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState(initialMessages);
  const [draftScan, setDraftScan] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [scanState, setScanState] = useState("idle");
  const [historyState, setHistoryState] = useState("idle");
  const fileInputRef = useRef(null);

  const hasDraftContent = draft.trim().length > 0 || files.length > 0;

  useEffect(() => {
    loadScanHistory();
  }, []);

  useEffect(() => {
    if (!hasDraftContent) {
      setDraftScan(null);
      setScanState("idle");
      return;
    }

    const timeout = window.setTimeout(() => {
      setScanState("scanning");
      scanMessage(draft, files)
        .then((result) => {
          setDraftScan(result);
          setScanState("idle");
        })
        .catch(() => {
          setScanState("error");
        });
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [draft, files, hasDraftContent]);

  const conversationRisk = useMemo(() => {
    const riskOrder = ["safe", "suspicious", "dangerous"];
    return messages.reduce((highest, message) => {
      return riskOrder.indexOf(message.scan.level) > riskOrder.indexOf(highest) ? message.scan.level : highest;
    }, "safe");
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    if (!hasDraftContent) return;

    setScanState("scanning");
    try {
      const scan = await scanMessage(draft, files);
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          sender: "me",
          text: draft.trim(),
          files,
          scan,
          time: new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date())
        }
      ]);
      setDraft("");
      setFiles([]);
      setDraftScan(null);
      setScanState("idle");
      void loadScanHistory();
    } catch {
      setScanState("error");
    }
  }

  async function loadScanHistory() {
    setHistoryState("loading");
    try {
      setScanHistory(await fetchScanHistory());
      setHistoryState("idle");
    } catch {
      setHistoryState("error");
    }
  }

  function handleFiles(event) {
    const selectedFiles = Array.from(event.target.files ?? []).map((file) => ({
      name: file.name,
      mimeType: file.type || undefined,
      sizeBytes: file.size
    }));

    setFiles((current) => [...current, ...selectedFiles]);
    event.target.value = "";
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Conversations">
        <div className="brand-row">
          <div className="brand-mark">
            <Shield size={24} />
          </div>
          <div>
            <h1>ShieldMsg</h1>
            <span>Secure messaging</span>
          </div>
        </div>

        <div className="risk-panel">
          <RiskBadge level={conversationRisk} />
          <strong>Active chat</strong>
          <span>3 shared items scanned</span>
        </div>

        <nav className="chat-list" aria-label="Chat list">
          <button className="chat-item active" type="button">
            <UserRound size={20} />
            <span>
              <strong>Project Group</strong>
              <small>Link scan active</small>
            </span>
          </button>
          <button className="chat-item" type="button">
            <MessageCircle size={20} />
            <span>
              <strong>Family</strong>
              <small>No risky files</small>
            </span>
          </button>
        </nav>

        <section className="history-panel" aria-label="Recent scans">
          <div className="panel-title">
            <span>Recent scans</span>
            <button aria-label="Refresh scan history" type="button" onClick={() => void loadScanHistory()}>
              <RefreshCcw size={15} className={historyState === "loading" ? "spin" : ""} />
            </button>
          </div>
          {historyState === "error" ? (
            <p>History unavailable</p>
          ) : scanHistory.length === 0 ? (
            <p>No saved scans yet</p>
          ) : (
            <div className="history-list">
              {scanHistory.map((record) => (
                <div className="history-item" key={record.id}>
                  <RiskBadge level={record.level} />
                  <span>{record.text || record.files[0]?.name || "File scan"}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>

      <section className="chat-surface" aria-label="Secure conversation">
        <header className="chat-header">
          <div>
            <span className="eyebrow">Project Group</span>
            <h2>Shared content guard</h2>
          </div>
          <RiskBadge level={draftScan?.level ?? "safe"} />
        </header>

        <section className="messages" aria-label="Messages">
          {messages.map((message) => (
            <article className={`message ${message.sender}`} key={message.id}>
              <div className="message-meta">
                <span>{message.sender === "me" ? "You" : "Ananya"}</span>
                <time>{message.time}</time>
              </div>
              {message.text && <p>{message.text}</p>}
              {message.files.length > 0 && (
                <div className="file-stack">
                  {message.files.map((file) => (
                    <span className="file-chip" key={`${message.id}-${file.name}`}>
                      <FileUp size={16} />
                      {file.name}
                    </span>
                  ))}
                </div>
              )}
              <ScanSummary scan={message.scan} />
            </article>
          ))}
        </section>

        <div className="sample-row" aria-label="Demo messages">
          {sampleDrafts.map((sample) => (
            <button type="button" key={sample} onClick={() => setDraft(sample)}>
              <Link2 size={16} />
              Try sample
            </button>
          ))}
        </div>

        <form className="composer" onSubmit={handleSend}>
          <div className="draft-status">
            {scanState === "scanning" ? (
              <span className="status-text">
                <Loader2 size={16} className="spin" />
                Scanning
              </span>
            ) : scanState === "error" ? (
              <span className="status-text danger">
                <ShieldAlert size={16} />
                API offline
              </span>
            ) : draftScan ? (
              <ScanSummary scan={draftScan} compact />
            ) : (
              <span className="status-text muted">
                <Shield size={16} />
                Ready
              </span>
            )}
          </div>

          {files.length > 0 && (
            <div className="attachment-row">
              {files.map((file) => (
                <span className="file-chip" key={file.name}>
                  <FileUp size={16} />
                  {file.name}
                  <button
                    aria-label={`Remove ${file.name}`}
                    type="button"
                    onClick={() => setFiles((current) => current.filter((item) => item.name !== file.name))}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="composer-row">
            <button
              aria-label="Attach file"
              className="icon-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </button>
            <input ref={fileInputRef} type="file" multiple onChange={handleFiles} hidden />
            <textarea
              aria-label="Message"
              placeholder="Paste a link or write a message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
            />
            <button className="send-button" disabled={!hasDraftContent || scanState === "scanning"} type="submit">
              <Send size={18} />
              Send
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ScanSummary({ scan, compact = false }) {
  const flaggedItems = [...scan.urls, ...scan.files].filter((item) => item.level !== "safe");

  return (
    <div className={`scan-summary ${scan.level} ${compact ? "compact" : ""}`}>
      <RiskIcon level={scan.level} />
      <span>{scan.summary}</span>
      {flaggedItems.length > 0 && !compact && (
        <ul>
          {flaggedItems.slice(0, 2).map((item) => (
            <li key={`${item.type}-${item.target}`}>{item.reasons[0]?.message ?? item.recommendation}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RiskBadge({ level }) {
  return (
    <span className={`risk-badge ${level}`}>
      <RiskIcon level={level} />
      {level}
    </span>
  );
}

function RiskIcon({ level }) {
  if (level === "dangerous") return <ShieldAlert size={16} />;
  if (level === "suspicious") return <AlertTriangle size={16} />;
  return <CheckCircle2 size={16} />;
}

export default App;
