import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api, { getErrorMessage } from "@/lib/axios";

interface ProfileForm {
  full_name: string;
  mssv: string;
  class: string;
  gender: string;
  phone: string;
  email: string;
}

const emptyForm: ProfileForm = {
  full_name: "",
  mssv: "",
  class: "",
  gender: "",
  phone: "",
  email: "",
};

export default function CompleteProfile() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => {
        if (data.user.profile_completed) {
          router.replace("/");
          return;
        }
        setChecking(false);
      })
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.put("/auth/profile", form);
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (checking) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(124,156,255,0.35),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.28),_transparent_30%),linear-gradient(135deg,_#edf4ff_0%,_#eef1ff_40%,_#f4efff_100%)] px-4 py-10">
      <div className="w-full max-w-md ios-soft-card p-8">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900">
          Hoàn thiện thông tin
        </h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Vui lòng cập nhật thông tin cá nhân trước khi tiếp tục
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="ios-button-primary w-full px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </div>
    </div>
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
