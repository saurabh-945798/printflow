import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiUrl } from "../../lib/api.js";

const CART_KEY = "printflow_cart_v1";
const DRAFTS_KEY = "printflow_drafts_v1";
const ORDERS_KEY = "printflow_orders_v1";

const categories = [
  {
    id: "cloth",
    title: "Cloth Printing",
    desc: "T-shirts, uniforms, hoodies, and fabric branding prints.",
    tag: "Popular",
    rate: 10,
    unit: "sq ft",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=60",
    tone: "from-orange-500/20 to-sky-500/20",
  },
  {
    id: "cup",
    title: "Cup Printing",
    desc: "Custom mugs and cups with branded artwork, names, and gift designs.",
    tag: "Trending",
    rate: 299,
    unit: "unit",
    img: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=1200&q=60",
    tone: "from-sky-500/20 to-indigo-500/20",
  },
  {
    id: "visiting-card",
    title: "Visiting Cards",
    desc: "Modern business cards with editable templates and premium finish.",
    tag: "Fast",
    rate: 5,
    unit: "unit",
    img: "https://media.istockphoto.com/id/617744688/photo/hand-hold-blank-white-card-mockup-with-rounded-corners.webp?s=2048x2048&w=is&k=20&c=mT3jt8SKP0e7jJmpsYo5I5wpo-Ooz1XNgFGyVeZoVFA=",
    tone: "from-indigo-500/20 to-orange-500/20",
  },
  {
    id: "id-card",
    title: "ID Cards",
    desc: "School, office, and event ID cards with secure editable layouts.",
    tag: "Secure",
    rate: 15,
    unit: "unit",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=60",
    tone: "from-slate-300/30 to-sky-500/15",
  },
  {
    id: "brochure",
    title: "Brochures",
    desc: "Multi-page brand brochures, menu cards, and printed catalogs.",
    tag: "Premium",
    rate: 25,
    unit: "unit",
    img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=60",
    tone: "from-orange-400/20 to-amber-500/15",
  },
];

const statusTone = {
  Pending: "bg-slate-100 text-slate-700 ring-slate-200",
  Confirmed: "bg-sky-50 text-sky-700 ring-sky-100",
  "In-Print": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  Shipped: "bg-amber-50 text-amber-700 ring-amber-100",
  Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-100",
};

