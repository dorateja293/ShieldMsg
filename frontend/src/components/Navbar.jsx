import { LogOut, MessageCircle, UserRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <Link to="/chat" className="flex items-center gap-3 font-black text-slate-950">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#25d366] text-white">
          <MessageCircle size={22} />
        </span>
        Chats
      </Link>
      <nav className="flex items-center gap-2">
        <NavLink className="nav-link" to={`/profile/${user?._id}`}>
          <UserRound size={18} />
          Contacts
        </NavLink>
        <button className="nav-link" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
