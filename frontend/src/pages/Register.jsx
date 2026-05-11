import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", bio: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message ?? "Registration failed");
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-lockup">
          <ShieldCheck size={30} />
          <span>SentinelChat</span>
        </div>
        <h1>Create your protected identity</h1>
        <form className="grid gap-3" onSubmit={submit}>
          <input className="field" placeholder="Username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          <input className="field" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="field" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <textarea className="field min-h-24" placeholder="Bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button className="primary-button" type="submit">Register</button>
        </form>
        <p className="text-sm text-slate-500">
          Already registered? <Link className="font-bold text-teal-700" to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
