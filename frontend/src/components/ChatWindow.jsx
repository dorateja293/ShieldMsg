import { ArrowLeft, EllipsisVertical, Search, Send, ShieldCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import ChatAvatar from "./ChatAvatar.jsx";
import FileUploader from "./FileUploader.jsx";
import MessageBubble from "./MessageBubble.jsx";
import { previewLineFromMessage } from "../utils/chatPreview.js";

function idsEqual(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function ChatWindow({ selectedUser, onConversationActivity, onBackFromChat }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [typing, setTyping] = useState(false);
  const [sendError, setSendError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const typingTimeout = useRef(null);
  const sendTimeout = useRef(null);
  const bottomRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    let cancelled = false;
    api.get(`/messages/conversation/${selectedUser._id}`).then(({ data }) => {
      if (!cancelled) setMessages(data.messages);
    });
    api.patch(`/messages/conversation/${selectedUser._id}/read`).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedUser]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setMenuOpen(false);
  }, [selectedUser?._id]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      clearTimeout(sendTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [menuOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) => {
      const text = (m.messageText ?? "").toLowerCase();
      const fname = (m.fileName ?? "").toLowerCase();
      return text.includes(q) || fname.includes(q);
    });
  }, [messages, searchQuery]);

  const notifyActivity = useCallback(
    (message) => {
      if (!message || !selectedUser?._id || !onConversationActivity) return;
      onConversationActivity({
        userId: selectedUser._id,
        preview: previewLineFromMessage(message),
        previewAt: message.createdAt
      });
    },
    [selectedUser, onConversationActivity]
  );

  useEffect(() => {
    function receiveMessage(message) {
      const peerId = selectedUser?._id;
      if (!peerId || !user?._id) return;
      const sid = message.senderId?._id ?? message.senderId;
      const rid = message.receiverId?._id ?? message.receiverId;
      const inThread =
        (idsEqual(sid, peerId) && idsEqual(rid, user._id)) || (idsEqual(sid, user._id) && idsEqual(rid, peerId));
      if (!inThread) return;

      setMessages((current) => {
        if (current.some((m) => idsEqual(m._id, message._id))) return current;
        notifyActivity(message);
        return [...current, message];
      });
    }

    function handleTyping(payload) {
      if (idsEqual(payload.userId, selectedUser?._id)) setTyping(true);
    }

    function handleStopTyping(payload) {
      if (idsEqual(payload.userId, selectedUser?._id)) setTyping(false);
    }

    socket.on("message:receive", receiveMessage);
    socket.on("typing:start", handleTyping);
    socket.on("typing:stop", handleStopTyping);
    return () => {
      socket.off("message:receive", receiveMessage);
      socket.off("typing:start", handleTyping);
      socket.off("typing:stop", handleStopTyping);
    };
  }, [selectedUser, socket, user, notifyActivity]);

  function handleTypingChange(value) {
    setMessageText(value);
    if (!selectedUser) return;
    socket.emit("typing:start", { receiverId: selectedUser._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit("typing:stop", { receiverId: selectedUser._id }), 700);
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedUser || (!messageText.trim() && !file) || isSending) return;

    setSendError("");
    setIsSending(true);

    if (file) {
      try {
        const formData = new FormData();
        formData.append("receiverId", selectedUser._id);
        formData.append("messageText", messageText);
        formData.append("file", file);
        const { data } = await api.post("/messages", formData);
        setMessages((current) => [...current, data.message]);
        notifyActivity(data.message);
        setMessageText("");
        setFile(null);
      } catch (error) {
        const msg =
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : error.response?.status === 413
              ? "File too large."
              : "Could not upload this message.";
        setSendError(msg);
      } finally {
        setIsSending(false);
      }
      return;
    }

    clearTimeout(sendTimeout.current);
    sendTimeout.current = setTimeout(() => {
      setIsSending(false);
      setSendError("Message send timed out. Please try again.");
    }, 10000);

    const payload = { receiverId: selectedUser._id, messageText };
    const onAck = (error, response) => {
      clearTimeout(sendTimeout.current);
      setIsSending(false);

      if (error) {
        setSendError("Message send timed out. Please try again.");
        return;
      }

      if (response?.ok) {
        setMessageText("");
        setFile(null);
        return;
      }

      setSendError(response?.error ?? "Message could not be sent.");
    };

    if (typeof socket.timeout === "function") {
      socket.timeout(10000).emit("message:send", payload, onAck);
    } else {
      socket.emit("message:send", payload, (response) => onAck(null, response));
    }
  }

  if (!selectedUser) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-[#f0f2f5]">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 border-[#e9edef] px-6 text-center md:border-l">
          <ShieldCheck className="text-[#8696a0]" size={88} strokeWidth={1} aria-hidden />
          <div className="max-w-xs">
            <h2 className="text-[20px] font-medium text-[#41525d]">SentinelChat</h2>
            <p className="mt-1.5 text-[15px] leading-snug text-[#667781]">Choose a chat from your list to continue.</p>
          </div>
        </div>
      </section>
    );
  }

  const subtitle = !connected ? "Connecting…" : typing ? "typing…" : selectedUser.onlineStatus ? "online" : "offline";

  const searchActive = searchOpen && searchQuery.trim().length > 0;
  const showSearchBar = searchOpen;

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#efeae2]">
      {/* Top bar — WhatsApp-style, only working actions */}
      <header className="flex flex-none flex-col border-b border-[#d1d7db] bg-[#f0f2f5]">
        <div className="flex items-center gap-0.5 px-2 py-2 sm:px-3">
          {onBackFromChat ? (
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#54656f] hover:bg-[#e9edef] md:hidden"
              type="button"
              aria-label="Back to chats"
              onClick={onBackFromChat}
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
          ) : null}
          <Link
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 pl-0.5 pr-2 transition-colors hover:bg-[#e9edef]"
            title="View contact"
            to={`/profile/${selectedUser._id}`}
          >
            <ChatAvatar imageUrl={selectedUser.profilePicture} name={selectedUser.username} size={40} />
            <div className="min-w-0 flex-1 py-0.5">
              <h2 className="truncate text-[16px] font-medium leading-tight text-[#111b21]">{selectedUser.username}</h2>
              <p className="truncate text-[13px] text-[#667781]">{subtitle}</p>
            </div>
          </Link>
          <div className="flex shrink-0 items-center">
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-full text-[#54656f] hover:bg-[#e9edef] ${
                searchOpen ? "bg-[#e9edef]" : ""
              }`}
              type="button"
              title={searchOpen ? "Close search" : "Search in chat"}
              aria-label={searchOpen ? "Close search" : "Search in chat"}
              aria-pressed={searchOpen}
              onClick={() => {
                setSearchOpen((o) => !o);
                if (searchOpen) setSearchQuery("");
              }}
            >
              <Search size={20} strokeWidth={2} />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[#54656f] hover:bg-[#e9edef] ${
                  menuOpen ? "bg-[#e9edef]" : ""
                }`}
                type="button"
                title="Menu"
                aria-label="Chat menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <EllipsisVertical size={20} strokeWidth={2} />
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 top-full z-30 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[#e9edef] bg-white py-1 shadow-md"
                  role="menu"
                >
                  <Link
                    className="block px-4 py-2 text-[15px] text-[#111b21] hover:bg-[#f5f6f6]"
                    role="menuitem"
                    to={`/profile/${selectedUser._id}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    View contact
                  </Link>
                  <button
                    className="block w-full px-4 py-2 text-left text-[15px] text-[#111b21] hover:bg-[#f5f6f6]"
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setSearchOpen(true);
                    }}
                  >
                    Search in chat
                  </button>
                  <Link
                    className="block px-4 py-2 text-[15px] text-[#111b21] hover:bg-[#f5f6f6]"
                    role="menuitem"
                    to="/notifications"
                    onClick={() => setMenuOpen(false)}
                  >
                    Notifications
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showSearchBar ? (
          <div className="border-t border-[#e9edef] bg-[#f0f2f5] px-2 py-2 sm:px-3">
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-[#e9edef]">
              <Search className="shrink-0 text-[#54656f]" size={17} strokeWidth={2} />
              <input
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111b21] outline-none placeholder:text-[#8696a0]"
                placeholder="Search messages"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#54656f] hover:bg-[#e4e6eb]"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
              >
                <X size={18} />
              </button>
            </div>
            {searchActive ? (
              <p className="mt-1.5 px-1 text-center text-[12px] text-[#667781]">
                {filteredMessages.length} {filteredMessages.length === 1 ? "message" : "messages"}
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="wa-chat-pattern min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-3 sm:py-3">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-0.5">
          {searchActive && filteredMessages.length === 0 ? (
            <p className="py-8 text-center text-[14px] text-[#667781]">No messages match your search.</p>
          ) : (
            filteredMessages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                mine={idsEqual(message.senderId?._id ?? message.senderId, user._id)}
                peerId={selectedUser._id}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <footer className="flex-none border-t border-[#d1d7db] bg-[#f0f2f5] px-2 py-2 sm:px-3">
        {sendError ? (
          <p className="mb-2 rounded-md bg-red-50 px-3 py-1.5 text-center text-[14px] text-red-800">{sendError}</p>
        ) : null}
        {file ? (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[14px] text-[#111b21] ring-1 ring-[#e9edef]">
            <span className="truncate">{file.name}</span>
            <button className="shrink-0 text-[14px] font-medium text-[#008069] hover:underline" onClick={() => setFile(null)} type="button">
              Remove
            </button>
          </div>
        ) : null}
        <form className="flex items-end gap-1.5 sm:gap-2" onSubmit={sendMessage}>
          <div className="flex shrink-0 pb-0.5">
            <FileUploader compact file={file} onChange={setFile} onClear={() => setFile(null)} />
          </div>
          <div className="min-w-0 flex-1 rounded-2xl bg-white py-1 pl-2 pr-2 shadow-sm ring-1 ring-[#d1d7db]">
            <textarea
              className="max-h-32 min-h-[44px] w-full resize-none rounded-2xl bg-transparent px-3 py-2.5 text-[15px] text-[#111b21] outline-none placeholder:text-[#8696a0]"
              placeholder="Message"
              rows={1}
              value={messageText}
              onChange={(event) => handleTypingChange(event.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
          </div>
          <button
            className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#008f72] disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:w-12"
            title="Send"
            disabled={isSending}
            type="submit"
          >
            <Send size={19} className="ml-0.5" />
          </button>
        </form>
      </footer>
    </section>
  );
}

export default ChatWindow;
