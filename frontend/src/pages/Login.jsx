import { Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { extractFieldErrors, firstApiMessage } from "../utils/apiErrors.js";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function submit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      await login(form);
      navigate("/chat");
    } catch (err) {
      const fe = extractFieldErrors(err);
      setFieldErrors(fe);
      if (Object.keys(fe).length === 0) {
        setError(firstApiMessage(err) || "Login failed");
      }
    }
  }

  function fieldClass(name) {
    const base = "field";
    return fieldErrors[name] ? `${base} ring-2 ring-red-400 focus:ring-red-500` : base;
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-lockup">
          <Shield size={30} />
          <span>SentinelChat</span>
        </div>
        <h1>Secure social messaging</h1>
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              autoComplete="email"
              aria-invalid={fieldErrors.email ? "true" : "false"}
              className={fieldClass("email")}
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            {fieldErrors.email ? <p className="text-xs font-medium text-red-600">{fieldErrors.email}</p> : null}
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              autoComplete="current-password"
              aria-invalid={fieldErrors.password ? "true" : "false"}
              className={fieldClass("password")}
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            {fieldErrors.password ? <p className="text-xs font-medium text-red-600">{fieldErrors.password}</p> : null}
          </div>
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
