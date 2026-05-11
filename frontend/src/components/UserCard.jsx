import { UserPlus } from "lucide-react";
import { shortName } from "../utils/formatters.js";

function UserCard({ user, onAdd }) {
  return (
    <article className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-900 font-bold text-white">
          {user.profilePicture ? <img alt="" className="h-full w-full rounded-lg object-cover" src={user.profilePicture} /> : shortName(user.username)}
        </div>
        <div>
          <h3 className="font-bold">{user.username}</h3>
          <p className="text-sm text-slate-500">{user.bio || "SentinelChat user"}</p>
        </div>
      </div>
      <button className="icon-action" onClick={() => onAdd?.(user._id)} type="button">
        <UserPlus size={18} />
      </button>
    </article>
  );
}

export default UserCard;
