import { Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ChatAvatar from "./ChatAvatar.jsx";
import { formatChatListTime } from "../utils/formatters.js";

function idsEqual(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function ChatList({ threads, selectedUser, onSelect, emptyHint }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.user.username?.toLowerCase().includes(q) ||
        (t.preview ?? "").toLowerCase().includes(q)
    );
  }, [threads, query]);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-[#d1d7db] bg-white">
      <header className="flex flex-none items-center justify-between bg-[#f0f2f5] px-3 py-3 sm:px-4">
        <h1 className="text-[20px] font-medium text-[#111b21]">Chats</h1>
        <Link
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#54656f] hover:bg-[#e9edef]"
          title="Contacts"
          to="/profile"
        >
          <UserRound size={22} strokeWidth={2} />
        </Link>
      </header>

      <div className="flex-none border-b border-[#f0f2f5] bg-white px-3 py-2">
        <div className="flex items-center gap-2 rounded-full bg-[#f0f2f5] px-3 py-2">
          <Search className="shrink-0 text-[#54656f]" size={17} strokeWidth={2} />
          <input
            aria-label="Search chats"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-[#111b21] outline-none placeholder:text-[#8696a0]"
            placeholder="Search chats"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        {filtered.length === 0 ? (
          <p className="px-6 py-16 text-center text-[15px] leading-relaxed text-[#667781]">
            {threads.length === 0 ? emptyHint ?? "No chats yet." : "No results."}
          </p>
        ) : (
          <ul>
            {filtered.map(({ user, preview, previewAt }) => {
              const active = idsEqual(selectedUser?._id, user._id);
              return (
                <li key={user._id} className="border-b border-[#f0f2f5] last:border-0">
                  <button
                    className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-[#f5f6f6] sm:px-4 ${
                      active ? "bg-[#f0f2f5]" : ""
                    }`}
                    type="button"
                    onClick={() => onSelect(user)}
                  >
                    <ChatAvatar imageUrl={user.profilePicture} name={user.username} size={49} />
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[17px] font-medium text-[#111b21]">{user.username}</span>
                        <time className="shrink-0 text-[12px] text-[#667781]" dateTime={previewAt ?? undefined}>
                          {formatChatListTime(previewAt)}
                        </time>
                      </div>
                      <p className="mt-0.5 truncate text-[14px] text-[#667781]">{preview || "\u00a0"}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

export default ChatList;
