import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";

/* ---------------- STORAGE KEYS (same system) ---------------- */
const CART_KEY = "printflow_cart_v1";
const DRAFTS_KEY = "printflow_drafts_v1";

/* ---------------- HELPERS ---------------- */
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

function safeParseSession(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function clamp(n, min, max) {
  const x = Number(n);
  if (Number.isNaN(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function makeId() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now());
}

/* ---------------- CATEGORY CONFIG ----------------
   - "visiting-card" uses TEMPLATE EDITOR
   - "flex/poster" uses SIZE EDITOR (simple)
---------------------------------------------------*/

const CATEGORY_CONFIG = {
  flex: {
    title: "Flex Printing",
    desc: "Large outdoor & indoor banner prints",
    tag: "Popular",
    rate: 10,
    unit: "ft",
    image:
      "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=60",
    presets: [
      [3, 6],
      [4, 8],
      [5, 10],
    ],
    mode: "SIZE",
  },
  poster: {
    title: "Poster Printing",
    desc: "High-quality promotional posters",
    tag: "Trending",
    rate: 8,
    unit: "ft",
    image:
      "https://images.unsplash.com/photo-1520975958225-40f609bdc64a?auto=format&fit=crop&w=1200&q=60",
    presets: [
      [2, 3],
      [3, 4],
      [4, 6],
    ],
    mode: "SIZE",
  },

  "visiting-card": {
    title: "Visiting Cards",
    desc: "Edit a ready-made card template in real time",
    tag: "Fast",
    rate: 5, // unit price per card (demo)
    unit: "unit",
    mode: "TEMPLATE",
  },
  "id-card": {
    title: "ID Cards",
    desc: "Preset ID card templates with editable fields",
    tag: "Secure",
    rate: 15,
    unit: "unit",
    mode: "TEMPLATE",
  },
};

/* ---------------- VISITING CARD TEMPLATES ----------------
   - background: CSS gradient / blocks (no external images needed)
   - fields: fixed position layers (safe & hackathon-ready)
-----------------------------------------------------------*/

const VC_TEMPLATES = [
  {
    id: "vc1",
    name: "Clean Indigo",
    previewTag: "Minimal",
    // base container style
    card: {
      bg: "bg-white",
      ring: "ring-1 ring-black/10",
    },
    // decorative blocks
    deco: [
      {
        className:
          "absolute -top-10 -left-10 h-40 w-40 rounded-full bg-indigo-600/15 blur-2xl",
      },
      {
        className:
          "absolute -bottom-12 -right-14 h-44 w-44 rounded-full bg-sky-500/15 blur-2xl",
      },
      { className: "absolute left-0 top-0 h-full w-2 bg-indigo-600" },
    ],
    fields: [
      { key: "name", label: "Full Name", x: 18, y: 26, size: 18, weight: 800 },
      { key: "role", label: "Role / Title", x: 18, y: 52, size: 12, weight: 600, muted: true },
      { key: "company", label: "Company", x: 18, y: 72, size: 12, weight: 700 },
      { key: "phone", label: "Phone", x: 18, y: 108, size: 11, weight: 600, mono: true },
      { key: "email", label: "Email", x: 18, y: 124, size: 11, weight: 600, mono: true },
      { key: "website", label: "Website", x: 18, y: 140, size: 11, weight: 600, mono: true },
    ],
    logo: { x: 72, y: 22, w: 48, h: 48, shape: "rounded-2xl" },
  },

  {
    id: "vc2",
    name: "Dark Bold",
    previewTag: "Premium",
    card: {
      bg: "bg-slate-950 text-white",
      ring: "ring-1 ring-white/10",
    },
    deco: [
      {
        className:
          "absolute -top-14 -right-14 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl",
      },
      {
        className:
          "absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-sky-500/20 blur-3xl",
      },
      {
        className:
          "absolute left-0 bottom-0 h-10 w-full bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 opacity-90",
      },
    ],
    fields: [
      { key: "name", label: "Full Name", x: 18, y: 28, size: 18, weight: 900 },
      { key: "role", label: "Role / Title", x: 18, y: 54, size: 12, weight: 700, muted: true },
      { key: "company", label: "Company", x: 18, y: 74, size: 12, weight: 800 },
      { key: "phone", label: "Phone", x: 18, y: 110, size: 11, weight: 700, mono: true },
      { key: "email", label: "Email", x: 18, y: 126, size: 11, weight: 700, mono: true },
      { key: "website", label: "Website", x: 18, y: 142, size: 11, weight: 700, mono: true },
    ],
    logo: { x: 74, y: 22, w: 46, h: 46, shape: "rounded-full" },
  },

  {
    id: "vc3",
    name: "Sky Split",
    previewTag: "Modern",
    card: {
      bg: "bg-white",
      ring: "ring-1 ring-black/10",
    },
    deco: [
      { className: "absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50" },
      { className: "absolute left-0 top-0 h-full w-[44%] bg-slate-950" },
      {
        className:
          "absolute left-0 top-0 h-full w-[44%] opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]",
      },
    ],
    fields: [
      { key: "name", label: "Full Name", x: 52, y: 28, size: 18, weight: 900 },
      { key: "role", label: "Role / Title", x: 52, y: 54, size: 12, weight: 600, muted: true },
      { key: "company", label: "Company", x: 52, y: 74, size: 12, weight: 700 },
      { key: "phone", label: "Phone", x: 52, y: 110, size: 11, weight: 600, mono: true },
      { key: "email", label: "Email", x: 52, y: 126, size: 11, weight: 600, mono: true },
      { key: "website", label: "Website", x: 52, y: 142, size: 11, weight: 600, mono: true },
    ],
    logo: { x: 10, y: 18, w: 44, h: 44, shape: "rounded-2xl", invert: true },
    // text color for left dark panel
    leftPanelText: true,
  },
];

/* ---------------- POSTER TEMPLATES ---------------- */
const POSTER_TEMPLATES = [
  {
    id: "p1",
    name: "Event Blast",
    previewTag: "Bold",
    card: {
      bg: "bg-gradient-to-br from-indigo-600 to-sky-600 text-white",
      ring: "ring-1 ring-black/10",
    },
    deco: [
      { className: "absolute -top-12 -left-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" },
      { className: "absolute -bottom-12 -right-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" },
    ],
    fields: [
      { key: "title", label: "Title", x: 10, y: 16, size: 26, weight: 900 },
      { key: "subtitle", label: "Subtitle", x: 10, y: 46, size: 14, weight: 600 },
      { key: "date", label: "Date", x: 10, y: 70, size: 12, weight: 600 },
      { key: "venue", label: "Venue", x: 10, y: 86, size: 12, weight: 600 },
      { key: "cta", label: "CTA", x: 10, y: 110, size: 13, weight: 800 },
    ],
    logo: { x: 76, y: 12, w: 46, h: 46, shape: "rounded-2xl", invert: true },
  },
  {
    id: "p2",
    name: "Clean Promo",
    previewTag: "Minimal",
    card: {
      bg: "bg-white",
      ring: "ring-1 ring-black/10",
    },
    deco: [
      { className: "absolute right-0 top-0 h-16 w-28 bg-indigo-600" },
      { className: "absolute right-0 top-16 h-16 w-28 bg-sky-500" },
    ],
    fields: [
      { key: "title", label: "Title", x: 10, y: 22, size: 24, weight: 900 },
      { key: "subtitle", label: "Subtitle", x: 10, y: 48, size: 13, weight: 600, muted: true },
      { key: "date", label: "Date", x: 10, y: 72, size: 12, weight: 600 },
      { key: "venue", label: "Venue", x: 10, y: 88, size: 12, weight: 600 },
      { key: "cta", label: "CTA", x: 10, y: 112, size: 12, weight: 800 },
    ],
    logo: { x: 72, y: 18, w: 40, h: 40, shape: "rounded-full" },
  },
];

/* ---------------- FLEX TEMPLATES ---------------- */
const FLEX_TEMPLATES = [
  {
    id: "f1",
    name: "Mega Sale",
    previewTag: "Promo",
    card: {
      bg: "bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-900 text-white",
      ring: "ring-1 ring-black/10",
    },
    deco: [
      { className: "absolute -left-10 -top-10 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl" },
      { className: "absolute right-0 bottom-0 h-14 w-44 bg-gradient-to-r from-sky-400 to-indigo-500" },
      { className: "absolute left-0 top-0 h-8 w-full bg-gradient-to-r from-amber-400 to-amber-500" },
      { className: "absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-xl" },
    ],
    fields: [
      { key: "offer", label: "Offer", x: 10, y: 10, size: 12, weight: 900 },
      { key: "title", label: "Headline", x: 10, y: 28, size: 24, weight: 900 },
      { key: "subtitle", label: "Subtext", x: 10, y: 56, size: 13, weight: 600, muted: true },
      { key: "address", label: "Address", x: 10, y: 80, size: 12, weight: 600 },
      { key: "phone", label: "Phone", x: 10, y: 98, size: 12, weight: 700, mono: true },
      { key: "time", label: "Timing", x: 10, y: 114, size: 11, weight: 700 },
      { key: "cta", label: "CTA", x: 10, y: 128, size: 12, weight: 800 },
    ],
    logo: { x: 78, y: 16, w: 42, h: 42, shape: "rounded-2xl", invert: true },
  },
  {
    id: "f2",
    name: "Grand Opening",
    previewTag: "Launch",
    card: {
      bg: "bg-white",
      ring: "ring-1 ring-black/10",
    },
    deco: [
      { className: "absolute left-0 top-0 h-full w-3 bg-indigo-600" },
      { className: "absolute right-0 top-0 h-full w-3 bg-sky-500" },
      { className: "absolute bottom-0 left-0 h-14 w-full bg-slate-900" },
      { className: "absolute right-8 top-6 h-16 w-16 rounded-full bg-indigo-50" },
    ],
    fields: [
      { key: "title", label: "Headline", x: 10, y: 22, size: 22, weight: 900 },
      { key: "subtitle", label: "Subtext", x: 10, y: 48, size: 13, weight: 600, muted: true },
      { key: "offer", label: "Offer", x: 10, y: 68, size: 12, weight: 800 },
      { key: "address", label: "Address", x: 10, y: 86, size: 12, weight: 600 },
      { key: "phone", label: "Phone", x: 10, y: 104, size: 12, weight: 700, mono: true },
      { key: "time", label: "Timing", x: 10, y: 120, size: 11, weight: 700 },
    ],
    logo: { x: 78, y: 18, w: 42, h: 42, shape: "rounded-full" },
  },
  {
    id: "f3",
    name: "Festival Night",
    previewTag: "Seasonal",
    card: {
      bg: "bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white",
      ring: "ring-1 ring-black/10",
    },
    deco: [
      { className: "absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" },
      { className: "absolute right-0 bottom-0 h-14 w-44 bg-black/15" },
      { className: "absolute left-6 bottom-6 h-10 w-24 rounded-full bg-white/20" },
    ],
    fields: [
      { key: "title", label: "Headline", x: 10, y: 22, size: 22, weight: 900 },
      { key: "subtitle", label: "Subtext", x: 10, y: 50, size: 13, weight: 600, muted: true },
      { key: "offer", label: "Offer", x: 10, y: 70, size: 12, weight: 800 },
      { key: "address", label: "Address", x: 10, y: 88, size: 12, weight: 600 },
      { key: "phone", label: "Phone", x: 10, y: 106, size: 12, weight: 700, mono: true },
      { key: "cta", label: "CTA", x: 10, y: 122, size: 12, weight: 800 },
    ],
    logo: { x: 78, y: 16, w: 42, h: 42, shape: "rounded-2xl", invert: true },
  },
];

/* ---------------- ID CARD TEMPLATES ---------------- */
const ID_TEMPLATES = [
  {
    id: "id1",
    name: "Institute Classic",
    previewTag: "Campus",
    card: {
      bg: "bg-white",
      ring: "ring-1 ring-black/10",
      radius: "rounded-xl",
      size: { w: 380, h: 240 },
    },
    deco: [
      { className: "absolute left-0 top-0 h-12 w-full bg-rose-700" },
      { className: "absolute left-0 top-12 h-[3px] w-full bg-rose-400" },
    ],
    fields: [
      { key: "institute", label: "Institute Name", x: 50, y: 16, size: 13, weight: 900, invert: true, align: "center", width: "70%" },
      { key: "roll", label: "Roll No", x: 8, y: 72, size: 12, weight: 700, mono: true, showLabel: true },
      { key: "course", label: "Course", x: 8, y: 90, size: 12, weight: 700, showLabel: true },
      { key: "phone", label: "Phone", x: 8, y: 108, size: 12, weight: 600, mono: true, showLabel: true },
      { key: "session", label: "Session", x: 8, y: 126, size: 12, weight: 600, showLabel: true },
      { key: "name", label: "Name", x: 78, y: 164, size: 14, weight: 900, accent: true, align: "center", width: "30%" },
    ],
    photo: { x: 72, y: 68, w: 80, h: 96, shape: "rounded-md" },
    logo: { x: 8, y: 16, w: 28, h: 28, shape: "rounded-md" },
    barcode: { x: 62, y: 184, w: 96, h: 16 },
  },
  {
    id: "id2",
    name: "Corporate Badge",
    previewTag: "Company",
    card: {
      bg: "bg-gradient-to-br from-sky-50 via-white to-indigo-50",
      ring: "ring-1 ring-black/10",
      radius: "rounded-xl",
      size: { w: 380, h: 240 },
    },
    deco: [
      { className: "absolute left-0 top-0 h-12 w-full bg-slate-900" },
      { className: "absolute left-0 top-12 h-[3px] w-full bg-indigo-500" },
    ],
    fields: [
      { key: "company", label: "Company", x: 50, y: 16, size: 13, weight: 900, invert: true, align: "center", width: "70%" },
      { key: "id", label: "Employee ID", x: 8, y: 72, size: 12, weight: 700, mono: true, showLabel: true },
      { key: "designation", label: "Designation", x: 8, y: 90, size: 12, weight: 700, showLabel: true },
      { key: "phone", label: "Phone", x: 8, y: 108, size: 12, weight: 600, mono: true, showLabel: true },
      { key: "session", label: "Validity", x: 8, y: 126, size: 12, weight: 600, showLabel: true },
      { key: "name", label: "Name", x: 78, y: 164, size: 14, weight: 900, accent: true, align: "center", width: "30%" },
    ],
    photo: { x: 72, y: 68, w: 80, h: 96, shape: "rounded-md" },
    logo: { x: 8, y: 16, w: 28, h: 28, shape: "rounded-md" },
    barcode: { x: 62, y: 184, w: 96, h: 16 },
  },
];

const TEMPLATE_LIBRARY = {
  flex: FLEX_TEMPLATES,
  poster: POSTER_TEMPLATES,
  "visiting-card": VC_TEMPLATES,
  "id-card": ID_TEMPLATES,
};

/* ---------------- DEFAULT VALUES ---------------- */
const DEFAULT_TEMPLATE_VALUES = {
  "visiting-card": {
    name: "Rahul Sharma",
    role: "Marketing Manager",
    company: "PrintFlow Studio",
    phone: "+91 98765 43210",
    email: "rahul@printflow.in",
    website: "printflow.in",
  },
  poster: {
    title: "Grand Opening Event",
    subtitle: "Join us for an unforgettable day",
    date: "20 Sept 2026",
    venue: "Mathura, UP",
    cta: "Call 98765 43210",
  },
  flex: {
    title: "Mega Sale",
    subtitle: "Up to 50% Off on Prints",
    offer: "HURRY! LIMITED TIME",
    address: "Main Market, Mathura",
    phone: "+91 98765 43210",
    time: "10 AM - 9 PM",
    cta: "WhatsApp to Order",
  },
  "id-card": {
    institute: "INSTITUTE NAME",
    name: "Aisha Khan",
    designation: "B.Tech CSE",
    company: "GLA University",
    course: "CSE",
    roll: "0123456789",
    phone: "0000 000 00",
    session: "2024-2028",
  },
};

/* ---------------- MAIN COMPONENT ---------------- */

const MIN = 1;
const MAX = 200;

const Customize = ({ categoryOverride }) => {
  const { category: categoryParam } = useParams();
  const category = categoryOverride || categoryParam;
  const navigate = useNavigate();
  const { token } = useAuth();

  if (!category) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900">
            Choose a service
          </h1>
          <p className="text-slate-600 mt-1">
            Select a printing service to start customizing.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(CATEGORY_CONFIG).map(([key, c]) => (
            <button
              key={key}
              onClick={() => navigate(`/customize/${key}`)}
              className="text-left rounded-3xl bg-white p-5 ring-1 ring-black/5 shadow-sm hover:ring-black/10 transition"
              type="button"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {c.title}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {c.desc || "Customize and order"}
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  {c.tag || "Service"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.flex;
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  /* ---------------- TEMPLATE MODE STATE ---------------- */
  const templates = useMemo(() => TEMPLATE_LIBRARY[category] || [], [category]);
  const [templateId, setTemplateId] = useState(templates[0]?.id || "");
  const template = useMemo(
    () => templates.find((t) => t.id === templateId) || templates[0],
    [templates, templateId]
  );

  const [templateValues, setTemplateValues] = useState(
    DEFAULT_TEMPLATE_VALUES[category] || {}
  );

  const fileRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const photoRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    setTemplateId(templates[0]?.id || "");
    setTemplateValues(DEFAULT_TEMPLATE_VALUES[category] || {});
    setLogoFile(null);
    setLogoUrl("");
    setPhotoFile(null);
    setPhotoUrl("");
  }, [category, templates]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setLogoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!photoFile) return;
    const url = URL.createObjectURL(photoFile);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  /* ---------------- SIZE MODE STATE ---------------- */
  const [length, setLength] = useState(3);
  const [width, setWidth] = useState(6);
  const [zoom, setZoom] = useState(false);
  const [designLink, setDesignLink] = useState("");

  const area = useMemo(() => length * width, [length, width]);
  const subtotalSize = useMemo(() => area * config.rate, [area, config.rate]);

  const lengthError = length < MIN || length > MAX;
  const widthError = width < MIN || width > MAX;

  /* ---------------- VISITING CARD PRICE (simple) ----------------
     Unit-based: price = rate * quantity (quantity later in cart)
     For now show base unit cost and "per unit" clarity.
  --------------------------------------------------------------*/
  const vcUnitPrice = config.rate; // 5 INR per card (demo)
  const vcSubtotal = vcUnitPrice; // preview for 1 unit

  /* ---------------- ACTIONS ---------------- */

  async function addToCart(payload) {
    const prev = safeParse(CART_KEY, []);
    const list = Array.isArray(prev) ? prev : [];
    const next = [payload, ...list];
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(next));
    } catch {
      try {
        sessionStorage.setItem(CART_KEY, JSON.stringify(next));
      } catch {
        // storage failed; keep silent to avoid blocking UX
      }
    }

    if (token) {
      try {
        const res = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ item: payload }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            localStorage.setItem(CART_KEY, JSON.stringify(data.items));
          }
        }
      } catch {
        // ignore backend failures for now
      }
    }
  }

  function saveDraft(payload) {
    const prev = safeParse(DRAFTS_KEY, []);
    const list = Array.isArray(prev) ? prev : [];
    localStorage.setItem(DRAFTS_KEY, JSON.stringify([payload, ...list]));
  }

  function onSaveDraftTemplate() {
    const draft = {
      id: makeId(),
      category,
      kind: "template",
      templateId,
      values: templateValues,
      logoName: logoFile?.name || "",
      updatedAt: Date.now(),
    };
    saveDraft(draft);
  }

  async function onAddToCartTemplate() {
    const item = {
      id: makeId(),
      category,
      kind: "template",
      templateId,
      values: templateValues,
      logo: logoFile ? { name: logoFile.name } : null,
      quantity: 1,
      rate: vcUnitPrice,
      unitRate: vcUnitPrice,
      subtotal: vcUnitPrice,
      notes: "",
      designLink: "",
      lastSavedAt: Date.now(),
    };
    await addToCart(item);
    setLastAddedItem(item);
    setCartModalOpen(true);
  }

  function onSaveDraftSize() {
    const draft = {
      id: makeId(),
      category,
      kind: "area",
      length,
      width,
      templateId: templateId || "",
      values: templateValues,
      designLink,
      updatedAt: Date.now(),
    };
    saveDraft(draft);
  }

  async function onAddToCartSize() {
    const item = {
      id: makeId(),
      category,
      kind: "area",
      length,
      width,
      quantity: 1,
      rate: config.rate,
      unitRate: config.rate,
      subtotal: subtotalSize,
      notes: "",
      designLink: designLink || "",
      templateId: templateId || "",
      values: templateValues,
      lastSavedAt: Date.now(),
    };
    await addToCart(item);
    setLastAddedItem(item);
    setCartModalOpen(true);
  }

  /* ---------------- UI WRAPPER ---------------- */
  return (
    <div className="px-4 sm:px-8 py-6 relative">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
              {config.title}
            </h1>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              {config.tag}
            </span>
          </div>

          <select
            value={category}
            onChange={(e) => navigate(`/customize/${e.target.value}`)}
            className="rounded-xl border px-3 py-2 text-sm bg-white"
          >
            {Object.entries(CATEGORY_CONFIG).map(([key, c]) => (
              <option key={key} value={key}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-slate-600">{config.desc}</p>
      </div>

      {/* MODE SWITCH (only for visiting-card show "Template Editor") */}
      {config.mode === "TEMPLATE" ? (
        <TemplateEditor
          template={template}
          templates={templates}
          templateId={templateId}
          setTemplateId={setTemplateId}
          values={templateValues}
          setValues={setTemplateValues}
          logoUrl={logoUrl}
          photoUrl={photoUrl}
          onPickLogo={() => fileRef.current?.click()}
          onLogoChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setLogoFile(f);
          }}
          onRemoveLogo={() => {
            setLogoFile(null);
            setLogoUrl("");
          }}
          showPhotoUpload={category === "id-card"}
          onPickPhoto={() => photoRef.current?.click()}
          onPhotoChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPhotoFile(f);
          }}
          onRemovePhoto={() => {
            setPhotoFile(null);
            setPhotoUrl("");
          }}
          vcUnitPrice={vcUnitPrice}
          vcSubtotal={vcSubtotal}
          unitLabel={config.unit || "unit"}
          onSaveDraft={onSaveDraftTemplate}
          onAddToCart={onAddToCartTemplate}
          onBack={() => navigate("/dashboard")}
          fileRef={fileRef}
          photoRef={photoRef}
        />
      ) : (
        <SizeCustomization
          config={config}
          length={length}
          width={width}
          setLength={setLength}
          setWidth={setWidth}
          zoom={zoom}
          setZoom={setZoom}
          designLink={designLink}
          setDesignLink={setDesignLink}
          templates={templates}
          template={template}
          templateId={templateId}
          setTemplateId={setTemplateId}
          templateValues={templateValues}
          setTemplateValues={setTemplateValues}
          area={area}
          subtotal={subtotalSize}
          lengthError={lengthError}
          widthError={widthError}
          onSaveDraft={onSaveDraftSize}
          onAddToCart={onAddToCartSize}
          onBack={() => navigate("/dashboard")}
        />
      )}

      <CartAddedModal
        open={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        onGoToCart={() => navigate("/cart", { state: { lastAdded: lastAddedItem } })}
      />
    </div>
  );
};

