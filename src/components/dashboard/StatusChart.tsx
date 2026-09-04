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
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Máy theo trạng thái</h3>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {total} total
        </span>
      </div>

      <div className="space-y-4">
        {data.map((item) => {
          const percent = Math.round((item.value / total) * 100);
          return (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="text-slate-500">{item.value} máy</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100/90">
                <div
                  className="h-full rounded-full transition-all duration-200"
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
