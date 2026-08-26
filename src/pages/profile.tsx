import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api, { getErrorMessage } from "@/lib/axios";
import { supabase } from "@/lib/supabase";
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
  const [userId, setUserId] = useState<number | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState("");

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      const user = data.user as PublicUser;
      setUserId(user.id);
      const currentAvatar = user.avatar_url ?? "";
      setForm({
        full_name: user.full_name ?? "",
        mssv: user.mssv ?? "",
        class: user.class ?? "",
        gender: user.gender ?? "",
        phone: user.phone ?? "",
        email: user.email ?? "",
        avatar_url: currentAvatar,
      });
      setAvatarPreview(currentAvatar);
      setLoaded(true);
    });
  }, []);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleAvatarSelect(file: File | null) {
    setError("");
    setSuccess("");
    setAvatarSuccess("");
    setAvatarFile(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      return;
    }

    setAvatarPreview(form.avatar_url);
  }

  async function handleAvatarSave() {
    if (!avatarFile || !userId) {
      setError("Vui lòng chọn ảnh trước khi lưu");
      return;
    }

    if (!supabase) {
      setError("Supabase chưa được cấu hình");
      return;
    }

    setAvatarSaving(true);
    setError("");
    setSuccess("");
    setAvatarSuccess("");

    try {
      const extension = avatarFile.name.split(".").pop() || "png";
      const storagePath = `avatars/${userId}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(storagePath, avatarFile, {
          upsert: true,
          cacheControl: "3600",
          contentType: avatarFile.type || "image/png",
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Tải ảnh lên Supabase thất bại");
      }

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(storagePath);
      const avatarUrl = publicUrlData.publicUrl;

      await api.put("/auth/profile", { ...form, avatar_url: avatarUrl });

      setForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setAvatarPreview(avatarUrl);
      setAvatarFile(null);
      setAvatarSuccess("Đã lưu ảnh đại diện thành công");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAvatarSuccess("");
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
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white/60 p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-slate-800">Ảnh đại diện</h2>

              <div className="mb-4 flex items-center gap-4">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-sm text-slate-500">No image</div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
              />

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAvatarSave}
                  disabled={!avatarFile || avatarSaving}
                  className="ios-button-primary px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {avatarSaving ? "Đang lưu ảnh..." : "Lưu ảnh đại diện"}
                </button>
                {avatarSuccess && <p className="text-sm text-green-600">{avatarSuccess}</p>}
              </div>
            </div>

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
              {success && <p className="text-sm text-green-600">{success}</p>}

              <button
                type="submit"
                disabled={loading}
                className="ios-button-primary w-full px-6 py-2.5 text-sm font-medium sm:w-auto"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
              </button>
            </form>
          </div>
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
