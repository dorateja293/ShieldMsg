import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { extractFieldErrors, firstApiMessage } from "../utils/apiErrors.js";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", bio: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  async function submit(event) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      await register(form);
      navigate("/chat");
    } catch (err) {
      const fe = extractFieldErrors(err);
      setFieldErrors(fe);

      const status = err.response?.status;
      const apiMsg = firstApiMessage(err);

      if (Object.keys(fe).length > 0) {
        setError("");
      } else if (status === 409) {
        setError("An account with this email or username already exists.");
      } else {
        setError(apiMsg || "Registration failed");
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
          <ShieldCheck size={30} />
          <span>SentinelChat</span>
        </div>
        <h1>Create your protected identity</h1>
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="register-username">
              Username
            </label>
            <input
              id="register-username"
              autoComplete="username"
              aria-invalid={fieldErrors.username ? "true" : "false"}
              aria-describedby={fieldErrors.username ? "register-username-error" : undefined}
              className={fieldClass("username")}
              placeholder="3–32 characters"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
            {fieldErrors.username ? (
              <p className="text-xs font-medium text-red-600" id="register-username-error" role="alert">
                {fieldErrors.username}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              autoComplete="email"
              aria-invalid={fieldErrors.email ? "true" : "false"}
              aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
              className={fieldClass("email")}
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            {fieldErrors.email ? (
              <p className="text-xs font-medium text-red-600" id="register-email-error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? "true" : "false"}
              aria-describedby="register-password-hint register-password-error"
              className={fieldClass("password")}
              placeholder="••••••••"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <p className="text-xs text-slate-500" id="register-password-hint">
              Use at least 8 characters.
            </p>
            {fieldErrors.password ? (
              <p className="text-xs font-medium text-red-600" id="register-password-error" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-semibold text-slate-700" htmlFor="register-bio">
              Bio <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              id="register-bio"
              aria-invalid={fieldErrors.bio ? "true" : "false"}
              aria-describedby={fieldErrors.bio ? "register-bio-error" : undefined}
              className={`${fieldClass("bio")} min-h-24`}
              placeholder="Tell others about you"
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
            />
            {fieldErrors.bio ? (
              <p className="text-xs font-medium text-red-600" id="register-bio-error" role="alert">
                {fieldErrors.bio}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm font-semibold text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button className="primary-button" type="submit">
            Register
          </button>
        </form>
        <p className="text-sm text-slate-500">
          Already registered?{" "}
          <Link className="font-bold text-teal-700" to="/login">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
