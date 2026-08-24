import Link from "next/link";
import { useRouter } from "next/router";

import type { PublicUser } from "@/types/user";

interface SidebarProps {
  open: boolean;
  user: PublicUser | null;
}

export default function Sidebar({ open, user }: SidebarProps) {
  const router = useRouter();
  const navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Quản lý máy tính", href: "/computers" },
    { label: "Hồ sơ", href: "/profile" },
  ];

  return (
    <aside
      className={`glass-panel shrink-0 overflow-hidden rounded-[30px] transition-all duration-200 ${
        open ? "w-64" : "w-0"
      }`}
    >
      <nav className="w-64 space-y-2 p-3">
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-gradient-to-r from-blue-500/15 to-violet-500/15 text-blue-700 shadow-inner ring-1 ring-blue-200/60"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="pt-3">
          {user?.is_admin ? (
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 px-3 py-2.5 text-xs font-semibold text-amber-800 shadow-sm">
              Vai trò: Quản trị viên
            </div>
          ) : (
            <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 px-3 py-2.5 text-xs font-semibold text-blue-800 shadow-sm">
              Vai trò: Người dùng
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
