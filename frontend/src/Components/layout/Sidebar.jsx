import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", to: "/dashboard", icon: Squares2X2Icon },
  { name: "Customize", to: "/customize", icon: AdjustmentsHorizontalIcon },
  { name: "Cart", to: "/cart", icon: ShoppingCartIcon },
  { name: "Orders", to: "/orders", icon: ClipboardDocumentListIcon },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black">
          PF
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">PrintFlow</h1>
          <p className="text-xs text-slate-500">Smart Print Ordering</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3 space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3
                     text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* ---------- Mobile Top Bar ---------- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/90 backdrop-blur
                      border-b border-black/5 flex items-center px-4">
        <button onClick={() => setOpen(true)}>
          <Bars3Icon className="h-6 w-6 text-slate-700" />
        </button>
        <span className="ml-3 font-semibold text-slate-900">PrintFlow</span>
      </div>

      {/* ---------- Desktop Sidebar ---------- */}
      <aside
        className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-64
                   bg-white/90 backdrop-blur border-r border-black/5 shadow-sm"
      >
        <SidebarContent />
      </aside>

      {/* ---------- Mobile Drawer ---------- */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/30"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-screen w-64
                         bg-white shadow-xl"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <span className="font-semibold text-slate-900">Menu</span>
                <button onClick={() => setOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-slate-700" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
