import { FaUsers, FaDesktop, FaClock, FaChartBar } from "react-icons/fa6";

interface StatCardProps {
  title: string;
  value: string;
  hint: string;
  accent: string;
}

const ICONS: Record<string, typeof FaUsers> = {
  "Người dùng": FaUsers,
  "Máy tính": FaDesktop,
  "Máy đang dùng": FaDesktop,
  "Tổng thời gian": FaClock,
};

export default function StatCard({ title, value, hint, accent }: StatCardProps) {
  const Icon = ICONS[title] ?? FaChartBar;

  return (
    <div className="ios-soft-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${accent}`} aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
