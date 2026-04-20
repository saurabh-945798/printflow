import { motion } from "framer-motion";
import { ArrowRightIcon, CheckBadgeIcon, RocketLaunchIcon, SwatchIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiUrl } from "../../lib/api.js";

const perks = [
  "Save and resume design drafts",
  "Track orders with protected access",
  "Keep cart and profile synced securely",
];

const Signup = () => {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Signup failed");
      }

      await login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center text-slate-700">Checking session...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_40%,#eff6ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[-5rem] h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[28%] h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.94fr_1.06fr]">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="order-2 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur sm:p-8 lg:order-1"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
              PF
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Create your workspace</p>
              <p className="text-xs text-slate-500">Modern print management starts here</p>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-700">Sign Up</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Launch your account in one step.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Create an account, land on the dashboard instantly, and start customizing orders without extra setup.
            </p>
          </div>

          <form onSubmit={handleSignup} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Full name</label>
              <input
                name="name"
                required
                placeholder="Rahul Sharma"
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email address</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
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
                  : "bg-[linear-gradient(135deg,#0284c7,#ea580c)] shadow-lg shadow-orange-500/20 hover:translate-y-[-1px]"
              }`}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading ? <ArrowRightIcon className="h-4 w-4" /> : null}
            </motion.button>
          </form>

          <div className="mt-8 flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-sky-700 transition hover:text-orange-600">
                Login here
              </Link>
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Designed for fast ordering teams</p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="order-1 rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(17,24,39,0.88))] p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] lg:order-2"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300">
            <RocketLaunchIcon className="h-4 w-4" />
            Fresh workspace
          </div>

          <h2 className="mt-8 max-w-lg text-5xl font-bold leading-[1.02] text-white">
            Build a more refined print workflow from day one.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            PrintFlow helps teams move from rough requests to trackable, customized orders with cleaner coordination and less manual mess.
          </p>

          <div className="mt-10 grid gap-4">
            {perks.map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
              >
                <CheckBadgeIcon className="h-5 w-5 text-orange-300" />
                <span className="text-sm font-medium text-slate-100">{perk}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <SwatchIcon className="h-7 w-7 text-sky-300" />
              <p className="mt-4 text-lg font-semibold">Custom-first workflow</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Ideal for product customization, approval flow, and draft iteration.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <CheckBadgeIcon className="h-7 w-7 text-orange-300" />
              <p className="mt-4 text-lg font-semibold">Protected order space</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Keep carts, orders, and user sessions tied to a single secure account.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Signup;
