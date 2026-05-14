import { BarChart3, Bell, MessageCircle, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Sidebar() {
  const { user } = useAuth();
  const baseLinks = [
    { to: "/chat", label: "Chats", icon: MessageCircle },
    { to: `/profile/${user?._id ?? ""}`, label: "Contacts", icon: UserRound },
    { to: "/notifications", label: "Alerts", icon: Bell }
  ];

  const adminLink =
    user?.role === "admin"
      ? [{ to: "/admin", label: "Security console", icon: BarChart3 }]
      : [];

  const links = [...baseLinks, ...adminLink];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-slate-100 lg:block">
      <div className="mb-8 rounded-lg border border-teal-400/20 bg-teal-400/10 p-4">
        <div className="mb-2 flex items-center gap-2 font-bold text-teal-100">
          <MessageCircle size={18} />
          Messenger
        </div>
        <p className="text-sm leading-6 text-slate-300">Private chats with link and file checks before delivery.</p>
      </div>
      <nav className="grid gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `side-link ${isActive ? "side-link-active" : ""}`}>
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
