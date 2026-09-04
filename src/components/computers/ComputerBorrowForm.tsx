import type { PublicUser } from "@/types/user";
import type { Computer } from "./ComputerList";

interface ComputerBorrowFormProps {
  user: PublicUser | null;
  computers: Computer[];
  value: { computer_id: string; reason: string };
  onChange: (field: "computer_id" | "reason", value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export default function ComputerBorrowForm({
  user,
  computers,
  value,
  onChange,
  onSubmit,
  submitting,
}: ComputerBorrowFormProps) {
  return (
    <div className="glass-panel rounded-[30px] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Request</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Đăng ký mượn máy</h2>
        </div>
      </div>

      {!user ? (
        <p className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-500">Bạn cần đăng nhập để đăng ký mượn máy.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-slate-700">
            <span className="mb-1.5 block font-medium">Chọn máy</span>
            <select
              value={value.computer_id}
              onChange={(e) => onChange("computer_id", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">-- Chọn máy --</option>
              {computers.map((computer) => (
                <option key={computer.id} value={computer.id} disabled={computer.status !== "available"}>
                  {computer.name} - {computer.room} {computer.status !== "available" ? "(không sẵn)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-700">
            <span className="mb-1.5 block font-medium">Lý do mượn</span>
            <textarea
              value={value.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              rows={4}
              placeholder="Ví dụ: cần làm bài tập, demo, hoặc thực hành..."
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(79,110,247,0.26)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Gửi yêu cầu mượn"}
          </button>
        </form>
      )}
    </div>
  );
}
