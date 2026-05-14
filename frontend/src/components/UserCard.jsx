import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import ChatAvatar from "./ChatAvatar.jsx";

function UserCard({ user, onAdd, dark }) {
  return (
    <article
      className={`flex items-center justify-between rounded-xl p-3 ${
        dark ? "border border-[#2a3942] bg-[#202c33]" : "border border-slate-200 bg-white"
      }`}
    >
      <Link className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-0.5 pr-2 hover:opacity-90" to={`/profile/${user._id}`}>
        <ChatAvatar imageUrl={user.profilePicture} name={user.username} size={44} />
        <div className="min-w-0">
          <h3 className={`truncate font-semibold ${dark ? "text-[#e9edef]" : "text-slate-900"}`}>{user.username}</h3>
          <p className={`truncate text-sm ${dark ? "text-[#8696a0]" : "text-slate-500"}`}>{user.bio || "SentinelChat user"}</p>
        </div>
      </Link>
      <button
        className={
          dark
            ? "icon-action flex shrink-0 border-0 bg-[#00a884]/20 text-[#00a884] hover:bg-[#00a884]/30"
            : "icon-action flex shrink-0"
        }
        onClick={(e) => {
          e.preventDefault();
          onAdd?.(user._id);
        }}
        type="button"
        title="Add friend"
      >
        <UserPlus size={18} />
      </button>
    </article>
  );
}

export default UserCard;
