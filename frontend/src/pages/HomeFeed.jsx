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
      <div className="rounded-3xl bg-[#111b21] p-6 text-white shadow-[0_18px_40px_rgba(17,27,33,0.22)]">
        <div className="mb-2 flex items-center gap-2 text-[#a9f5d2]">
          <ShieldCheck size={20} />
          AI-powered feed protection
        </div>
        <h1 className="text-2xl font-semibold">Home Feed</h1>
        <p className="mt-2 max-w-2xl text-[#c7d2d9]">Every post is scanned for malicious links before it reaches your network.</p>
      </div>
      <form className="rounded-3xl border border-[#e9edef] bg-white/90 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur" onSubmit={createPost}>
        <textarea
          className="field min-h-28 rounded-2xl bg-[#f7f8fa]"
          placeholder="Share an update or paste a link..."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <button className="primary-button mt-3" type="submit">
          Publish securely
        </button>
      </form>
      <div className="grid gap-3">
        {posts.map((post) => (
          <article className="rounded-3xl border border-[#e9edef] bg-white/90 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur" key={post._id}>
            <div className="mb-3 flex items-center justify-between">
              <strong className="text-[#111b21]">{post.authorId?.username ?? "Unknown user"}</strong>
              <SecurityBadge status={post.safetyStatus} score={post.threatScore} />
            </div>
            <p className="leading-7 text-[#54656f]">{post.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HomeFeed;
