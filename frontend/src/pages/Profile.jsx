import { ArrowLeft, Camera, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatAvatar from "../components/ChatAvatar.jsx";
import UserCard from "../components/UserCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [people, setPeople] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const isOwnProfile = !id || String(id) === String(user._id);
  const profileId = id ?? user._id;

  useEffect(() => {
    api.get(`/users/${profileId}`).then(({ data }) => setProfile(data.user));
    if (isOwnProfile) {
      api.get("/users").then(({ data }) => setPeople(data.users));
    } else {
      setPeople([]);
    }
  }, [profileId, isOwnProfile]);

  useEffect(() => {
    if (!isOwnProfile) {
      setIncomingRequests([]);
      return;
    }
    api
      .get("/friends/requests")
      .then(({ data }) => setIncomingRequests(data.requests ?? []))
      .catch(() => setIncomingRequests([]));
  }, [isOwnProfile, profile?._id]);

  async function addFriend(userId) {
    await api.post(`/friends/${userId}/request`);
  }

  async function respondToRequest(friendshipId, action) {
    setBusyId(friendshipId);
    try {
      await api.patch(`/friends/requests/${friendshipId}`, { action });
      setIncomingRequests((prev) => prev.filter((r) => r._id !== friendshipId));
      const { data } = await api.get(`/users/${user._id}`);
      setProfile(data.user);
    } finally {
      setBusyId(null);
    }
  }

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !isOwnProfile) return;

    setPhotoError("");
    setPhotoBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/uploads", formData);

      if (data.blocked || !data.file?.fileUrl) {
        setPhotoError("This file was blocked by security scanning. Try a different image.");
        return;
      }

      const { data: updated } = await api.patch("/users/me/profile", {
        profilePicture: data.file.fileUrl
      });

      setProfile((prev) => (prev ? { ...prev, ...updated.user } : prev));
      setUser(updated.user);
      localStorage.setItem("sentinelchat_user", JSON.stringify(updated.user));
    } catch (err) {
      const msg =
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Could not update photo. Use JPG or PNG under the size limit.";
      setPhotoError(msg);
    } finally {
      setPhotoBusy(false);
    }
  }

  function openMessage() {
    if (!profile?._id) return;
    navigate("/chat", { state: { openChatWith: profile._id } });
  }

  if (!profile) {
    return (
      <div className="grid min-h-[50vh] place-items-center bg-[#0b141a] text-[#8696a0]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b141a] text-[#e9edef]">
      {/* Top bar — WhatsApp-style contact info */}
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#2a3942] bg-[#202c33] px-2 py-3 sm:px-4">
        <Link
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#aebac1] hover:bg-[#2a3942]"
          to="/chat"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="min-w-0 flex-1 text-center text-[16px] font-medium text-[#e9edef] sm:text-left">
          {isOwnProfile ? "Profile" : "Contact info"}
        </h1>
        {isOwnProfile ? (
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#aebac1] hover:bg-[#2a3942] disabled:opacity-50"
            type="button"
            title="Change profile photo"
            aria-label="Change profile photo"
            disabled={photoBusy}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={22} />
          </button>
        ) : (
          <span className="w-10 shrink-0" aria-hidden />
        )}
      </header>

      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        type="file"
        onChange={handlePhotoChange}
      />

      {/* Hero — photo + name */}
      <section className="border-b border-[#2a3942] bg-[#0b141a] px-4 pb-8 pt-10 text-center">
        <div className="relative mx-auto w-fit">
          <ChatAvatar className="ring-4 ring-[#2a3942]" imageUrl={profile.profilePicture} name={profile.username} size={200} />
          {isOwnProfile ? (
            <button
              className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#00a884] text-white shadow-lg hover:bg-[#008f72] disabled:opacity-50"
              type="button"
              title="Change photo"
              disabled={photoBusy}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={20} />
            </button>
          ) : null}
        </div>
        <h2 className="mt-6 text-[24px] font-normal text-[#e9edef]">{profile.username}</h2>
        {isOwnProfile && profile.email ? (
          <p className="mt-1 text-[15px] text-[#8696a0]">{profile.email}</p>
        ) : null}
        <p className="mt-2 text-[14px] capitalize text-[#8696a0]">
          {profile.onlineStatus ? "online" : "offline"}
        </p>

        {photoError ? <p className="mx-auto mt-4 max-w-md text-[13px] text-red-400">{photoError}</p> : null}
        {photoBusy ? <p className="mt-2 text-[13px] text-[#8696a0]">Updating photo…</p> : null}

        {!isOwnProfile ? (
          <div className="mx-auto mt-8 flex max-w-xs justify-center gap-6">
            <button
              className="flex flex-col items-center gap-2 text-[#aebac1] transition hover:text-[#00a884]"
              type="button"
              onClick={openMessage}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#202c33] ring-1 ring-[#2a3942]">
                <MessageCircle size={26} className="text-[#00a884]" />
              </span>
              <span className="text-[13px]">Message</span>
            </button>
          </div>
        ) : null}
      </section>

      {/* Bio */}
      <section className="border-b border-[#2a3942] bg-[#111b21] px-4 py-4">
        <p className="text-center text-[15px] leading-relaxed text-[#aebac1]">
          {profile.bio?.trim() ? profile.bio : isOwnProfile ? "No bio yet. Edit from settings later." : "No bio."}
        </p>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-3 divide-x divide-[#2a3942] border-b border-[#2a3942] bg-[#111b21]">
        <Metric label="Friends" value={profile.friends?.length ?? 0} />
        <Metric label="Followers" value={profile.followers?.length ?? 0} />
        <Metric label="Following" value={profile.following?.length ?? 0} />
      </section>

      {/* Friend requests — own only */}
      {isOwnProfile && incomingRequests.length > 0 ? (
        <section className="border-b border-[#2a3942] px-4 py-5">
          <h3 className="mb-3 text-[15px] font-medium text-[#8696a0]">Friend requests</h3>
          <ul className="grid gap-3">
            {incomingRequests.map((req) => {
              const from = req.requester;
              const name = from?.username ?? "Someone";
              const loading = busyId === req._id;
              return (
                <li
                  className="rounded-xl border border-[#2a3942] bg-[#202c33] p-4"
                  key={req._id}
                >
                  <div className="font-medium text-[#e9edef]">{name}</div>
                  <p className="mt-1 text-[13px] text-[#aebac1]">Wants to connect with you.</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-lg bg-[#00a884] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#008f72] disabled:opacity-50"
                      disabled={loading}
                      type="button"
                      onClick={() => respondToRequest(req._id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="rounded-lg border border-[#2a3942] px-4 py-2 text-[13px] font-semibold text-[#e9edef] hover:bg-[#2a3942] disabled:opacity-50"
                      disabled={loading}
                      type="button"
                      onClick={() => respondToRequest(req._id, "reject")}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Find people — own only */}
      {isOwnProfile ? (
        <section className="px-4 py-6 pb-12">
          <h3 className="mb-1 text-[15px] font-medium text-[#8696a0]">Find people</h3>
          <p className="mb-4 text-[13px] leading-relaxed text-[#667781]">
            Tap the + button to send a friend request. Open someone&apos;s profile from the chat header.
          </p>
          <div className="grid max-w-lg gap-3">
            {people.slice(0, 12).map((person) => (
              <UserCard key={person._id} dark user={person} onAdd={addFriend} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="py-4 text-center">
      <div className="text-[20px] font-medium text-[#e9edef]">{value}</div>
      <div className="mt-0.5 text-[12px] text-[#8696a0]">{label}</div>
    </div>
  );
}

export default Profile;
