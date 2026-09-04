import Link from "next/link";

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
        <div key={computer.id} className="rounded-[24px] border border-slate-200/80 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-sm font-semibold text-blue-700">
                  {computer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{computer.name}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{computer.room}</p>
                </div>
              </div>
              {computer.specs && <p className="mt-3 text-sm text-slate-600">Cấu hình: {computer.specs}</p>}
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
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

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/computers/${computer.id}`}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  Xem chi tiết
                </Link>

                {!isAdmin ? (
                  <button
                    type="button"
                    onClick={() => onSelectForBorrow(String(computer.id))}
                    disabled={computer.status !== "available" || selectedComputerId === String(computer.id)}
                    className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
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
                      className="rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(computer.id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
                    >
                      Xoá
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
