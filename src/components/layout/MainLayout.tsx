import { useEffect, useState, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import api from "@/lib/axios";
import type { PublicUser } from "@/types/user";

export default function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden px-3 py-3">
      <Header onToggleSidebar={() => setSidebarOpen((open) => !open)} user={user} />
      <div className="mt-3 flex flex-1 gap-3 overflow-hidden">
        <Sidebar open={sidebarOpen} user={user} />
        <main className="glass-panel flex-1 overflow-y-auto rounded-[30px] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
