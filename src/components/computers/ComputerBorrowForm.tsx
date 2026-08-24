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
    <div className="ios-soft-card p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Đăng ký mượn máy</h2>
      {!user ? (
        <p className="text-sm text-slate-500">Bạn cần đăng nhập để đăng ký mượn máy.</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-slate-700">
            <span className="mb-1.5 block font-medium">Chọn máy</span>
            <select
              value={value.computer_id}
              onChange={(e) => onChange("computer_id", e.target.value)}
              className="w-full rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
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
              placeholder="Ví dụ: cần làm bài tập hoặc demo..."
              className="w-full rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white/80"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="ios-button-primary w-full px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi yêu cầu mượn"}
          </button>
        </form>
      )}
    </div>
  );
}
