import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api, { getErrorMessage } from "@/lib/axios";
import ComputerApprovalPanel, { type BorrowRequest } from "@/components/computers/ComputerApprovalPanel";
import ComputerBorrowForm from "@/components/computers/ComputerBorrowForm";
import ComputerFormModal from "@/components/computers/ComputerFormModal";
import ComputerList, { type Computer } from "@/components/computers/ComputerList";
import showNotification from "@/components/common/Notification";
import type { PublicUser } from "@/types/user";

type ComputerStatus = "available" | "in_use" | "maintenance";

const emptyComputerForm = {
  name: "",
  room: "",
  specs: "",
  status: "available" as ComputerStatus,
};

export default function ComputersPage() {
  const [user, setUser] = useState<PublicUser | null>(null);
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

  async function loadData() {
    setLoading(true);
    try {
      const [meResponse, computerResponse, requestResponse] = await Promise.all([
        api.get("/auth/me").catch(() => null),
        api.get("/computers").catch(() => null),
        api.get("/computer-borrow-requests").catch(() => null),
      ]);

      if (meResponse) {
        setUser(meResponse.data.user as PublicUser);
      } else {
        setUser(null);
      }

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
      setLoading(false);
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
      await loadData();
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
      await loadData();
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
      await loadData();
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
      await loadData();
    } catch (err) {
      showNotification({
        type: "error",
        title: "Lỗi",
        content: getErrorMessage(err),
      });
    }
  }

  const isAdmin = Boolean(user?.is_admin);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Quản lý máy tính</h1>
              <p className="text-sm text-gray-500">Theo dõi phòng máy, trạng thái đang sử dụng và duyệt yêu cầu mượn.</p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyComputerForm);
                  setModalOpen(true);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-2xl font-semibold text-gray-900 shadow-sm transition hover:brightness-95"
                aria-label="Thêm máy tính mới"
                title="Thêm máy tính mới"
              >
                +
              </button>
            )}
          </div>

        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Danh sách máy trong phòng</h2>
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
          </div>

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
