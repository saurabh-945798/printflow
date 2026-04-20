import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiUrl } from "../../lib/api.js";

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
   - "cloth" uses TEMPLATE EDITOR
   - "cup" uses TEMPLATE EDITOR
---------------------------------------------------*/

const CATEGORY_CONFIG = {
  cloth: {
    title: "Cloth Printing",
    desc: "Custom apparel, uniforms, hoodies, and fabric branding",
    tag: "Popular",
    rate: 499,
    unit: "unit",
    mode: "TEMPLATE",
  },
  cup: {
    title: "Cup Printing",
    desc: "Printed mugs and cups with names, logos, and gift-ready designs",
    tag: "Trending",
    rate: 299,
    unit: "unit",
    mode: "TEMPLATE",
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
const CUP_TEMPLATES = [
  {
    id: "cup-classic",
    name: "Classic Mug",
    previewTag: "Best seller",
    productType: "Ceramic Mug",
    price: 299,
    previewType: "cup",
    card: {
      bg: "bg-slate-100",
      ring: "ring-1 ring-black/10",
      size: { w: 360, h: 320 },
    },
    deco: [],
    fields: [
      { key: "name", label: "Name", x: 50, y: 42, size: 20, weight: 900, align: "center", width: "64%" },
      { key: "message", label: "Message", x: 50, y: 58, size: 12, weight: 600, align: "center", width: "70%" },
    ],
    logo: { x: 50, y: 50, w: 76, h: 76, shape: "rounded-2xl" },
  },
  {
    id: "cup-travel",
    name: "Travel Cup",
    previewTag: "Premium",
    productType: "Travel Cup",
    price: 449,
    previewType: "cup",
    card: {
      bg: "bg-slate-100",
      ring: "ring-1 ring-black/10",
      size: { w: 360, h: 320 },
    },
    deco: [],
    fields: [
      { key: "name", label: "Name", x: 50, y: 40, size: 18, weight: 900, align: "center", width: "66%" },
      { key: "message", label: "Message", x: 50, y: 56, size: 11, weight: 700, align: "center", width: "72%" },
    ],
    logo: { x: 50, y: 48, w: 70, h: 70, shape: "rounded-3xl" },
  },
  {
    id: "cup-gift",
    name: "Gift Cup",
    previewTag: "Festive",
    productType: "Gift Cup",
    price: 379,
    previewType: "cup",
    card: {
      bg: "bg-slate-100",
      ring: "ring-1 ring-black/10",
      size: { w: 360, h: 320 },
    },
    deco: [],
    fields: [
      { key: "name", label: "Name", x: 50, y: 40, size: 18, weight: 900, align: "center", width: "64%" },
      { key: "message", label: "Message", x: 50, y: 56, size: 11, weight: 700, align: "center", width: "72%" },
    ],
    logo: { x: 50, y: 48, w: 72, h: 72, shape: "rounded-full" },
  },
];

/* ---------------- FLEX TEMPLATES ---------------- */
const FLEX_TEMPLATES = [
  {
    id: "cloth-tshirt",
    name: "T-Shirt",
    previewTag: "Apparel",
    productType: "T-Shirt",
    price: 499,
    previewType: "apparel",
    card: {
      bg: "bg-slate-100",
      ring: "ring-1 ring-black/10",
      size: { w: 360, h: 360 },
    },
    deco: [],
    fields: [
      { key: "name", label: "Name", x: 50, y: 62, size: 18, weight: 900, align: "center", width: "55%" },
      { key: "design", label: "Design Text", x: 50, y: 74, size: 12, weight: 700, align: "center", width: "60%" },
    ],
    logo: { x: 50, y: 45, w: 82, h: 82, shape: "rounded-2xl" },
  },
  {
    id: "cloth-hoodie",
    name: "Hoodie",
    previewTag: "Premium",
    productType: "Hoodie",
    price: 799,
    previewType: "apparel",
    card: {
      bg: "bg-slate-100",
      ring: "ring-1 ring-black/10",
      size: { w: 360, h: 360 },
    },
    deco: [],
    fields: [
      { key: "name", label: "Name", x: 50, y: 60, size: 18, weight: 900, align: "center", width: "55%" },
      { key: "design", label: "Design Text", x: 50, y: 73, size: 12, weight: 700, align: "center", width: "60%" },
    ],
    logo: { x: 50, y: 43, w: 82, h: 82, shape: "rounded-2xl" },
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
  cloth: FLEX_TEMPLATES,
  cup: CUP_TEMPLATES,
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
  cup: {
    name: "Aisha",
    message: "Best gift ever",
    color: "#f97316",
    printSide: "front",
    finish: "glossy",
  },
  cloth: {
    name: "Aarav",
    design: "Team PrintFlow",
    color: "#1f2937",
    view: "front",
    fit: "male",
    size: "M",
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

  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.cloth;
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
  const vcUnitPrice = template?.price ?? config.rate;
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
        const res = await fetch(apiUrl("/api/cart/add"), {
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
      productType: template?.productType || "",
      finish: templateValues.finish || "",
      printSide: templateValues.printSide || "",
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
      productType: template?.productType || "",
      color: templateValues.color || "",
      finish: templateValues.finish || "",
      printSide: templateValues.printSide || "",
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
          showColorPicker={category === "cloth"}
          showApparelOptions={category === "cloth"}
          showCupOptions={category === "cup"}
          selectedColor={templateValues.color || "#1f2937"}
          onColorChange={(value) =>
            setTemplateValues((p) => ({ ...p, color: value }))
          }
          selectedView={templateValues.view || "front"}
          onViewChange={(value) =>
            setTemplateValues((p) => ({ ...p, view: value }))
          }
          selectedFit={templateValues.fit || "male"}
          onFitChange={(value) =>
            setTemplateValues((p) => ({ ...p, fit: value }))
          }
          selectedSize={templateValues.size || "M"}
          onSizeChange={(value) =>
            setTemplateValues((p) => ({ ...p, size: value }))
          }
          selectedPrintSide={templateValues.printSide || "front"}
          onPrintSideChange={(value) =>
            setTemplateValues((p) => ({ ...p, printSide: value }))
          }
          selectedFinish={templateValues.finish || "glossy"}
          onFinishChange={(value) =>
            setTemplateValues((p) => ({ ...p, finish: value }))
          }
          productTypeLabel={template?.productType || ""}
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
  showColorPicker,
  showApparelOptions,
  showCupOptions,
  selectedColor,
  onColorChange,
  selectedView,
  onViewChange,
  selectedFit,
  onFitChange,
  selectedSize,
  onSizeChange,
  selectedPrintSide,
  onPrintSideChange,
  selectedFinish,
  onFinishChange,
  productTypeLabel,
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
            {productTypeLabel ? (
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                Product: {productTypeLabel}
              </p>
            ) : null}
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

        {showColorPicker ? (
          <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Garment color</p>
                <p className="text-xs text-slate-600 mt-1">
                  Pick the base color for the selected apparel.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="h-9 w-9 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs font-semibold uppercase text-slate-600">
                  {selectedColor}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {showApparelOptions ? (
          <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
            <div>
              <p className="text-sm font-semibold text-slate-900">View</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["front", "back"].map((view) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => onViewChange(view)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      selectedView === view
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-black/5 hover:ring-black/10"
                    }`}
                  >
                    {view === "front" ? "Front" : "Back"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Fit style</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["male", "female"].map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() => onFitChange(fit)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                      selectedFit === fit
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-black/5 hover:ring-black/10"
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Size</p>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onSizeChange(size)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      selectedSize === size
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-700 ring-1 ring-black/5 hover:ring-black/10"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {showCupOptions ? (
          <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-black/5">
            <div>
              <p className="text-sm font-semibold text-slate-900">Cup color</p>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-black/5">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="h-9 w-9 cursor-pointer border-0 bg-transparent p-0"
                />
                <span className="text-xs font-semibold uppercase text-slate-600">
                  {selectedColor}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Print side</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { id: "front", label: "Front" },
                  { id: "back", label: "Back" },
                  { id: "wrap", label: "Full Wrap" },
                ].map((side) => (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => onPrintSideChange(side.id)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      selectedPrintSide === side.id
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-slate-700 ring-1 ring-black/5 hover:ring-black/10"
                    }`}
                  >
                    {side.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">Finish</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {["glossy", "matte"].map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    onClick={() => onFinishChange(finish)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                      selectedFinish === finish
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-700 ring-1 ring-black/5 hover:ring-black/10"
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Logo upload */}
        <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-black/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Logo (optional)</p>
              <p className="text-xs text-slate-600 mt-1">
                Upload logo or design artwork for preview.
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

  if (template.previewType === "cup") {
    const cupColor = values?.color || "#f97316";
    const printSide = values?.printSide || "front";
    const finish = values?.finish || "glossy";
    const isTravelCup = template.productType === "Travel Cup";
    const isGiftCup = template.productType === "Gift Cup";
    const bodyPath = isTravelCup
      ? "M108 74 C106 56, 194 56, 192 74 L182 286 C180 308, 120 308, 118 286 Z"
      : "M94 108 C94 84, 206 84, 206 108 L198 258 C196 286, 104 286, 102 258 Z";
    const handlePath = isTravelCup
      ? "M190 126 C220 130, 228 194, 194 208"
      : "M206 126 C238 132, 246 208, 206 216";
    const wrapX = printSide === "wrap" ? 88 : printSide === "back" ? 126 : 112;
    const wrapW = printSide === "wrap" ? 124 : 70;
    const wrapLabel = printSide === "back" ? "Back Print" : printSide === "wrap" ? "Full Wrap" : "Front Print";

    return (
      <div
        className={`relative overflow-hidden ${template.card.radius || "rounded-3xl"} ${template.card.bg} ${template.card.ring}`}
        style={{ width: W, height: H }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(226,232,240,0.75))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 320 320" className="h-[270px] w-[270px] drop-shadow-[0_16px_28px_rgba(15,23,42,0.16)]">
            <defs>
              <linearGradient id="cupBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cupColor} />
                <stop offset="70%" stopColor={cupColor} />
                <stop offset="100%" stopColor="rgba(15,23,42,0.14)" />
              </linearGradient>
              <linearGradient id="cupHighlight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(255,255,255,0.34)" />
                <stop offset="18%" stopColor="rgba(255,255,255,0.14)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
              <linearGradient id="cupFinish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={finish === "glossy" ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.08)"} />
                <stop offset="100%" stopColor={finish === "glossy" ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.18)"} />
              </linearGradient>
            </defs>

            {!isTravelCup ? (
              <>
                <ellipse cx="150" cy="104" rx="58" ry="18" fill="rgba(255,255,255,0.98)" />
                <ellipse cx="150" cy="104" rx="44" ry="10" fill="rgba(241,245,249,0.9)" />
              </>
            ) : (
              <>
                <ellipse cx="150" cy="72" rx="46" ry="14" fill="#111827" />
                <rect x="110" y="62" width="80" height="26" rx="12" fill="#0f172a" />
                <rect x="172" y="68" width="16" height="8" rx="4" fill="#374151" />
              </>
            )}

            <path d={bodyPath} fill="url(#cupBody)" />
            <path d={bodyPath} fill="url(#cupFinish)" />
            <path d={bodyPath} fill="url(#cupHighlight)" />
            <path d={handlePath} fill="none" stroke={cupColor} strokeWidth={isTravelCup ? "16" : "18"} strokeLinecap="round" />
            <path d={handlePath} fill="none" stroke="rgba(255,255,255,0.26)" strokeWidth="5" strokeLinecap="round" />

            {isGiftCup ? (
              <path d="M100 102 C126 78, 174 78, 200 102" fill="none" stroke="rgba(255,255,255,0.52)" strokeWidth="6" strokeLinecap="round" />
            ) : null}

            <rect x={wrapX} y={126} width={wrapW} height={84} rx="22" fill="rgba(255,255,255,0.94)" stroke="rgba(15,23,42,0.08)" />
            {logoUrl ? (
              <image href={logoUrl} x={wrapX} y={126} width={wrapW} height={84} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <text x={wrapX + wrapW / 2} y="170" textAnchor="middle" fontSize="11" fontWeight="700" fill="#64748b">
                ARTWORK
              </text>
            )}

            <text x="150" y="228" textAnchor="middle" fontSize="16" fontWeight="900" fill="rgba(255,255,255,0.96)">
              {values?.name || "Aisha"}
            </text>
            <text x="150" y="246" textAnchor="middle" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.86)">
              {values?.message || "Best gift ever"}
            </text>
            <text x="150" y="264" textAnchor="middle" fontSize="9" fontWeight="700" letterSpacing="1.1" fill="rgba(15,23,42,0.55)">
              {wrapLabel.toUpperCase()} • {finish.toUpperCase()}
            </text>
          </svg>
        </div>
      </div>
    );
  }

  if (template.previewType === "apparel") {
    const apparelColor = values?.color || "#1f2937";
    const isHoodie = template.productType === "Hoodie";
    const isBackView = values?.view === "back";
    const isFemaleFit = values?.fit === "female";
    const sizeScale =
      values?.size === "S" ? 0.93 : values?.size === "L" ? 1.05 : values?.size === "XL" ? 1.11 : 1;
    const svgScale = `${sizeScale}`;
    const chestY = isBackView ? 162 : 150;
    const shirtPath = isFemaleFit
      ? "M118 76 C132 56, 168 56, 182 76 L214 92 C230 100, 238 118, 234 136 L218 128 L208 160 L198 296 C196 320, 180 338, 150 338 C120 338, 104 320, 102 296 L92 160 L82 128 L66 136 C62 118, 70 100, 86 92 Z"
      : "M104 74 C122 50, 178 50, 196 74 L234 94 C252 104, 260 124, 254 144 L236 136 L220 170 L210 304 C208 326, 192 344, 150 344 C108 344, 92 326, 90 304 L80 170 L64 136 L46 144 C40 124, 48 104, 66 94 Z";
    const hoodiePath = isFemaleFit
      ? "M112 86 C124 60, 176 60, 188 86 L214 100 C236 112, 248 134, 246 156 L230 150 L220 182 L212 306 C210 330, 192 346, 150 346 C108 346, 90 330, 88 306 L80 182 L70 150 L54 156 C52 134, 64 112, 86 100 Z"
      : "M98 86 C114 56, 186 56, 202 86 L234 102 C258 116, 270 140, 268 164 L248 158 L236 192 L226 312 C224 334, 206 350, 150 350 C94 350, 76 334, 74 312 L64 192 L52 158 L32 164 C30 140, 42 116, 66 102 Z";
    const hoodPath = isFemaleFit
      ? "M108 64 C118 28, 182 28, 192 64 L180 116 C170 132, 130 132, 120 116 Z"
      : "M98 62 C110 20, 190 20, 202 62 L186 122 C174 138, 126 138, 114 122 Z";
    const pocketPath = isFemaleFit
      ? "M110 236 C118 224, 182 224, 190 236 L178 274 C170 286, 130 286, 122 274 Z"
      : "M96 236 C106 220, 194 220, 204 236 L190 280 C180 294, 120 294, 110 280 Z";
    const neckPath = isFemaleFit
      ? "M124 74 C134 92, 166 92, 176 74"
      : "M116 72 C128 94, 172 94, 184 72";
    const backNeckPath = isFemaleFit
      ? "M120 82 C132 92, 168 92, 180 82"
      : "M112 80 C126 92, 174 92, 188 80";
    const designFrame = isBackView
      ? { x: 108, y: 134, w: 84, h: 84 }
      : { x: 116, y: 136, w: 68, h: 68 };
    const labelY = isBackView ? 238 : 222;

    return (
      <div
        className={`relative overflow-hidden ${template.card.radius || "rounded-3xl"} ${template.card.bg} ${template.card.ring}`}
        style={{ width: W, height: H }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(226,232,240,0.7))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 300 390" className="h-[320px] w-[246px] drop-shadow-[0_18px_30px_rgba(15,23,42,0.18)]">
            <defs>
              <linearGradient id="fabricShade" x1="0" x2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
                <stop offset="45%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
              </linearGradient>
              <linearGradient id="fabricVertical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.03)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
              </linearGradient>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(15,23,42,0.16)" />
              </filter>
            </defs>

            <g transform={`translate(150 18) scale(${svgScale}) translate(-150 0)`} filter="url(#softShadow)">
              {isHoodie ? (
                <>
                  <path d={hoodPath} fill={apparelColor} />
                  <path d={hoodPath} fill="url(#fabricShade)" opacity="0.7" />
                  <path d={hoodiePath} fill={apparelColor} />
                  <path d={hoodiePath} fill="url(#fabricVertical)" />
                  <path d={backNeckPath} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="5" strokeLinecap="round" />
                  {!isBackView ? <path d={pocketPath} fill="rgba(0,0,0,0.1)" stroke="rgba(255,255,255,0.18)" strokeWidth="2" /> : null}
                  {!isBackView ? (
                    <>
                      <line x1="126" y1="102" x2="120" y2="154" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round" />
                      <line x1="174" y1="102" x2="180" y2="154" stroke="rgba(255,255,255,0.65)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="126" cy="100" r="4" fill="rgba(255,255,255,0.92)" />
                      <circle cx="174" cy="100" r="4" fill="rgba(255,255,255,0.92)" />
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <path d={shirtPath} fill={apparelColor} />
                  <path d={shirtPath} fill="url(#fabricVertical)" />
                  <path d={isBackView ? backNeckPath : neckPath} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" />
                  {!isBackView ? (
                    <>
                      <path d="M90 120 C106 108, 120 110, 128 126" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" strokeLinecap="round" />
                      <path d="M210 120 C194 108, 180 110, 172 126" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" strokeLinecap="round" />
                    </>
                  ) : null}
                </>
              )}

              <rect x={designFrame.x} y={designFrame.y} width={designFrame.w} height={designFrame.h} rx={isBackView ? 28 : 20} fill="rgba(255,255,255,0.94)" stroke="rgba(15,23,42,0.08)" />
              {logoUrl ? (
                <image href={logoUrl} x={designFrame.x} y={designFrame.y} width={designFrame.w} height={designFrame.h} preserveAspectRatio="xMidYMid slice" clipPath="" />
              ) : (
                <text x="150" y={designFrame.y + designFrame.h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#64748b">
                  {isBackView ? "ARTWORK" : "DESIGN"}
                </text>
              )}

              {!isBackView ? (
                <>
                  <text x="150" y={labelY} textAnchor="middle" fontSize="14" fontWeight="900" fill="rgba(255,255,255,0.96)" letterSpacing="0.8">
                    {values?.name || "YOUR NAME"}
                  </text>
                  <text x="150" y={labelY + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.82)" letterSpacing="0.6">
                    {values?.design || "Design text"}
                  </text>
                </>
              ) : (
                <text x="150" y={labelY + 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="rgba(255,255,255,0.88)" letterSpacing="1.2">
                  {values?.design || "BACK PRINT"}
                </text>
              )}
            </g>
          </svg>
        </div>
      </div>
    );
  }

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
