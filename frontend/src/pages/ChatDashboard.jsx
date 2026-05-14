import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatList from "../components/ChatList.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import api from "../services/api.js";
import { previewLineFromMessage } from "../utils/chatPreview.js";

function ChatDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  /** On small screens: show either the chat list or the thread (WhatsApp-style). */
  const [mobilePanel, setMobilePanel] = useState("list");

  const refreshThreads = useCallback(async () => {
    const { data } = await api.get("/friends");
    const friends = data.users ?? [];
    const withPreview = await Promise.all(
      friends.map(async (u) => {
        try {
          const { data: conv } = await api.get(`/messages/conversation/${u._id}?limit=1`);
          const msgs = conv.messages ?? [];
          const last = msgs.length ? msgs[msgs.length - 1] : null;
          const preview = previewLineFromMessage(last);
          const previewAt = last?.createdAt ?? null;
          return { user: u, preview, previewAt };
        } catch {
          return { user: u, preview: "", previewAt: null };
        }
      })
    );
    withPreview.sort((a, b) => {
      if (!a.previewAt && !b.previewAt) return 0;
      if (!a.previewAt) return 1;
      if (!b.previewAt) return -1;
      return new Date(b.previewAt) - new Date(a.previewAt);
    });
    setThreads(withPreview);
    setSelectedUser((current) => {
      if (!current) return withPreview[0]?.user ?? null;
      const still = withPreview.find((t) => String(t.user._id) === String(current._id));
      return still ? still.user : withPreview[0]?.user ?? null;
    });
  }, []);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  const selectChat = useCallback((user) => {
    setSelectedUser(user);
    setMobilePanel("chat");
  }, []);

  const openChatWith = location.state?.openChatWith;

  useEffect(() => {
    if (!openChatWith || threads.length === 0) return;
    const match = threads.find((t) => String(t.user._id) === String(openChatWith));
    if (match) {
      selectChat(match.user);
    }
    navigate(".", { replace: true, state: {} });
  }, [threads, openChatWith, selectChat, navigate]);

  const handleConversationActivity = useCallback(({ userId, preview, previewAt }) => {
    setThreads((prev) => {
      const next = prev.map((t) =>
        String(t.user._id) === String(userId) ? { ...t, preview, previewAt } : t
      );
      next.sort((a, b) => {
        if (!a.previewAt && !b.previewAt) return 0;
        if (!a.previewAt) return 1;
        if (!b.previewAt) return -1;
        return new Date(b.previewAt) - new Date(a.previewAt);
      });
      return next;
    });
  }, []);

  return (
    <div className="flex h-dvh min-h-0 w-full flex-row bg-[#f0f2f5]">
      <div
        className={`flex h-full min-h-0 min-w-0 flex-col border-[#e9edef] md:flex md:w-[400px] md:max-w-[420px] md:flex-none md:shrink-0 md:border-r ${
          mobilePanel === "chat" ? "hidden md:flex" : "flex w-full"
        }`}
      >
        <ChatList
          threads={threads}
          selectedUser={selectedUser}
          onSelect={selectChat}
          emptyHint="Add friends from Profiles to start chatting."
        />
      </div>
      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col bg-[#efeae2] md:flex ${
          mobilePanel === "list" ? "hidden md:flex" : "flex w-full"
        }`}
      >
        <ChatWindow
          selectedUser={selectedUser}
          onBackFromChat={() => setMobilePanel("list")}
          onConversationActivity={handleConversationActivity}
        />
      </div>
    </div>
  );
}

export default ChatDashboard;
