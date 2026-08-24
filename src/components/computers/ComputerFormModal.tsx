type ComputerStatus = "available" | "in_use" | "maintenance";

interface ComputerFormData {
  name: string;
  room: string;
  specs: string;
  status: ComputerStatus;
}

interface ComputerFormModalProps {
  open: boolean;
  isEditing?: boolean;
  loading?: boolean;
  form: ComputerFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof ComputerFormData, value: string) => void;
}

export default function ComputerFormModal({
  open,
  isEditing = false,
  loading = false,
  form,
  onClose,
  onSubmit,
  onChange,
}: ComputerFormModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[30px] border border-white/70 bg-white/70 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">{isEditing ? "Sửa máy tính" : "Thêm máy tính mới"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/60 text-lg text-slate-500 transition hover:bg-white hover:text-slate-700"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-700 md:col-span-1">
            <span className="mb-1.5 block font-medium">Tên máy</span>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
              required
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-1">
            <span className="mb-1.5 block font-medium">Phòng</span>
            <input
              value={form.room}
              onChange={(e) => onChange("room", e.target.value)}
              className="w-full rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
              required
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-2">
            <span className="mb-1.5 block font-medium">Cấu hình / mô tả</span>
            <textarea
              value={form.specs}
              onChange={(e) => onChange("specs", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
            />
          </label>

          <label className="text-sm text-slate-700 md:col-span-1">
            <span className="mb-1.5 block font-medium">Trạng thái</span>
            <select
              value={form.status}
              onChange={(e) => onChange("status", e.target.value)}
              className="w-full rounded-2xl border border-white/70 bg-white/60 px-3 py-2.5 text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
            >
              <option value="available">Có sẵn</option>
              <option value="in_use">Đang sử dụng</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </label>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="ios-button-secondary px-4 py-2.5 text-sm font-medium"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ios-button-primary px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm máy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
