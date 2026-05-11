import { useEffect, useState } from "react";
import ChatList from "../components/ChatList.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import api from "../services/api.js";

function ChatDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    api.get("/users").then(({ data }) => {
      setUsers(data.users);
      setSelectedUser(data.users[0] ?? null);
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0">
      <ChatList users={users} selectedUser={selectedUser} onSelect={setSelectedUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}

export default ChatDashboard;
