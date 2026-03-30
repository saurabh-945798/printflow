import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";

const CART_KEY = "printflow_cart_v1";
const DRAFTS_KEY = "printflow_drafts_v1";
const ORDERS_KEY = "printflow_orders_v1";

const ACCENT = "indigo"; // keep single accent vibe

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

const categories = [
  {
    id: "flex",
    title: "Flex Printing",
    desc: "Large banners & hoardings",
    tag: "Popular",
    rate: 10,
    unit: "sq ft",
    img: "https://cdn.pixabay.com/photo/2019/07/19/07/18/printer-4348150_1280.jpg",
  },
  {
    id: "poster",
    title: "Poster Printing",
    desc: "High quality poster prints",
    tag: "Trending",
    rate: 8,
    unit: "sq ft",
    img: "https://cdn.pixabay.com/photo/2017/10/15/14/16/poster-mockup-2853851_1280.jpg",
  },
  {
    id: "visiting-card",
    title: "Visiting Cards",
    desc: "Professional business cards",
    tag: "Fast",
    rate: 5,
    unit: "unit",
    img: "https://media.istockphoto.com/id/617744688/photo/hand-hold-blank-white-card-mockup-with-rounded-corners.webp?s=2048x2048&w=is&k=20&c=mT3jt8SKP0e7jJmpsYo5I5wpo-Ooz1XNgFGyVeZoVFA=",
  },
  {
    id: "id-card",
    title: "ID Cards",
    desc: "Office & school ID cards",
    tag: "Secure",
    rate: 15,
    unit: "unit",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "brochure",
    title: "Brochures",
    desc: "Multi-page marketing brochures",
    tag: "Premium",
    rate: 25,
    unit: "unit",
    img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=60",
  },
];

const STATUS_COLOR = {
  Pending: "bg-slate-100 text-slate-700 ring-black/5",
  Confirmed: "bg-blue-50 text-blue-700 ring-blue-100",
  "In-Print": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  Shipped: "bg-amber-50 text-amber-700 ring-amber-100",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
};

