import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api, { getErrorMessage } from "@/lib/axios";
import type { PublicUser } from "@/types/user";

interface ProfileForm {
  full_name: string;
  mssv: string;
  class: string;
  gender: string;
  phone: string;
  email: string;
  avatar_url: string;
}

const emptyForm: ProfileForm = {
  full_name: "",
  mssv: "",
  class: "",
  gender: "",
  phone: "",
  email: "",
  avatar_url: "",
};

export default function Profile() {
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      const user = data.user as PublicUser;
      setForm({
        full_name: user.full_name ?? "",
        mssv: user.mssv ?? "",
        class: user.class ?? "",
        gender: user.gender ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        avatar_url: user.avatar_url ?? "",
      });
      setLoaded(true);
    });
  }, []);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.put("/auth/profile", form);
      setSuccess("Cập nhật hồ sơ thành công");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-2xl ios-soft-card p-8">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Hồ sơ cá nhân</h1>
        {loaded && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Ảnh đại diện (URL)" value={form.avatar_url} onChange={(v) => updateField("avatar_url", v)} />
            <Field label="Họ và tên" value={form.full_name} onChange={(v) => updateField("full_name", v)} required />
            <Field label="MSSV" value={form.mssv} onChange={(v) => updateField("mssv", v)} required />
            <Field label="Lớp" value={form.class} onChange={(v) => updateField("class", v)} required />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Giới tính</label>
              <select
                className="w-full rounded-2xl border border-white/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                required
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <Field label="Số điện thoại" value={form.phone} onChange={(v) => updateField("phone", v)} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="ios-button-primary w-full px-6 py-2.5 text-sm font-medium sm:w-auto"
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </form>
        )}
      </div>
    </MainLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        className="w-full rounded-2xl border border-white/80 bg-white/60 px-3 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:bg-white/80"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
