import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AdjustmentsHorizontalIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  SwatchIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../context/AuthContext";

const navItems = [
  { name: "Dashboard", to: "/dashboard", icon: Squares2X2Icon },
  { name: "Customize", to: "/customize", icon: AdjustmentsHorizontalIcon },
  { name: "Cart", to: "/cart", icon: ShoppingCartIcon },
  { name: "Orders", to: "/orders", icon: ClipboardDocumentListIcon },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <div className="border-b border-slate-200 px-6 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#0ea5e9)] text-sm font-black text-white shadow-sm shadow-sky-200">
            PF
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">PrintFlow</h1>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Control panel</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-sm font-bold text-orange-700 ring-1 ring-orange-100">
              {(user?.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "PrintFlow User"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || "signed in"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <div className="mb-3 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          <SwatchIcon className="h-4 w-4 text-sky-600" />
          Workspace
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-[linear-gradient(135deg,#fff7ed,#eff6ff)] text-slate-950 ring-1 ring-slate-200 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? "text-orange-500" : "text-slate-400 group-hover:text-sky-600"}`} />
                  <span className="font-semibold">{item.name}</span>
                  {isActive ? <span className="ml-auto h-2.5 w-2.5 rounded-full bg-sky-500" /> : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-4">
        <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">Fast print ops</p>
          <p className="mt-1 text-xs leading-6 text-slate-500">
            Manage custom requests, track orders, and keep cart activity inside one clean workflow.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </motion.button>

        {mobile ? <div className="pb-2" /> : null}
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700">
            <Bars3Icon className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-bold text-slate-900">PrintFlow</p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          </div>
        </div>
        <div className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-100">
          Live
        </div>
      </div>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-hidden border-r border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed left-0 top-0 z-50 h-screen w-72 overflow-hidden border-r border-slate-200 bg-white shadow-2xl lg:hidden"
            >
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
