import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

function AppLayout() {
  const { pathname } = useLocation();
  const chatMode = pathname.startsWith("/chat");

  if (chatMode) {
    return (
      <div className="relative min-h-dvh bg-[#dfe5e7] text-slate-950">
        <div className="absolute inset-x-0 top-0 h-40 bg-[#00a884]" />
        <main className="relative min-h-dvh min-w-0 overflow-hidden">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] bg-[linear-gradient(180deg,#f7f8fa_0%,#eef2f5_100%)]">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
