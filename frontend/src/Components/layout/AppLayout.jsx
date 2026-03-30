import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="ml-64 min-h-screen w-full bg-[#F6F8FC]">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
