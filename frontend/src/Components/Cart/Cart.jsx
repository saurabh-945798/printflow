import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const CART_KEY = "printflow_cart_v1";
const ORDERS_KEY = "printflow_orders_v1";

const CATEGORY_META = {
  flex: {
    label: "Flex Printing",
    rate: 10,
    unit: "sq ft",
  },
  poster: {
    label: "Poster Printing",
    rate: 8,
    unit: "unit",
  },
  "visiting-card": {
    label: "Visiting Cards",
    rate: 5,
    unit: "unit",
  },
  "id-card": {
    label: "ID Cards",
    rate: 15,
    unit: "unit",
  },
  brochure: {
    label: "Brochures",
    rate: 25,
    unit: "unit",
  },
};

const LIMITS = { min: 1, max: 200 };

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const didLoad = useRef(false);

  /* ---------- LOAD / SAVE CART ---------- */
  useEffect(() => {
    const read = (storage) => {
      try {
        const raw = storage.getItem(CART_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    const fromLocal = read(localStorage);
    const fromSession = fromLocal ? null : read(sessionStorage);
    const baseItems = fromLocal || fromSession || [];
    const lastAdded = location.state?.lastAdded;
    if (lastAdded && !baseItems.some((it) => it.id === lastAdded.id)) {
      setItems([lastAdded, ...baseItems]);
    } else {
      setItems(baseItems);
    }
    didLoad.current = true;
  }, [location.key]);

  useEffect(() => {
    if (!token) return;
    const loadServerCart = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const serverItems = Array.isArray(data.items) ? data.items : [];
        setItems(serverItems);
        localStorage.setItem(CART_KEY, JSON.stringify(serverItems));
      } catch {
        // ignore server fetch failures
      }
    };
    loadServerCart();
  }, [token]);

  const syncCartToServer = async (nextItems) => {
    if (!token) return;
    try {
      await fetch("http://localhost:5000/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: nextItems }),
      });
    } catch {
      // ignore sync errors
    }
  };

  const handleRemove = async (id) => {
    const nextItems = items.filter((x) => x.id !== id);
    setItems(nextItems);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    } catch {
      // ignore local storage errors
    }
    await syncCartToServer(nextItems);
  };

  const handleCheckout = async () => {
    const order = {
      id: `ORD-${Date.now()}`,
      items,
      totals,
      paymentMethod,
      status: "Pending",
      placedAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      const prev = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(prev) ? prev : [];
      localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...list]));
    } catch {
      // ignore storage errors
    }

    if (token) {
      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.orders)) {
            localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
          }
        }
      } catch {
        // ignore order sync errors
      }
    }

    setItems([]);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify([]));
    } catch {
      // ignore local storage errors
    }
    await syncCartToServer([]);
    navigate("/orders");
  };

  useEffect(() => {
    if (!didLoad.current) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      try {
        sessionStorage.setItem(CART_KEY, JSON.stringify(items));
      } catch {
        // ignore storage failures
      }
    }
  }, [items]);

  /* ---------- HELPERS ---------- */
  const area = (it) =>
    it.kind === "area" ? it.length * it.width : 1;

  const subtotalItem = (it) => {
    const meta = CATEGORY_META[it.category];
    const rate = it.unitRate ?? meta?.rate ?? 0;
    return area(it) * it.quantity * rate;
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + subtotalItem(it), 0);
    const tax = subtotal * 0.05;
    const delivery = subtotal > 1500 ? 0 : items.length ? 5 : 0;
    return {
      subtotal,
      tax,
      delivery,
      grand: subtotal + tax + delivery,
    };
  }, [items]);

  const hasErrors = items.some(
    (it) =>
      it.kind === "area" &&
      (it.length < LIMITS.min || it.width < LIMITS.min)
  );

  /* ---------- EMPTY STATE ---------- */
  if (!items.length) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-slate-600 mt-2">
          Add a product to continue
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium"
        >
          Browse Services
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Cart</h1>
          <p className="text-slate-600">
            Review your print order before checkout
          </p>
        </div>

        {/* PAYMENT */}
        <div className="flex gap-2">
          {["online", "cod"].map((m) => (
            <button
              key={m}
              onClick={() => setPaymentMethod(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                paymentMethod === m
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              {m === "online" ? "Online" : "COD"}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* ITEMS */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((it) => {
            const meta = CATEGORY_META[it.category] || {
              label: "Custom Item",
              unit: "unit",
              rate: it.unitRate ?? 0,
            };
            const sub = subtotalItem(it);

            return (
              <div
                key={it.id}
                className="rounded-2xl bg-white ring-1 ring-black/5 p-5"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{meta.label}</h3>
                    <p className="text-sm text-slate-600">
                      {it.kind === "area"
                        ? `${it.length} × ${it.width} ${meta.unit}`
                        : "Unit based"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(it.id)}
                    className="text-sm text-rose-600"
                  >
                    Remove
                  </button>
                </div>

                {/* QTY */}
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) =>
                        setItems((p) =>
                          p.map((x) =>
                            x.id === it.id
                              ? {
                                  ...x,
                                  quantity: Number(e.target.value),
                                }
                              : x
                          )
                        )
                      }
                      className="w-16 rounded-lg border px-2 py-1"
                    />
                  </div>
                  <span className="font-semibold">
                    {formatINR(sub)}
                  </span>
                </div>

              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 rounded-2xl bg-white ring-1 ring-black/5 p-6">
            <h3 className="font-semibold text-lg mb-4">
              Order Summary
            </h3>

            <div className="space-y-2 text-sm">
              <Row label="Subtotal" value={totals.subtotal} />
              <Row label="Tax" value={totals.tax} />
              <Row label="Delivery" value={totals.delivery} />
              <hr />
              <Row
                label="Grand Total"
                value={totals.grand}
                bold
              />
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Final amount will be confirmed on WhatsApp
            </p>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={hasErrors}
              onClick={handleCheckout}
              className={`mt-6 w-full rounded-xl py-3 font-medium ${
                hasErrors
                  ? "bg-slate-200 text-slate-500"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {hasErrors
                ? "Complete required fields"
                : "Proceed to Checkout"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* MOBILE SUMMARY */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white ring-1 ring-black/10 p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            {formatINR(totals.grand)}
          </span>
          <button
            onClick={() => setShowMobileSummary((v) => !v)}
            className="text-sm text-indigo-600"
          >
            {showMobileSummary ? "Hide" : "Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className="flex justify-between">
    <span className={bold ? "font-semibold" : ""}>{label}</span>
    <span className={bold ? "font-bold" : ""}>
      {formatINR(value)}
    </span>
  </div>
);

export default Cart;
