import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import type { Computer } from "@/components/computers/ComputerList";
import api, { getErrorMessage } from "@/lib/axios";

const statusConfig = {
  available: {
    label: "Có sẵn",
    className: "bg-emerald-100 text-emerald-700",
  },
  in_use: {
    label: "Đang sử dụng",
    className: "bg-amber-100 text-amber-700",
  },
  maintenance: {
    label: "Bảo trì",
    className: "bg-rose-100 text-rose-700",
  },
} satisfies Record<Computer["status"], { label: string; className: string }>;

export default function ComputerDetailPage() {
  const router = useRouter();
  const [computer, setComputer] = useState<Computer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;

  useEffect(() => {
    if (!router.isReady || !id) {
      return;
    }

    async function loadComputer() {
      setLoading(true);
      setError(null);

      try {
        const { data } = await api.get(`/computers/${id}`);
        setComputer(data.computer as Computer);
      } catch (err) {
        setError(getErrorMessage(err, "Không thể tải thông tin máy tính"));
        setComputer(null);
      } finally {
        setLoading(false);
      }
    }

    void loadComputer();
  }, [id, router.isReady]);

  const status = computer ? statusConfig[computer.status] : null;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Computer detail</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Chi tiết máy tính</h1>
          </div>

          <Link
            href="/computers"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[30px] border border-slate-200/80 bg-white/80 p-6 shadow-sm">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ) : error || !computer ? (
          <div className="rounded-[30px] border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
            <h2 className="text-lg font-semibold">Không thể tải thông tin</h2>
            <p className="mt-2 text-sm">{error ?? "Máy tính không tồn tại hoặc đã bị xoá."}</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[30px] border border-slate-200/80 bg-white/80 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-violet-100 text-xl font-bold text-blue-700">
                    {computer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{computer.name}</h2>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{computer.room}</p>
                  </div>
                </div>

                {status && (
                  <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                )}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phòng</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{computer.room}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Trạng thái</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{status?.label ?? "Không xác định"}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cấu hình</p>
                  <p className="mt-2 whitespace-pre-wrap text-base text-slate-700">
                    {computer.specs?.trim() ? computer.specs : "Chưa cập nhật cấu hình chi tiết."}
                  </p>
                </div>
              </div>
            </section>

            <aside className="rounded-[30px] border border-slate-200/80 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-slate-50 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Thông tin hệ thống</p>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-300">Mã máy</p>
                  <p className="mt-1 text-xl font-semibold">#{computer.id}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-300">Ngày tạo</p>
                  <p className="mt-1 text-base font-medium">
                    {new Date(computer.created_at).toLocaleString("vi-VN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-300">Tình trạng</p>
                  <p className="mt-1 text-base font-medium">{status?.label ?? "Không xác định"}</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
