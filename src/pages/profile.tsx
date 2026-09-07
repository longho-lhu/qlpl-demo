import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import api, { getErrorMessage } from "@/lib/axios";
import { supabase } from "@/lib/supabase";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser, updateUser } from "@/store/userSlice";

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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
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
    const currentUser = user ?? null;

    if (!currentUser) {
      api
        .get("/auth/me")
        .then(({ data }) => {
          dispatch(setUser(data.user));
          const nextUser = data.user;
          setUserId(nextUser.id);
          const currentAvatar = nextUser.avatar_url ?? "";
          setForm({
            full_name: nextUser.full_name ?? "",
            mssv: nextUser.mssv ?? "",
            class: nextUser.class ?? "",
            gender: nextUser.gender ?? "",
            phone: nextUser.phone ?? "",
            email: nextUser.email ?? "",
            avatar_url: currentAvatar,
          });
          setAvatarPreview(currentAvatar);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
      return;
    }

    setUserId(currentUser.id);
    const currentAvatar = currentUser.avatar_url ?? "";
    setForm({
      full_name: currentUser.full_name ?? "",
      mssv: currentUser.mssv ?? "",
      class: currentUser.class ?? "",
      gender: currentUser.gender ?? "",
      phone: currentUser.phone ?? "",
      email: currentUser.email ?? "",
      avatar_url: currentAvatar,
    });
    setAvatarPreview(currentAvatar);
    setLoaded(true);
  }, [dispatch, user]);

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

      const { data } = await api.put("/auth/profile", { ...form, avatar_url: avatarUrl });

      dispatch(updateUser(data.user));
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
      const { data } = await api.put("/auth/profile", form);
      dispatch(updateUser(data.user));
      setSuccess("Cập nhật hồ sơ thành công");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="mx-auto w-full max-w-4xl">
        <div className="glass-panel rounded-[30px] p-5 sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
            </div>
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Active
            </div>
          </div>

          {loaded && (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
              <aside className="rounded-[28px] border border-slate-200/80 bg-white/70 p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-800">Ảnh đại diện</h2>

                <div className="mb-4 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-100 shadow-sm" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-sm font-medium text-slate-500">
                      No image
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarSelect(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-500"
                />

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleAvatarSave}
                    disabled={!avatarFile || avatarSaving}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_20px_rgba(79,110,247,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {avatarSaving ? "Đang lưu ảnh..." : "Lưu ảnh đại diện"}
                  </button>
                  {avatarSuccess && <p className="mt-3 text-sm text-green-600">{avatarSuccess}</p>}
                </div>
              </aside>

              <form onSubmit={handleSubmit} className="space-y-4 rounded-[28px] border border-slate-200/80 bg-white/70 p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Họ và tên" value={form.full_name} onChange={(v) => updateField("full_name", v)} required />
                  <Field label="MSSV" value={form.mssv} onChange={(v) => updateField("mssv", v)} required />
                  <Field label="Lớp" value={form.class} onChange={(v) => updateField("class", v)} required />

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Giới tính</label>
                    <select
                      className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-slate-700 shadow-inner outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
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
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_24px_rgba(15,23,42,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
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
