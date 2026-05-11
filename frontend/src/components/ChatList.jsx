import { MessageSquare } from "lucide-react";
import SecurityBadge from "./SecurityBadge.jsx";

function ChatList({ users, selectedUser, onSelect }) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-slate-200 bg-white md:w-80">
      <div className="border-b border-slate-200 p-4">
        <h2 className="flex items-center gap-2 text-lg font-black">
          <MessageSquare size={20} />
          Secure Chats
        </h2>
        <p className="text-sm text-slate-500">Real-time messaging with automatic scans</p>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {users.map((user) => (
          <button
            className={`mb-2 flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-100 ${
              selectedUser?._id === user._id ? "bg-teal-50 ring-1 ring-teal-200" : ""
            }`}
            key={user._id}
            onClick={() => onSelect(user)}
            type="button"
          >
            <span>
              <span className="block font-bold">{user.username}</span>
              <span className="text-sm text-slate-500">{user.onlineStatus ? "Online" : "Offline"}</span>
            </span>
            <SecurityBadge status="safe" />
          </button>
        ))}
      </div>
    </aside>
  );
}

export default ChatList;
