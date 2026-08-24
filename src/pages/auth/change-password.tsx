import { useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import api, { getErrorMessage } from "@/lib/axios";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 2) {
      setError("Mật khẩu mới phải có ít nhất 2 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setSuccess("Đổi mật khẩu thành công");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-md ios-soft-card p-8">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Đổi mật khẩu</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={2}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              className="w-full rounded-2xl border border-white/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={2}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="ios-button-primary w-full px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
}
