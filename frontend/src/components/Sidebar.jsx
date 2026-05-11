import { BarChart3, Home, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home Feed", icon: Home },
  { to: "/chat", label: "Secure Chat", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: ShieldCheck },
  { to: "/admin", label: "Security Admin", icon: BarChart3 }
];

function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 p-5 text-slate-100 lg:block">
      <div className="mb-8 rounded-lg border border-teal-400/20 bg-teal-400/10 p-4">
        <div className="mb-2 flex items-center gap-2 font-bold text-teal-100">
          <Users size={18} />
          Protected Network
        </div>
        <p className="text-sm leading-6 text-slate-300">Messages, files, links, and social posts are scanned before delivery.</p>
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
