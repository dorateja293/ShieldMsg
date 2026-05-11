import { Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message ?? "Login failed");
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-lockup">
          <Shield size={30} />
          <span>SentinelChat</span>
        </div>
        <h1>Secure social messaging</h1>
        <form className="grid gap-3" onSubmit={submit}>
          <input className="field" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input className="field" placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button className="primary-button" type="submit">Login</button>
        </form>
        <p className="text-sm text-slate-500">
          New here? <Link className="font-bold text-teal-700" to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