const container = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
};

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // search + chips
  const [q, setQ] = useState("");
  const [activeChip, setActiveChip] = useState("All");

  // pricing teaser
  const [teaserCategory, setTeaserCategory] = useState("flex");
  const [L, setL] = useState(10);
  const [W, setW] = useState(8);

  // live mini data
  const [cartItems, setCartItems] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    setCartItems(safeParse(CART_KEY, []));
    setDrafts(safeParse(DRAFTS_KEY, []));

    const loadOrders = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data.orders) ? data.orders : [];
            localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
            setRecentOrders(list.slice(0, 3));
            return;
          }
        } catch {
          // fall back to local
        }
      }
      setRecentOrders(safeParse(ORDERS_KEY, []).slice(0, 3));
    };

    loadOrders();
  }, [token]);

  const cartTotal = useMemo(() => {
    // If your cart already has subtotal per item, use that
    // Otherwise fallback 0 for now
    return cartItems.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
  }, [cartItems]);

  const chipOptions = useMemo(() => ["All", ...categories.map((c) => c.id)], []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let base = categories;

    if (activeChip !== "All") {
      base = base.filter((c) => c.id === activeChip);
    }

    if (!s) return base;

    return base.filter(
      (c) =>
        c.title.toLowerCase().includes(s) || c.desc.toLowerCase().includes(s)
    );
  }, [q, activeChip]);

  const quickStart = useMemo(() => categories.slice(0, 4), []);

  const teaserMeta = useMemo(
    () => categories.find((c) => c.id === teaserCategory) || categories[0],
    [teaserCategory]
  );

  const teaserArea = useMemo(() => {
    if (teaserMeta.unit !== "sq ft") return 1;
    return Math.max(1, Number(L) || 1) * Math.max(1, Number(W) || 1);
  }, [L, W, teaserMeta.unit]);

  const teaserPrice = useMemo(() => teaserArea * teaserMeta.rate, [teaserArea, teaserMeta.rate]);

  const supportNumber = "919457982221";
  const supportLink = `https://wa.me/${supportNumber}?text=${encodeURIComponent(
    "Hi PrintFlow Support, I need help with my order."
  )}`;

  return (
    <div className="min-h-screen bg-[#F6F8FC] text-[#0B1220] relative overflow-hidden">
      {/* Subtle mesh background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* Sticky top bar with user + cart */}
      <div className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-black/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-700">PF</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">PrintFlow</p>
              <p className="text-xs text-slate-600">
                {user?.name || "User"} • {user?.email || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/cart")}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-black/5 hover:ring-black/10 transition"
            >
              Cart • {formatINR(cartTotal)}
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Orders
            </button>

            <button
              onClick={logout}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* HERO: Quick Start strip */}
        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Quick Start
              </h1>
              <p className="mt-1 text-slate-600">
                Pick a top service, preview pricing, and continue drafts instantly.
              </p>
            </div>

            {/* Search bar */}
            <div className="w-full md:w-[420px]">
              <div className="relative">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search services (flex, poster...)"
                  className="w-full rounded-2xl bg-slate-50 px-4 py-3 pr-10 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-indigo-200 transition"
                />
                {q?.trim() ? (
                  <button
                    onClick={() => setQ("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    type="button"
                  >
                    Clear
                  </button>
                ) : (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ⌘K
                  </span>
                )}
              </div>

              {/* Category filter chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {chipOptions.map((chip) => {
                  const active = chip === activeChip;
                  const label =
                    chip === "All"
                      ? "All"
                      : categories.find((c) => c.id === chip)?.title?.replace(" Printing", "") ||
                        chip;

                  return (
                    <button
                      key={chip}
                      onClick={() => setActiveChip(chip)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
                        active
                          ? "bg-indigo-600 text-white ring-indigo-600"
                          : "bg-white text-slate-700 ring-black/5 hover:ring-black/10"
                      }`}
                      type="button"
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Start cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickStart.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate(`/customize/${cat.id}`)}
                className="group cursor-pointer overflow-hidden rounded-3xl bg-slate-50 ring-1 ring-black/5 hover:ring-black/10 transition"
              >
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-900 ring-1 ring-black/5">
                    {cat.tag}
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-sm font-semibold">{cat.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{cat.desc}</p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Starts at ₹{cat.rate}/{cat.unit}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Row: Live pricing teaser + Recent orders + Support */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Live pricing teaser panel */}
          <div className="lg:col-span-5 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Live pricing preview</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Mini calculator for quick estimate.
                </p>
              </div>

              <select
                value={teaserCategory}
                onChange={(e) => setTeaserCategory(e.target.value)}
                className="rounded-2xl bg-slate-50 px-3 py-2 text-sm ring-1 ring-black/5"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 font-medium">Rate</span>
                <span className="font-semibold">
                  ₹{teaserMeta.rate}/{teaserMeta.unit}
                </span>
              </div>

              {teaserMeta.unit === "sq ft" ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Length (ft)</label>
                    <input
                      type="number"
                      value={L}
                      onChange={(e) => setL(Number(e.target.value))}
                      className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm ring-1 ring-black/5 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Width (ft)</label>
                    <input
                      type="number"
                      value={W}
                      onChange={(e) => setW(Number(e.target.value))}
                      className="mt-1 w-full rounded-2xl bg-white px-4 py-2 text-sm ring-1 ring-black/5 focus:ring-2 focus:ring-indigo-200 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  Unit-based pricing. Quantity will affect total.
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-600">Preview price</span>
                <span className="text-xl font-bold text-slate-900">{formatINR(teaserPrice)}</span>
              </div>

              <button
                onClick={() => navigate(`/customize/${teaserMeta.id}`)}
                className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Open Customization →
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-4 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent orders</h2>
              <button
                onClick={() => navigate("/orders")}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {!recentOrders?.length ? (
                <div className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
                  <p className="text-sm font-semibold text-slate-900">No recent orders</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Create a customization and place your first order.
                  </p>
                </div>
              ) : (
                recentOrders.slice(0, 3).map((o) => {
                  const firstItem = o.items?.[0];
                  const total = o.totals?.grand || o.total || 0;
                  o.size = o.items?.length ? `${o.items.length} item(s)` : "";
                  o.total = total;
                  return (
                  <div key={o.id || `${firstItem?.category || "order"}-${total}`} className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{firstItem?.category || "Order"}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {o.size ? `${o.size} • ` : ""}Total {formatINR(o.total || 0)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${
                          STATUS_COLOR[o.status || "Pending"] || STATUS_COLOR.Pending
                        }`}
                      >
                        {o.status || "Pending"}
                      </span>
                    </div>
                  </div>
                );
                })
              )}
            </div>
          </div>

          {/* Help / WhatsApp support */}
          <div className="lg:col-span-3 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
            <h2 className="text-lg font-semibold">Help & Support</h2>
            <p className="text-sm text-slate-600 mt-1">
              Need quick assistance? WhatsApp us.
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
              <p className="text-xs font-semibold text-slate-700">WhatsApp Support</p>
              <p className="text-xs text-slate-600 mt-1">
                Fast replies • Order help • Design questions
              </p>

              <button
                onClick={() => window.open(supportLink, "_blank")}
                className="mt-4 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Chat on WhatsApp →
              </button>

              <p className="mt-2 text-[11px] text-slate-500">
                Replace supportNumber in code.
              </p>
            </div>
          </div>
        </div>

        {/* Draft customizations */}
        <div className="mt-6 rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Draft customizations</h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm font-medium text-slate-600 hover:underline"
              type="button"
            >
              Refresh
            </button>
          </div>

          <p className="text-sm text-slate-600 mt-1">
            Continue unfinished items you saved earlier.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!drafts?.length ? (
              <div className="rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4 sm:col-span-2 lg:col-span-3">
                <p className="text-sm font-semibold text-slate-900">No drafts saved</p>
                <p className="text-xs text-slate-600 mt-1">
                  Start customizing a service — drafts will appear here.
                </p>
              </div>
            ) : (
              drafts.slice(0, 6).map((d) => {
                const cat = categories.find((c) => c.id === d.category) || categories[0];
                return (
                  <motion.div
                    key={d.id || `${d.category}-${d.updatedAt}`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className="rounded-3xl bg-slate-50 ring-1 ring-black/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{cat.title}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {d.length && d.width ? `${d.length}×${d.width} ft` : "Unit-based"} •{" "}
                          {d.qty ? `Qty ${d.qty}` : "Qty 1"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold ring-1 ring-black/5">
                        Draft
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/customize/${d.category}`)}
                      className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-sm font-medium ring-1 ring-black/5 hover:ring-black/10 transition"
                    >
                      Continue →
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Grid (filtered) */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((cat) => (
            <motion.div
              key={cat.id}
              variants={item}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(`/customize/${cat.id}`)}
              className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 hover:ring-black/10 transition"
            >
              {/* thumbnail instead of emoji */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 ring-1 ring-black/5">
                  {cat.tag}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold tracking-tight">{cat.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{cat.desc}</p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Starts at ₹{cat.rate}/{cat.unit}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/customize/${cat.id}`);
                    }}
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    Customize →
                  </button>
                </div>

                <div className="mt-4 h-px w-0 bg-indigo-600/70 transition-all duration-300 group-hover:w-full" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="mt-10 pb-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} PrintFlow • Smart customization & WhatsApp ordering
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
