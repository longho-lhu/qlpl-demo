import UserMenu from "./UserMenu";
import type { PublicUser } from "@/types/user";

interface HeaderProps {
  onToggleSidebar: () => void;
  user: PublicUser | null;
}

export default function Header({ onToggleSidebar, user }: HeaderProps) {
  return (
    <header className="glass-panel flex h-18 w-full shrink-0 items-center justify-between rounded-[28px] px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Đóng/mở menu"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/60 bg-white/50 text-slate-700 shadow-sm transition hover:bg-white/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">Workspace</p>
          <span className="text-lg font-semibold text-slate-800">QLPL Demo</span>
        </div>
      </div>
      <UserMenu user={user} />
    </header>
  );
}
