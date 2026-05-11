import { Send, ShieldAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useSocket } from "../hooks/useSocket.js";
import FileUploader from "./FileUploader.jsx";
import MessageBubble from "./MessageBubble.jsx";

function ChatWindow({ selectedUser }) {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null);
  const [typing, setTyping] = useState(false);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!selectedUser?._id) return;
    api.get(`/messages/conversation/${selectedUser._id}`).then(({ data }) => setMessages(data.messages));
  }, [selectedUser]);

  useEffect(() => {
    function receiveMessage(message) {
      if (message.senderId?._id === selectedUser?._id || message.senderId === selectedUser?._id) {
        setMessages((current) => [...current, message]);
      }
    }

    function handleTyping(payload) {
      if (payload.userId === selectedUser?._id) setTyping(true);
    }

    function handleStopTyping(payload) {
      if (payload.userId === selectedUser?._id) setTyping(false);
    }

    socket.on("message:receive", receiveMessage);
    socket.on("typing:start", handleTyping);
    socket.on("typing:stop", handleStopTyping);
    return () => {
      socket.off("message:receive", receiveMessage);
      socket.off("typing:start", handleTyping);
      socket.off("typing:stop", handleStopTyping);
    };
  }, [selectedUser, socket]);

  function handleTypingChange(value) {
    setMessageText(value);
    if (!selectedUser) return;
    socket.emit("typing:start", { receiverId: selectedUser._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit("typing:stop", { receiverId: selectedUser._id }), 700);
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!selectedUser || (!messageText.trim() && !file)) return;

    if (file) {
      const formData = new FormData();
      formData.append("receiverId", selectedUser._id);
      formData.append("messageText", messageText);
      formData.append("file", file);
      const { data } = await api.post("/messages", formData);
      setMessages((current) => [...current, data.message]);
    } else {
      socket.emit(
        "message:send",
        { receiverId: selectedUser._id, messageText },
        (response) => response?.ok && setMessages((current) => [...current, response.message])
      );
    }

    setMessageText("");
    setFile(null);
  }

  if (!selectedUser) {
    return <div className="grid flex-1 place-items-center bg-slate-50 text-slate-500">Select a user to start a protected chat.</div>;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <div>
          <h2 className="font-black">{selectedUser.username}</h2>
          <p className="text-sm text-slate-500">{typing ? "Typing..." : selectedUser.onlineStatus ? "Online" : "Offline"} · Socket {connected ? "connected" : "offline"}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-bold text-teal-800">
          <ShieldAlert size={16} />
          Auto threat detection enabled
        </div>
      </header>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} mine={(message.senderId?._id ?? message.senderId) === user._id} />
        ))}
      </div>
      <form className="border-t border-slate-200 bg-white p-4" onSubmit={sendMessage}>
        <div className="mb-3">
          <FileUploader file={file} onChange={setFile} onClear={() => setFile(null)} />
        </div>
        <div className="flex gap-2">
          <textarea
            className="min-h-12 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            onChange={(event) => handleTypingChange(event.target.value)}
            placeholder="Type a message or paste a suspicious link..."
            value={messageText}
          />
          <button className="rounded-lg bg-teal-700 px-5 font-black text-white hover:bg-teal-800" type="submit">
            <Send size={20} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default ChatWindow;
