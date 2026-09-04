import UserMenu from "./UserMenu";
import type { PublicUser } from "@/types/user";

interface HeaderProps {
  onToggleSidebar: () => void;
  user: PublicUser | null;
}

export default function Header({ onToggleSidebar, user }: HeaderProps) {
  return (
    <header className="glass-panel flex h-20 w-full shrink-0 items-center justify-between rounded-[30px] px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Đóng/mở menu"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/70 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white/90"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-soft">
            Q
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Workspace</p>
            <span className="text-lg font-semibold text-slate-800">QLPL Demo</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System online
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