export default Customize;

/* ============================================================
   =============== TEMPLATE EDITOR: VISITING CARD ===============
   ============================================================ */

function TemplateEditor({
  template,
  templates,
  templateId,
  setTemplateId,
  values,
  setValues,
  logoUrl,
  photoUrl,
  onPickLogo,
  onLogoChange,
  onRemoveLogo,
  showPhotoUpload,
  onPickPhoto,
  onPhotoChange,
  onRemovePhoto,
  vcUnitPrice,
  vcSubtotal,
  unitLabel,
  onSaveDraft,
  onAddToCart,
  onBack,
  fileRef,
  photoRef,
}) {
  if (!template) {
    return (
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6">
        <p className="text-sm text-slate-600">No templates available for this category yet.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* LEFT: Preview */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-slate-700">Live preview</p>
            <p className="text-xs text-slate-500 mt-1">
              Template: <span className="font-semibold">{template.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              Editable
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <CardCanvas template={template} values={values} logoUrl={logoUrl} photoUrl={photoUrl} />
        </div>

        <p className="mt-3 text-xs text-slate-500 text-center">
          * Preview is for demo. Export/print step comes in Phase-2.
        </p>

        {/* Template selector strip */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {templates.map((t) => {
            const active = t.id === templateId;
            return (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className={`rounded-2xl px-3 py-3 text-left ring-1 transition ${
                  active
                    ? "bg-indigo-600 text-white ring-indigo-600"
                    : "bg-slate-50 text-slate-800 ring-black/5 hover:ring-black/10"
                }`}
                type="button"
              >
                <p className="text-sm font-semibold">{t.name}</p>
                <p className={`text-[11px] mt-1 ${active ? "text-white/80" : "text-slate-500"}`}>
                  {t.previewTag}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Controls */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Edit details
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Update fields — preview updates instantly.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          {template.fields.map((f) => (
            <Field
              key={f.key}
              label={f.label || f.key}
              value={values[f.key]}
              onChange={(v) => setValues((p) => ({ ...p, [f.key]: v }))}
            />
          ))}
        </div>

        {/* Logo upload */}
        <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Logo (optional)</p>
              <p className="text-xs text-slate-600 mt-1">
                Upload logo for preview (export later).
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onPickLogo}
                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold ring-1 ring-black/5 hover:ring-black/10 transition"
                type="button"
              >
                Upload
              </button>
              <button
                onClick={onRemoveLogo}
                className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100 transition"
                type="button"
              >
                Remove
              </button>
            </div>

            <input ref={fileRef} type="file" className="hidden" onChange={onLogoChange} />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="logo preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-semibold text-slate-500">No logo</span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              Tip: Use PNG with transparent background.
            </p>
          </div>
        </div>

        {showPhotoUpload ? (
          <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Photo</p>
                <p className="text-xs text-slate-600 mt-1">
                  Upload student/employee photo for ID card.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onPickPhoto}
                  className="rounded-xl bg-white px-3 py-2 text-xs font-semibold ring-1 ring-black/5 hover:ring-black/10 transition"
                  type="button"
                >
                  Upload Photo
                </button>
                <button
                  onClick={onRemovePhoto}
                  className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100 transition"
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>

            <input ref={photoRef} type="file" className="hidden" onChange={onPhotoChange} />

            <div className="mt-3 flex items-center gap-3">
              <div className="h-12 w-10 rounded-xl bg-white ring-1 ring-black/5 overflow-hidden flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="photo preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500">Photo</span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                JPG/PNG recommended.
              </p>
            </div>
          </div>
        ) : null}

        {/* Pricing */}
        <div className="mt-5 rounded-2xl bg-indigo-50 ring-1 ring-indigo-100 p-4">
          <p className="text-sm font-semibold text-indigo-800">Price preview</p>
          <div className="mt-2 flex items-center justify-between text-sm text-indigo-900">
            <span>Unit price</span>
            <span className="font-semibold">
              {formatINR(vcUnitPrice)} / {unitLabel}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-indigo-900">Subtotal (1 qty)</span>
            <span className="text-xl font-bold text-indigo-900">{formatINR(vcSubtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-indigo-700">
            Final total depends on quantity + finish (matte/glossy).
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-6 grid gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onAddToCart}
            className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            type="button"
          >
            Add to Cart →
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSaveDraft}
              className="rounded-2xl bg-white py-3 text-sm font-semibold ring-1 ring-black/5 hover:ring-black/10 transition"
              type="button"
            >
              Save Draft
            </button>
            <button
              onClick={onBack}
              className="rounded-2xl bg-slate-50 py-3 text-sm font-semibold ring-1 ring-black/5 hover:ring-black/10 transition"
              type="button"
            >
              Back
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            WhatsApp checkout will confirm quantity & final total.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------ Card Canvas (absolute layers) ------------ */
function CardCanvas({ template, values, logoUrl, photoUrl }) {
  const W = template.card.size?.w || 360;
  const H = template.card.size?.h || 210;

  return (
    <div
      className={`relative overflow-hidden ${template.card.radius || "rounded-3xl"} ${template.card.bg} ${template.card.ring}`}
      style={{ width: W, height: H }}
    >
      {/* Decorations */}
      {template.deco?.map((d, idx) => (
        <div key={idx} className={d.className} />
      ))}

      {/* Photo */}
      {template.photo && (
        <div
          className={`absolute overflow-hidden ${template.photo.shape} ring-1 ring-black/10 bg-white flex items-center justify-center`}
          style={{
            left: `${template.photo.x}%`,
            top: `${template.photo.y}%`,
            width: `${template.photo.w}px`,
            height: `${template.photo.h}px`,
          }}
        >
          {photoUrl ? (
            <img src={photoUrl} alt="photo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[10px] font-semibold text-slate-500">PHOTO</span>
          )}
        </div>
      )}

      {/* Logo */}
      <div
        className={`absolute overflow-hidden ${template.logo.shape} ring-1 ring-black/10 bg-white flex items-center justify-center`}
        style={{
          left: `${template.logo.x}%`,
          top: `${template.logo.y}%`,
          width: `${template.logo.w}px`,
          height: `${template.logo.h}px`,
        }}
      >
        {logoUrl ? (
          <img src={logoUrl} alt="logo" className="h-full w-full object-cover" />
        ) : (
          <span className={`text-[10px] font-semibold ${template.logo.invert ? "text-slate-900" : "text-slate-500"}`}>
            LOGO
          </span>
        )}
      </div>

      {/* Text Fields */}
      {template.fields.map((f) => {
        const val = (values?.[f.key] || "").trim();
        const baseText = val || f.label;
        const text = f.showLabel ? `${f.label}: ${baseText}` : baseText;

        const baseColor =
          template.card.bg.includes("slate-950") ? "text-white" : "text-slate-900";

        const mutedColor =
          template.card.bg.includes("slate-950")
            ? "text-white/70"
            : "text-slate-600";

        const leftPanelText = template.leftPanelText ? "text-white" : baseColor;
        const accent = f.accent ? "text-rose-700" : "";
        const invert = f.invert ? "text-white" : "";
        const alignCenter = f.align === "center";

        return (
          <div
            key={f.key}
            className={`absolute leading-tight ${
              f.muted ? mutedColor : leftPanelText
            } ${accent} ${invert} ${f.mono ? "font-mono" : ""}`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              transform: alignCenter ? "translateX(-50%)" : "none",
              textAlign: alignCenter ? "center" : "left",
              width: f.width || (alignCenter ? "60%" : "80%"),
              fontSize: `${f.size}px`,
              fontWeight: f.weight,
              letterSpacing: f.weight >= 800 ? "-0.02em" : "0em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={val || ""}
          >
            {text}
          </div>
        );
      })}

      {/* Barcode */}
      {template.barcode && (
        <div
          className="absolute bg-slate-900/90 rounded-sm"
          style={{
            left: `${template.barcode.x}%`,
            top: `${template.barcode.y}%`,
            width: `${template.barcode.w}px`,
            height: `${template.barcode.h}px`,
          }}
        >
          <div className="h-full w-full bg-[repeating-linear-gradient(90deg,#fff_0px,#fff_2px,#111_2px,#111_4px)] opacity-80" />
        </div>
      )}
    </div>
  );
}

/* ------------ Input Field ------------ */
function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-indigo-200 transition"
      />
    </div>
  );
}

/* ============================================================
   ===================== SIZE CUSTOMIZATION =====================
   ============================================================ */

function SizeCustomization({
  config,
  length,
  width,
  setLength,
  setWidth,
  zoom,
  setZoom,
  designLink,
  setDesignLink,
  templates,
  template,
  templateId,
  setTemplateId,
  templateValues,
  setTemplateValues,
  area,
  subtotal,
  lengthError,
  widthError,
  onSaveDraft,
  onAddToCart,
  onBack,
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* PREVIEW */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-5 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700">Preview</p>
          <button
            onClick={() => setZoom((z) => !z)}
            className="text-xs font-medium text-indigo-600 hover:underline"
            type="button"
          >
            {zoom ? "Fit" : "Zoom"}
          </button>
        </div>

        <div className="relative flex-1 rounded-2xl overflow-hidden bg-slate-100 min-h-[260px]">
          {config.image && !imgError ? (
            <img
              src={config.image}
              alt={config.title}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-transform duration-300 ${
                zoom ? "scale-110" : "scale-100"
              }`}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-100 via-indigo-50 to-sky-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Preview not available</p>
                <p className="text-xs text-slate-500 mt-1">Using template preview instead</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-900 ring-1 ring-black/5">
            {length} × {width} {config.unit}
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          * Reference image only. Final output may vary.
        </p>
      </div>

      {/* SIDEBAR */}
      <div className="rounded-3xl bg-white shadow-sm ring-1 ring-black/5 p-6 flex flex-col">
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Length ({config.unit})
            </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(clamp(e.target.value, 1, 999))}
              className={`mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none ring-1 transition focus:ring-2 focus:ring-indigo-200 ${
                lengthError ? "ring-rose-300" : "ring-black/10"
              }`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Min {MIN}, Max {MAX}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Width ({config.unit})
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(clamp(e.target.value, 1, 999))}
              className={`mt-1 w-full rounded-2xl px-4 py-3 text-sm outline-none ring-1 transition focus:ring-2 focus:ring-indigo-200 ${
                widthError ? "ring-rose-300" : "ring-black/10"
              }`}
            />
            <p className="mt-1 text-xs text-slate-500">
              Min {MIN}, Max {MAX}
            </p>
          </div>

          {/* Presets */}
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2">
              Quick sizes
            </p>
            <div className="flex flex-wrap gap-2">
              {config.presets?.map(([l, w]) => (
                <button
                  key={`${l}x${w}`}
                  onClick={() => {
                    setLength(l);
                    setWidth(w);
                  }}
                  className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-black/5 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  type="button"
                >
                  {l}×{w}
                </button>
              ))}
            </div>
          </div>

          {/* Templates */}
          {templates?.length ? (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Design templates
              </p>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => {
                  const active = t.id === templateId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`rounded-2xl p-2 text-left ring-1 transition ${
                        active
                          ? "ring-indigo-500 bg-indigo-50"
                          : "ring-black/5 bg-white hover:ring-black/10"
                      }`}
                      type="button"
                    >
                      <div className="h-24 overflow-hidden rounded-xl bg-slate-50">
                        <div className="origin-top-left scale-[0.55]">
                          <CardCanvas template={t} values={templateValues} logoUrl="" />
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] font-semibold text-slate-700">
                        {t.name}
                      </p>
                      <p className="text-[10px] text-slate-500">{t.previewTag}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Template content */}
          {template?.fields?.length ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-600">
                Template content
              </p>
              {template.fields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label || f.key}
                  value={templateValues[f.key]}
                  onChange={(val) =>
                    setTemplateValues((p) => ({ ...p, [f.key]: val }))
                  }
                />
              ))}
            </div>
          ) : null}

          {/* Design Link */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Design file / link (optional)
            </label>
            <input
              value={designLink}
              onChange={(e) => setDesignLink(e.target.value)}
              placeholder="Google Drive / Dropbox link"
              className="mt-1 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-indigo-200"
            />
            <p className="mt-1 text-xs text-slate-500">
              Recommended before final checkout
            </p>
          </div>

          {/* Price */}
          <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
            <p className="text-sm font-semibold text-indigo-800">Price breakdown</p>
            <div className="mt-2 space-y-1 text-sm text-indigo-900">
              <div className="flex justify-between">
                <span>Area</span>
                <span>
                  {length} × {width} = {area} sq {config.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rate</span>
                <span>₹{config.rate} / sq {config.unit}</span>
              </div>
            </div>

            <div className="mt-3 flex justify-between items-center">
              <span className="font-semibold">Subtotal</span>
              <span className="text-2xl font-bold text-indigo-900">
                {formatINR(subtotal)}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            WhatsApp checkout will confirm final total
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-6 grid gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={lengthError || widthError}
            onClick={onAddToCart}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition ${
              lengthError || widthError
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            type="button"
          >
            Add to Cart →
          </motion.button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onSaveDraft}
              className="rounded-2xl bg-white py-3 text-sm font-semibold ring-1 ring-black/5 hover:ring-black/10 transition"
              type="button"
            >
              Save Draft
            </button>
            <button
              onClick={onBack}
              className="rounded-2xl bg-slate-50 py-3 text-sm font-semibold ring-1 ring-black/5 hover:ring-black/10 transition"
              type="button"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartAddedModal({ open, onClose, onGoToCart }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Added to cart</h3>
            <p className="mt-1 text-sm text-slate-600">
              Your item is saved. You can continue customizing or review your cart.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-slate-500 hover:text-slate-800"
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
            type="button"
          >
            Continue customizing
          </button>
          <button
            onClick={onGoToCart}
            className="flex-1 rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            type="button"
          >
            Go to cart
          </button>
        </div>
      </div>
    </div>
  );
}
