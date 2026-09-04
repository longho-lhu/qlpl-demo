import Link from "next/link";
import { useRouter } from "next/router";
import { FiGrid, FiMonitor, FiUser } from "react-icons/fi";

import type { PublicUser } from "@/types/user";

interface SidebarProps {
  open: boolean;
  user: PublicUser | null;
}

export default function Sidebar({ open, user }: SidebarProps) {
  const router = useRouter();
  const navItems = [
    { label: "Trang chủ", href: "/", icon: FiGrid },
    { label: "Quản lý máy tính", href: "/computers", icon: FiMonitor },
    { label: "Hồ sơ", href: "/profile", icon: FiUser },
  ];

  return (
    <aside
      className={`glass-panel shrink-0 overflow-hidden rounded-[30px] transition-all duration-200 ${
        open ? "w-72" : "w-0"
      }`}
    >
      <nav className="w-72 space-y-2 p-3">
        <div className="px-2 pb-2 pt-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Navigation</p>
        </div>

        {navItems.map((item) => {
          const active = router.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-blue-500/12 to-violet-500/12 text-blue-700 shadow-inner ring-1 ring-blue-200/70"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-white/80 text-blue-700" : "bg-slate-100/80 text-slate-600"}`}>
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}

        <div className="pt-4">
          {user?.is_admin ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs font-semibold text-amber-800 shadow-sm">
              Vai trò: Quản trị viên
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/90 px-3 py-2.5 text-xs font-semibold text-blue-800 shadow-sm">
              Vai trò: Người dùng
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
