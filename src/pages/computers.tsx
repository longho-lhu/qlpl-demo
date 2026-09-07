import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api, { getErrorMessage } from "@/lib/axios";
import ComputerApprovalPanel, { type BorrowRequest } from "@/components/computers/ComputerApprovalPanel";
import ComputerBorrowForm from "@/components/computers/ComputerBorrowForm";
import ComputerFormModal from "@/components/computers/ComputerFormModal";
import ComputerList, { type Computer } from "@/components/computers/ComputerList";
import showNotification from "@/components/common/Notification";
import { useAppSelector } from "@/store/hooks";

type ComputerStatus = "available" | "in_use" | "maintenance";

const emptyComputerForm = {
  name: "",
  room: "",
  specs: "",
  status: "available" as ComputerStatus,
};

export default function ComputersPage() {
  const user = useAppSelector((state) => state.user.user);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [form, setForm] = useState(emptyComputerForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [borrowForm, setBorrowForm] = useState({ computer_id: "", reason: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData(showLoadingState = true) {
    if (showLoadingState) {
      setLoading(true);
    }
    try {
      const [computerResponse, requestResponse] = await Promise.all([
        api.get("/computers").catch(() => null),
        api.get("/computer-borrow-requests").catch(() => null),
      ]);

      if (computerResponse) {
        setComputers(computerResponse.data.computers ?? []);
      }

      if (requestResponse) {
        setRequests(requestResponse.data.requests ?? []);
      }
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi",
        content: getErrorMessage(err),
      });
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }

  async function handleComputerSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.is_admin) {
      showNotification({
        type: "warning",
        title: "Quyền hạn",
        content: "Chỉ quản trị viên mới có quyền quản lý máy tính",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/computers/${editingId}`, form);
        showNotification({
          type: "success",
          title: "Thành công",
          content: "Cập nhật máy tính thành công",
        });
      } else {
        await api.post("/computers", form);
        showNotification({
          type: "success",
          title: "Thành công",
          content: "Thêm máy tính thành công",
        });
      }
      setForm(emptyComputerForm);
      setEditingId(null);
      setModalOpen(false);
      await loadData(false);
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi",
        content: getErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComputer(id: number) {
    if (!user?.is_admin) return;
    if (!window.confirm("Bạn có chắc muốn xoá máy tính này?")) return;

    try {
      await api.delete(`/computers/${id}`);
      showNotification({
        type: "success",
        title: "Thành công",
        content: "Xoá máy tính thành công",
      });
      await loadData(false);
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi",
        content: getErrorMessage(err),
      });
    }
  }

  async function handleBorrowSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      showNotification({
        type: "warning",
        title: "Đăng nhập",
        content: "Vui lòng đăng nhập để đăng ký mượn máy",
      });
      return;
    }
    if (!borrowForm.computer_id) {
      showNotification({
        type: "warning",
        title: "Chưa chọn máy",
        content: "Vui lòng chọn máy cần mượn",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/computer-borrow-requests", {
        computer_id: Number(borrowForm.computer_id),
        reason: borrowForm.reason.trim(),
      });
      setBorrowForm({ computer_id: "", reason: "" });
      showNotification({
        type: "success",
        title: "Đã gửi yêu cầu",
        content: "Yêu cầu mượn máy đã được gửi và đang chờ duyệt",
      });
      await loadData(false);
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi",
        content: getErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestAction(id: number, action: "approve" | "reject" | "return") {
    if (!user?.is_admin) {
      showNotification({
        type: "warning",
        title: "Quyền hạn",
        content: "Chỉ quản trị viên mới được xử lý yêu cầu",
      });
      return;
    }

    try {
      await api.patch(`/computer-borrow-requests/${id}`, { action });
      showNotification({
        type: "success",
        title: "Thành công",
        content:
          action === "approve"
            ? "Đã duyệt yêu cầu mượn máy"
            : action === "reject"
              ? "Đã từ chối yêu cầu"
              : "Máy đã được trả về và trạng thái cập nhật",
      });
      await loadData(false);
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi",
        content: getErrorMessage(err),
      });
    }
  }

  const isAdmin = Boolean(user?.is_admin);

  const stats = [
    { label: "Máy có sẵn", value: computers.filter((computer) => computer.status === "available").length, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Đang sử dụng", value: computers.filter((computer) => computer.status === "in_use").length, tone: "bg-amber-50 text-amber-700" },
    { label: "Bảo trì", value: computers.filter((computer) => computer.status === "maintenance").length, tone: "bg-rose-50 text-rose-700" },
    { label: "Yêu cầu chờ", value: requests.filter((request) => request.status === "pending").length, tone: "bg-blue-50 text-blue-700" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="glass-panel rounded-[30px] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Operations</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Quản lý máy tính</h1>
              <p className="mt-2 text-sm text-slate-600">Theo dõi phòng máy, trạng thái hoạt động và xử lý yêu cầu mượn trong thời gian thực.</p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyComputerForm);
                  setModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(79,110,247,0.28)] transition hover:translate-y-[-1px]"
                aria-label="Thêm máy tính mới"
                title="Thêm máy tính mới"
              >
                <span className="text-xl leading-none">+</span>
                Thêm máy
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm">
                <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${stat.tone}`}>
                  {stat.label}
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <section className="glass-panel rounded-[30px] p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Danh sách máy trong phòng</h2>
                <p className="text-sm text-slate-500">Tổng quan trạng thái từng thiết bị</p>
              </div>
            </div>
            <ComputerList
              computers={computers}
              isAdmin={isAdmin}
              loading={loading}
              selectedComputerId={borrowForm.computer_id}
              onSelectForBorrow={(computerId) => setBorrowForm((prev) => ({ ...prev, computer_id: computerId }))}
              onEdit={(computer) => {
                setEditingId(computer.id);
                setForm({
                  name: computer.name,
                  room: computer.room,
                  specs: computer.specs ?? "",
                  status: computer.status,
                });
                setModalOpen(true);
              }}
              onDelete={(id) => void handleDeleteComputer(id)}
            />
          </section>

          <ComputerBorrowForm
            user={user}
            computers={computers}
            value={borrowForm}
            submitting={submitting}
            onChange={(field, value) => setBorrowForm((prev) => ({ ...prev, [field]: value }))}
            onSubmit={handleBorrowSubmit}
          />
        </div>

        <ComputerApprovalPanel requests={requests} isAdmin={isAdmin} onAction={handleRequestAction} />
      </div>

      <ComputerFormModal
        open={modalOpen}
        isEditing={Boolean(editingId)}
        loading={submitting}
        form={form}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setForm(emptyComputerForm);
        }}
        onSubmit={handleComputerSubmit}
        onChange={(field, value) => {
          setForm((prev) => ({
            ...prev,
            [field]: field === "status" ? (value as ComputerStatus) : value,
          }));
        }}
      />
    </MainLayout>
  );
}
