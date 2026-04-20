import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiUrl } from "../../lib/api.js";

const ORDERS_KEY = "printflow_orders_v1";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const STATUS_COLOR = {
  Pending: "bg-slate-200 text-slate-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "In-Print": "bg-indigo-100 text-indigo-700",
  Shipped: "bg-amber-100 text-amber-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

const Orders = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (token) {
        try {
          const res = await fetch(apiUrl("/api/orders"), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data.orders) ? data.orders : [];
            setOrders(list);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
            return;
          }
        } catch {
          // fall back to local
        }
      }
      try {
        const raw = localStorage.getItem(ORDERS_KEY);
        const list = raw ? JSON.parse(raw) : [];
        setOrders(Array.isArray(list) ? list : []);
      } catch {
        setOrders([]);
      }
    };
    load();
  }, [token]);

  const filteredOrders =
    filter === "All"
      ? orders
      : orders.filter((o) => o.status === filter);

  if (!filteredOrders.length) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-semibold">No orders found</h1>
        <p className="text-slate-600 mt-2">
          Start a new customization to place your first order
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium"
        >
          Start Customizing
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="text-slate-600">
            Track and manage your print orders
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl border px-4 py-2 text-sm"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>In-Print</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const open = expanded === order.id;
          const firstItem = order.items?.[0];

          return (
            <div
              key={order.id}
              className="rounded-2xl bg-white ring-1 ring-black/5 p-5"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {firstItem?.category || "Order"}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {order.items?.length || 0} item(s)
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <span className="font-bold">
                    {formatINR(order.totals?.grand || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Items</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {order.items?.map((it) => it.category).join(", ")}
                  </p>
                </div>

                <div>
                  <p className="font-medium">Payment</p>
                  <p>
                    {order.paymentMethod?.toUpperCase() || "ONLINE"}{" "}
                    <span className="font-semibold">Pending</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    WhatsApp: <span className="font-medium">Pending</span>
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-medium">Customer</p>
                  <p>{order.customer?.name || "Customer"}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setExpanded(open ? null : order.id)}
                  className="text-sm text-indigo-600"
                >
                  {open ? "Hide details" : "View details"}
                </button>

                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm text-slate-700"
                >
                  Reorder
                </button>
              </div>

              {open && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 border-t pt-4 text-sm"
                >
                  <div className="space-y-1">
                    <Row
                      label="Subtotal"
                      value={formatINR(order.totals?.subtotal || 0)}
                    />
                    <Row
                      label="Tax"
                      value={formatINR(order.totals?.tax || 0)}
                    />
                    <Row
                      label="Delivery"
                      value={formatINR(order.totals?.delivery || 0)}
                    />
                    <Row
                      label="Total"
                      value={formatINR(order.totals?.grand || 0)}
                      bold
                    />
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Row = ({ label, value, bold }) => (
  <div className="flex justify-between">
    <span className={bold ? "font-semibold" : ""}>{label}</span>
    <span className={bold ? "font-bold" : ""}>{value}</span>
  </div>
);

export default Orders;
