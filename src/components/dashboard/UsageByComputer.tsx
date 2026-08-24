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
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Thời gian sử dụng theo máy</h3>
      <div className="space-y-4">
        {data.map((item) => (
          <div key={`${item.name}-${item.room}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="text-slate-500">{item.hours.toFixed(1)}h</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
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
