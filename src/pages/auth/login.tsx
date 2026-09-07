import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/axios";
import AuthLayout, { AuthField } from "@/components/AuthLayout";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/userSlice";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      dispatch(setUser(data.user));
      if (!data.user.profile_completed) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      subheading="Nice to see you again"
      heading="Welcome Back"
      title="Đăng nhập"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <AuthField
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-500">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
            Ghi nhớ đăng nhập
          </label>
          <Link href="/auth/register" className="font-medium text-blue-600 hover:underline">
            Chưa có tài khoản?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="ios-button-primary w-full px-4 py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-50"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  );
}