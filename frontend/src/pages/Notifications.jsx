import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  async function load() {
    const { data } = await api.get("/notifications");
    setNotifications(data.notifications ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  }

  return (
    <section className="mx-auto grid max-w-4xl gap-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-black">Notifications</h1>
        <Link className="text-sm font-bold text-teal-700 hover:underline" to="/profile">
          Contacts & friend requests
        </Link>
      </div>
      <p className="text-sm text-slate-600">
        Friend requests, accepted friends, new messages, and threat alerts show up here. Use{" "}
        <strong>Contacts</strong> to accept or decline requests.
      </p>
      {notifications.map((notification) => (
        <article
          className={`rounded-lg border p-4 ${notification.read ? "border-slate-200 bg-white" : "border-teal-200 bg-teal-50/40"}`}
          key={notification._id}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-bold">{notification.title}</div>
              <p className="text-slate-600">{notification.body}</p>
              {notification.actorId?.username ? (
                <p className="mt-1 text-xs text-slate-500">From @{notification.actorId.username}</p>
              ) : null}
            </div>
            {!notification.read ? (
              <button
                className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                type="button"
                onClick={() => markRead(notification._id)}
              >
                Mark read
              </button>
            ) : (
              <span className="shrink-0 text-xs text-slate-400">Read</span>
            )}
          </div>
        </article>
      ))}
      {!notifications.length ? <p className="text-slate-500">No notifications yet.</p> : null}
    </section>
  );
}

export default Notifications;
