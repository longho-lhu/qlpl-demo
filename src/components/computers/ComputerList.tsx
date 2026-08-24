type ComputerStatus = "available" | "in_use" | "maintenance";

export interface Computer {
  id: number;
  name: string;
  room: string;
  specs: string | null;
  status: ComputerStatus;
  created_at: string;
}

interface ComputerListProps {
  computers: Computer[];
  isAdmin: boolean;
  loading: boolean;
  selectedComputerId: string;
  onSelectForBorrow: (computerId: string) => void;
  onEdit: (computer: Computer) => void;
  onDelete: (id: number) => void;
}

export default function ComputerList({
  computers,
  isAdmin,
  loading,
  selectedComputerId,
  onSelectForBorrow,
  onEdit,
  onDelete,
}: ComputerListProps) {
  if (loading) {
    return <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>;
  }

  if (computers.length === 0) {
    return <p className="text-sm text-slate-500">Chưa có máy tính nào được thêm.</p>;
  }

  return (
    <div className="space-y-3">
      {computers.map((computer) => (
        <div key={computer.id} className="ios-soft-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-900">{computer.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    computer.status === "available"
                      ? "bg-emerald-100 text-emerald-700"
                      : computer.status === "in_use"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {computer.status === "available"
                    ? "Có sẵn"
                    : computer.status === "in_use"
                      ? "Đang sử dụng"
                      : "Bảo trì"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">Phòng: {computer.room}</p>
              {computer.specs && <p className="text-sm text-slate-500">Cấu hình: {computer.specs}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {!isAdmin ? (
                <button
                  type="button"
                  onClick={() => onSelectForBorrow(String(computer.id))}
                  disabled={computer.status !== "available" || selectedComputerId === String(computer.id)}
                  className="ios-button-primary px-3.5 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                >
                  {selectedComputerId === String(computer.id)
                    ? "Đã chọn"
                    : computer.status === "available"
                      ? "Đăng ký mượn"
                      : "Không khả dụng"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(computer)}
                    className="ios-button-secondary px-3.5 py-2 text-sm font-medium"
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(computer.id)}
                    className="rounded-2xl border border-rose-200 bg-rose-50/80 px-3.5 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
                  >
                    Xoá
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
