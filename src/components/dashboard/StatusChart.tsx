interface StatusItem {
  label: string;
  value: number;
  color: string;
}

interface StatusChartProps {
  data: StatusItem[];
}

export default function StatusChart({ data }: StatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="ios-soft-card p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Máy theo trạng thái</h3>
      <div className="space-y-4">
        {data.map((item) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-500">{item.value} máy</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100/80">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
