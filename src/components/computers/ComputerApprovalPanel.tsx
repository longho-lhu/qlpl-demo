type RequestStatus = "pending" | "approved" | "rejected" | "returned";

interface Borrower {
  id: number;
  username: string;
  full_name: string | null;
}

interface ComputerSummary {
  id: number;
  name: string;
  room: string;
  status: "available" | "in_use" | "maintenance";
}

export interface BorrowRequest {
  id: number;
  computer_id: number;
  borrower_id: number;
  reason: string | null;
  status: RequestStatus;
  requested_at: string;
  approved_by: number | null;
  approved_at: string | null;
  returned_at: string | null;
  borrower?: Borrower;
  computer?: ComputerSummary;
}

interface ComputerApprovalPanelProps {
  requests: BorrowRequest[];
  isAdmin: boolean;
  onAction: (id: number, action: "approve" | "reject" | "return") => void;
}

export default function ComputerApprovalPanel({ requests, isAdmin, onAction }: ComputerApprovalPanelProps) {
  if (!isAdmin) return null;

  return (
    <div className="glass-panel rounded-[30px] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Approval</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Yêu cầu mượn máy</h2>
        </div>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-500">Chưa có yêu cầu nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="px-3 py-2 font-medium">Máy</th>
                <th className="px-3 py-2 font-medium">Người yêu cầu</th>
                <th className="px-3 py-2 font-medium">Lý do</th>
                <th className="px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="border-b border-slate-200 align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{request.computer?.name ?? "-"}</p>
                    <p className="text-xs text-slate-500">{request.computer?.room ?? "-"}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <p className="font-medium">{request.borrower?.full_name || request.borrower?.username || "-"}</p>
                    <p className="text-xs text-slate-500">{request.borrower?.username || "-"}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{request.reason || "Không có lý do"}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        request.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : request.status === "approved"
                            ? "bg-blue-100 text-blue-700"
                            : request.status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {request.status === "pending"
                        ? "Chờ duyệt"
                        : request.status === "approved"
                          ? "Đã duyệt"
                          : request.status === "rejected"
                            ? "Từ chối"
                            : "Đã trả"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {request.status === "pending" && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onAction(request.id, "approve")}
                          className="rounded-xl bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-600"
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(request.id, "reject")}
                          className="rounded-xl bg-rose-500 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-rose-600"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                    {request.status === "approved" && (
                      <button
                        type="button"
                        onClick={() => onAction(request.id, "return")}
                        className="rounded-xl bg-indigo-500 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-600"
                      >
                        Đánh dấu trả máy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
