import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import SecurityBadge from "../components/SecurityBadge.jsx";
import api from "../services/api.js";

function HomeFeed() {
  const [body, setBody] = useState("");
  const [posts, setPosts] = useState([]);

  async function loadFeed() {
    const { data } = await api.get("/posts");
    setPosts(data.posts);
  }

  useEffect(() => {
    loadFeed();
  }, []);

  async function createPost(event) {
    event.preventDefault();
    if (!body.trim()) return;
    await api.post("/posts", { body });
    setBody("");
    loadFeed();
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-5 p-5">
      <div className="rounded-lg bg-slate-950 p-5 text-white">
        <div className="mb-2 flex items-center gap-2 text-teal-200">
          <ShieldCheck size={20} />
          AI-powered feed protection
        </div>
        <h1 className="text-2xl font-black">Home Feed</h1>
        <p className="mt-2 max-w-2xl text-slate-300">Every post is scanned for malicious links before it reaches your network.</p>
      </div>
      <form className="rounded-lg border border-slate-200 bg-white p-4" onSubmit={createPost}>
        <textarea className="field min-h-28" placeholder="Share an update or paste a link..." value={body} onChange={(event) => setBody(event.target.value)} />
        <button className="primary-button mt-3" type="submit">Publish securely</button>
      </form>
      <div className="grid gap-3">
        {posts.map((post) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4" key={post._id}>
            <div className="mb-3 flex items-center justify-between">
              <strong>{post.authorId?.username ?? "Unknown user"}</strong>
              <SecurityBadge status={post.safetyStatus} score={post.threatScore} />
            </div>
            <p className="leading-7 text-slate-700">{post.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HomeFeed;
