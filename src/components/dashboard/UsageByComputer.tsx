interface ComputerUsage {
  name: string;
  room: string;
  hours: number;
}

interface UsageByComputerProps {
  data: ComputerUsage[];
}

export default function UsageByComputer({ data }: UsageByComputerProps) {
  const maxHours = Math.max(...data.map((item) => item.hours), 1);

  return (
    <div className="ios-soft-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Thời gian sử dụng theo máy</h3>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Live</span>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={`${item.name}-${item.room}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="text-slate-500">{item.hours.toFixed(1)}h</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100/90">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500"
                style={{ width: `${(item.hours / maxHours) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Phòng: {item.room}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
