import type { ReactNode } from "react";

interface AuthLayoutProps {
  subheading: string;
  heading: string;
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthLayout({
  subheading,
  heading,
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(79,110,247,0.18),_transparent_23%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.16),_transparent_30%),linear-gradient(135deg,_#edf5ff_0%,_#eef2ff_34%,_#f7f3ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="glass-panel flex w-full max-w-5xl overflow-hidden rounded-[38px] border border-white/70 shadow-[0_30px_80px_rgba(79,110,247,0.12)]">
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 md:flex">
          <div className="pointer-events-none absolute -right-10 top-8 h-36 w-36 rounded-full border border-white/20" />
          <div className="pointer-events-none absolute right-28 top-28 h-3 w-3 rounded-full bg-white/40" />
          <div className="pointer-events-none absolute left-16 top-1/2 h-2 w-2 rounded-full bg-white/40" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent_38%)]" />

          <div className="relative z-10 flex items-center gap-3 p-10">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-white/10 text-sm font-bold text-white">
              ◎
            </span>
            <span className="text-sm font-medium tracking-[0.22em] text-white/90">
              QLPL DEMO
            </span>
          </div>

          <div className="relative z-10 px-10 pb-24">
            <p className="mb-2 text-sm text-white/75">{subheading}</p>
            <h1 className="mb-4 text-4xl font-extrabold uppercase leading-tight tracking-tight text-white">
              {heading}
            </h1>
            <div className="mb-4 h-1 w-12 rounded-full bg-white/80" />
            <p className="max-w-xs text-sm leading-6 text-white/75">{description}</p>
          </div>

          <svg
            className="absolute bottom-0 left-0 w-full text-white/10"
            viewBox="0 0 500 120"
            preserveAspectRatio="none"
          >
            <path d="M0,40 C150,120 350,0 500,60 L500,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 md:w-1/2 lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Account</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
            </div>
            <p className="mb-8 text-sm text-slate-500">Nhập thông tin bên dưới để tiếp tục.</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input
        {...inputProps}
        placeholder={label}
        className="w-full rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-inner shadow-slate-100/80 outline-none placeholder:text-slate-400 transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
