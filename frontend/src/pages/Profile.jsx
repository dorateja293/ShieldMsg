import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import UserCard from "../components/UserCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    api.get(`/users/${id ?? user._id}`).then(({ data }) => setProfile(data.user));
    api.get("/users").then(({ data }) => setPeople(data.users));
  }, [id, user._id]);

  async function addFriend(userId) {
    await api.post(`/friends/${userId}/request`);
  }

  if (!profile) return <div className="p-5">Loading profile...</div>;

  return (
    <section className="grid gap-5 p-5 xl:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-lg bg-slate-950 text-2xl font-black text-white">
            {profile.username?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black">{profile.username}</h1>
            <p className="text-slate-500">{profile.onlineStatus ? "Online" : "Offline"}</p>
          </div>
        </div>
        <p className="max-w-2xl leading-7 text-slate-700">{profile.bio || "No bio yet."}</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Metric label="Friends" value={profile.friends?.length ?? 0} />
          <Metric label="Followers" value={profile.followers?.length ?? 0} />
          <Metric label="Following" value={profile.following?.length ?? 0} />
        </div>
      </div>
      <aside className="grid content-start gap-3">
        <h2 className="text-lg font-black">Find people</h2>
        {people.slice(0, 6).map((person) => (
          <UserCard key={person._id} user={person} onAdd={addFriend} />
        ))}
      </aside>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-100 p-4">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default Profile;
