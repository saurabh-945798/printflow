import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900 lg:pl-72">
      <Sidebar />
      <main className="min-h-screen min-w-0 pt-14 lg:pt-0">
        <div className="min-h-screen min-w-0 px-0 lg:px-3 lg:py-3">
          <div className="min-h-[calc(100vh-1.5rem)] overflow-hidden lg:rounded-[2rem] lg:border lg:border-white/70 lg:bg-white/35 lg:shadow-[0_22px_65px_rgba(15,23,42,0.08)] lg:backdrop-blur">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
