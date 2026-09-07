import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "@/lib/axios";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/userSlice";
import type { PublicUser } from "@/types/user";

interface UserMenuProps {
  user: PublicUser | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await api.post("/auth/logout");
    dispatch(clearUser());
    router.push("/auth/login");
  }

  if (!user) return null;

  const displayName = user.full_name || user.username;
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-white/70 bg-white/55 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-white/70"
      >
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt={displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-white/80" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white shadow-sm">
            {initial}
          </span>
        )}
        <span className="text-sm font-semibold text-slate-700">{displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-2xl border border-white/70 bg-white/75 py-1.5 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100/80"
            onClick={() => setOpen(false)}
          >
            Hồ sơ cá nhân
          </Link>
          <Link
            href="/auth/change-password"
            className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100/80"
            onClick={() => setOpen(false)}
          >
            Đổi mật khẩu
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50/80"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
