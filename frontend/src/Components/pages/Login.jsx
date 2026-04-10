import { motion } from "framer-motion";
import { ArrowRightIcon, CheckCircleIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiUrl } from "../../lib/api.js";

const highlights = [
  "Live price previews before checkout",
  "Saved drafts across your sessions",
  "Cart and order sync with secure auth",
];

const Login = () => {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Skip login screen when a valid session is already loaded.
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Login failed");
      }

      await login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-700">Checking session...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_38%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-4rem] h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-[-5rem] left-1/3 h-80 w-80 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(255,255,255,0.55))] p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur xl:block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-orange-500/20">
              PF
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">PrintFlow Studio</p>
              <p className="text-sm text-slate-500">Production dashboard for modern print teams</p>
            </div>
          </div>

          <div className="mt-12 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              <SparklesIcon className="h-4 w-4 text-orange-500" />
              Modern print operations, one workspace
            </div>

            <h1 className="mt-6 text-5xl font-bold leading-[1.02] text-slate-950">
              Sign in and move straight into your
              <span className="bg-[linear-gradient(135deg,#ea580c,#0284c7)] bg-clip-text text-transparent"> print command center.</span>
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Manage custom designs, cart flows, and order tracking from one polished dashboard built for speed.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-4 shadow-sm"
              >
                <CheckCircleIcon className="h-5 w-5 text-sky-600" />
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-2xl font-bold">24/7</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Order visibility</p>
            </div>
            <div className="rounded-2xl bg-white/90 px-5 py-4 text-slate-900 ring-1 ring-slate-200">
              <p className="text-2xl font-bold">Live</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Cart sync</p>
            </div>
            <div className="rounded-2xl bg-white/90 px-5 py-4 text-slate-900 ring-1 ring-slate-200">
              <p className="text-2xl font-bold">Fast</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Checkout flow</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur sm:p-8"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 xl:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                PF
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">PrintFlow</p>
                <p className="text-xs text-slate-500">Smart print ordering</p>
              </div>
            </div>

            <div className="ml-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <ShieldCheckIcon className="h-4 w-4" />
              Secure JWT auth
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-600">Login</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Welcome back</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Access your dashboard, drafts, cart and order activity from the same account.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Enter your password"
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            <motion.button
              whileTap={{ scale: 0.985 }}
              disabled={loading}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold text-white transition ${
                loading
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-[linear-gradient(135deg,#ea580c,#0284c7)] shadow-lg shadow-sky-500/20 hover:translate-y-[-1px]"
              }`}
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
              {!loading ? <ArrowRightIcon className="h-4 w-4" /> : null}
            </motion.button>
          </form>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-sky-700 transition hover:text-orange-600">
                Create your account
              </Link>
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Print smarter. Ship faster.</p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Login;
