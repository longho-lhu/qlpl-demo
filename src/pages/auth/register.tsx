import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api, { getErrorMessage } from "@/lib/axios";
import AuthLayout, { AuthField } from "@/components/AuthLayout";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 2) {
      setError("Mật khẩu phải có ít nhất 2 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { username, password });
      router.push("/auth/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      subheading="Join us today"
      heading="Get Started"
      title="Đăng ký"
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
          minLength={2}
          required
        />
        <AuthField
          label="Nhập lại mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={2}
          required
        />
        <div className="flex items-center justify-end text-sm">
          <Link href="/auth/login" className="font-medium text-blue-600 hover:underline">
            Đã có tài khoản?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="ios-button-primary w-full px-4 py-3 text-sm font-semibold uppercase tracking-wide disabled:opacity-50"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>
    </AuthLayout>
  );
}