const container = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32 } },
};

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [activeChip, setActiveChip] = useState("All");
  const [teaserCategory, setTeaserCategory] = useState("cloth");
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(8);
  const [cartItems, setCartItems] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    setCartItems(safeParse(CART_KEY, []));
    setDrafts(safeParse(DRAFTS_KEY, []));

    const loadOrders = async () => {
      if (token) {
        try {
          const res = await fetch(apiUrl("/api/orders"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data.orders) ? data.orders : [];
            localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
            setRecentOrders(list.slice(0, 4));
            return;
          }
        } catch {
          // fall back to local cache
        }
      }

      setRecentOrders(safeParse(ORDERS_KEY, []).slice(0, 4));
    };

    loadOrders();
  }, [token]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0),
    [cartItems]
  );

  const chipOptions = useMemo(() => ["All", ...categories.map((c) => c.id)], []);

  const filteredServices = useMemo(() => {
    const search = q.trim().toLowerCase();
    let base = categories;

    if (activeChip !== "All") {
      base = base.filter((c) => c.id === activeChip);
    }

    if (!search) return base;

    return base.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.desc.toLowerCase().includes(search) ||
        c.tag.toLowerCase().includes(search)
    );
  }, [q, activeChip]);

  const teaserMeta = useMemo(
    () => categories.find((c) => c.id === teaserCategory) || categories[0],
    [teaserCategory]
  );

  const teaserArea = useMemo(() => {
    if (teaserMeta.unit !== "sq ft") return 1;
    return Math.max(1, Number(length) || 1) * Math.max(1, Number(width) || 1);
  }, [length, teaserMeta.unit, width]);

  const teaserPrice = useMemo(() => teaserArea * teaserMeta.rate, [teaserArea, teaserMeta.rate]);

  const statCards = [
    {
      title: "Active services",
      value: categories.length,
      meta: "Templates and print categories ready",
      icon: SparklesIcon,
      tone: "from-orange-500/15 to-sky-500/15",
    },
    {
      title: "Draft designs",
      value: drafts.length,
      meta: "Saved customizations you can resume",
      icon: FolderIcon,
      tone: "from-sky-500/15 to-indigo-500/15",
    },
    {
      title: "Tracked orders",
      value: recentOrders.length,
      meta: "Latest order activity from your account",
      icon: ClipboardDocumentCheckIcon,
      tone: "from-indigo-500/15 to-orange-500/15",
    },
    {
      title: "Cart value",
      value: formatINR(cartTotal),
      meta: "Current order value before checkout",
      icon: ChartBarSquareIcon,
      tone: "from-emerald-500/15 to-sky-500/15",
    },
  ];

  const supportLink = `https://wa.me/919457982221?text=${encodeURIComponent(
    "Hi PrintFlow Support, I need help with my order."
  )}`;

  return (
    <div className="relative min-h-full overflow-x-hidden bg-transparent text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-200/35 blur-3xl" />
        <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38 }}
          className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7"
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">Dashboard</p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Print operations, cleaner and faster.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Welcome back, {user?.name || "User"}. Manage custom print services, drafts, cart activity, and
                  order tracking from one focused workspace.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[26rem]">
                <button
                  onClick={() => navigate("/cart")}
                  className="inline-flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingBagIcon className="h-5 w-5 text-sky-600" />
                    Cart
                  </span>
                  <span>{formatINR(cartTotal)}</span>
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  View Orders
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -3 }}
                  className={`rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,255,255,0.6))] p-5 shadow-sm`}
                >
                  <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${card.tone} p-3 ring-1 ring-slate-200`}>
                    <card.icon className="h-6 w-6 text-slate-800" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{card.value}</p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{card.meta}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.04 }}
            className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-7"
          >
            <div className="rounded-[1.85rem] border border-slate-200/90 bg-[linear-gradient(135deg,rgba(248,250,252,0.95),rgba(255,255,255,0.88))] p-5 sm:p-6">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Service finder</p>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.15rem]">Quick Start</h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                      Pick a service, compare categories, and jump into customization with a cleaner starting point.
                    </p>
                  </div>

                  <div className="w-full xl:max-w-[470px]">
                    <div className="relative">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search services, templates, cards..."
                        className="w-full rounded-[1.35rem] border border-slate-200 bg-white px-12 py-3.5 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {chipOptions.map((chip) => {
                        const active = chip === activeChip;
                        const label =
                          chip === "All"
                            ? "All"
                            : categories.find((c) => c.id === chip)?.title?.replace(" Printing", "") || chip;

                        return (
                          <button
                            key={chip}
                            onClick={() => setActiveChip(chip)}
                            className={`rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition ${
                              active
                                ? "bg-slate-950 text-white ring-slate-950 shadow-sm"
                                : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"
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

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Available</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{categories.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Print service categories ready to start.</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Filtered</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{filteredServices.length}</p>
                    <p className="mt-1 text-xs text-slate-500">Services matching your current search.</p>
                  </div>
                  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Starting from</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {formatINR((filteredServices[0] || categories[0]).rate)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Base price for the highlighted service.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.9rem] border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Browse faster</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950">Featured options</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Start from the most-used print categories with a cleaner, data-first view.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                  Top picks
                </span>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {filteredServices.slice(0, 6).map((service) => (
                  <motion.button
                    key={service.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/customize/${service.id}`)}
                    className="flex w-full flex-col gap-4 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50/80 last:border-b-0 sm:px-5 sm:py-5 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.4fr)_auto_auto] lg:items-center lg:gap-6"
                    type="button"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-slate-950 sm:text-lg">{service.title}</h4>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {service.tag}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{service.desc}</p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Best for</p>
                      <p className="mt-1 text-sm text-slate-700">
                        {service.id === "cloth"
                          ? "Uniforms, t-shirts, hoodies, and fabric branding"
                          : service.id === "cup"
                            ? "Corporate gifting, cafes, events, and custom merchandise"
                            : service.id === "visiting-card"
                              ? "Business identity and networking"
                              : service.id === "id-card"
                                ? "Teams, schools, events"
                                : "Brand material and printed handouts"}
                      </p>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Starting price</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatINR(service.rate)}/{service.unit}
                      </p>
                    </div>

                    <div className="flex items-center lg:justify-end">
                      <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 ring-1 ring-sky-100">
                        Open
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {!filteredServices.length ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/80 px-4 py-5 text-sm text-slate-500">
                  No matching services found. Try another search or switch the filter chip.
                </div>
              ) : null}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.08 }}
            className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-600">Estimator</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Live pricing preview</h2>
              </div>

              <select
                value={teaserCategory}
                onChange={(e) => setTeaserCategory(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Rate</span>
                <span className="font-semibold text-slate-900">
                  {formatINR(teaserMeta.rate)}/{teaserMeta.unit}
                </span>
              </div>

              {teaserMeta.unit === "sq ft" ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Length (ft)</label>
                    <input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Width (ft)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-100"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  This service is quantity based. Quantity and finish selection will affect the final total.
                </p>
              )}

              <div className="mt-5 grid gap-3 rounded-2xl border border-white/70 bg-white/80 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Calculated area</span>
                  <span className="font-semibold text-slate-900">
                    {teaserMeta.unit === "sq ft" ? `${teaserArea} sq ft` : "1 unit"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Estimated price</span>
                  <span className="text-3xl font-bold tracking-tight text-slate-950">{formatINR(teaserPrice)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/customize/${teaserMeta.id}`)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#f97316,#0ea5e9)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Start customizing
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
          <SectionCard
            title="Recent orders"
            actionLabel="View all"
            onAction={() => navigate("/orders")}
          >
            {!recentOrders.length ? (
              <EmptyBlock
                title="No recent orders"
                text="Create a customization and place your first order."
              />
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const total = order.totals?.grand || order.total || 0;
                  const count = order.items?.length || 0;
                  const tone = statusTone[order.status || "Pending"] || statusTone.Pending;

                  return (
                    <div key={order.id || `${firstItem?.category}-${total}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{firstItem?.category || "Order"}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {count} item{count === 1 ? "" : "s"} • {formatINR(total)}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${tone}`}>
                          {order.status || "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Saved drafts"
            actionLabel="Refresh"
            onAction={() => navigate("/dashboard")}
          >
            {!drafts.length ? (
              <EmptyBlock
                title="No drafts saved"
                text="Start customizing a service and drafts will appear here."
              />
            ) : (
              <div className="space-y-3">
                {drafts.slice(0, 4).map((draft) => {
                  const cat = categories.find((c) => c.id === draft.category) || categories[0];

                  return (
                    <button
                      key={draft.id || `${draft.category}-${draft.updatedAt}`}
                      onClick={() => navigate(`/customize/${draft.category}`)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300"
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{cat.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {draft.length && draft.width ? `${draft.length} x ${draft.width} ft` : "Unit based"} •{" "}
                            {draft.qty ? `Qty ${draft.qty}` : "Qty 1"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                          Draft
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Support and next steps">
            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(249,115,22,0.08),rgba(14,165,233,0.08))] p-5">
                <p className="text-sm font-semibold text-slate-950">WhatsApp support</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Get quick help for pricing, order confirmation, or design clarification directly on WhatsApp.
                </p>
                <button
                  onClick={() => window.open(supportLink, "_blank")}
                  className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open WhatsApp
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ActionTile
                  title="Go to Customize"
                  text="Start a fresh design flow with template support."
                  onClick={() => navigate("/customize")}
                />
                <ActionTile
                  title="Review Cart"
                  text="Inspect saved items before you proceed to checkout."
                  onClick={() => navigate("/cart")}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, actionLabel, onAction, children }) => (
  <motion.section
    variants={item}
    initial="hidden"
    animate="show"
    className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur"
  >
    <div className="mb-5 flex items-center justify-between gap-3">
      <h3 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h3>
      {actionLabel ? (
        <button onClick={onAction} className="text-sm font-semibold text-sky-700 transition hover:text-orange-600" type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
    {children}
  </motion.section>
);

const EmptyBlock = ({ title, text }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <p className="text-sm font-semibold text-slate-950">{title}</p>
    <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
  </div>
);

const ActionTile = ({ title, text, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300"
    type="button"
  >
    <p className="text-sm font-semibold text-slate-950">{title}</p>
    <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
  </button>
);

export default Dashboard;
