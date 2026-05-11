import { useEffect, useState } from "react";
import api from "../services/api.js";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get("/notifications").then(({ data }) => setNotifications(data.notifications));
  }, []);

  return (
    <section className="mx-auto grid max-w-4xl gap-4 p-5">
      <h1 className="text-2xl font-black">Notifications</h1>
      {notifications.map((notification) => (
        <article className="rounded-lg border border-slate-200 bg-white p-4" key={notification._id}>
          <div className="font-bold">{notification.title}</div>
          <p className="text-slate-600">{notification.body}</p>
        </article>
      ))}
      {!notifications.length ? <p className="text-slate-500">No notifications yet.</p> : null}
    </section>
  );
}

export default Notifications;
