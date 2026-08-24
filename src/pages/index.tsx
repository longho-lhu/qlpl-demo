import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import StatusChart from "@/components/dashboard/StatusChart";
import UsageByComputer from "@/components/dashboard/UsageByComputer";
import api from "@/lib/axios";

interface DashboardData {
  users: number;
  computers: {
    total: number;
    available: number;
    in_use: number;
    maintenance: number;
  };
  usageByComputer: Array<{
    id: number;
    name: string;
    room: string;
    hours: number;
  }>;
  totalUsageHours: number;
}

const emptyDashboardData: DashboardData = {
  users: 0,
  computers: { total: 0, available: 0, in_use: 0, maintenance: 0 },
  usageByComputer: [],
  totalUsageHours: 0,
};

export default function Home() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data } = await api.get("/dashboard");
        setData(data);
      } catch {
        setData(emptyDashboardData);
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const statusChartData = [
    { label: "Có sẵn", value: data.computers.available, color: "#16a34a" },
    { label: "Đang sử dụng", value: data.computers.in_use, color: "#f59e0b" },
    { label: "Bảo trì", value: data.computers.maintenance, color: "#ef4444" },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Tổng quan hệ thống phòng máy và người dùng</p>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Người dùng"
                value={String(data.users)}
                hint="Tổng số tài khoản đăng ký"
                accent="bg-blue-100 text-blue-700"
              />
              <StatCard
                title="Máy tính"
                value={String(data.computers.total)}
                hint="Tổng số máy hiện có"
                accent="bg-violet-100 text-violet-700"
              />
              <StatCard
                title="Máy đang dùng"
                value={String(data.computers.in_use)}
                hint="Máy đang được sử dụng"
                accent="bg-amber-100 text-amber-700"
              />
              <StatCard
                title="Tổng thời gian"
                value={`${data.totalUsageHours.toFixed(1)}h`}
                hint="Tổng thời gian đã sử dụng"
                accent="bg-green-100 text-green-700"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <StatusChart data={statusChartData} />
              <UsageByComputer data={data.usageByComputer.map((item) => ({ ...item, hours: Number(item.hours || 0) }))} />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
