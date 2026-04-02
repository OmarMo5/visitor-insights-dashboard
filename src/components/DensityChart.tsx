import { VisitorRecord } from "@/lib/sheets";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DensityChartProps {
  data: VisitorRecord[];
}

export function DensityChart({ data }: DensityChartProps) {
  const chartData = data
    .filter(d => !d.isClosed)
    .sort((a, b) => a.day - b.day)
    .map(d => ({
      day: d.day,
      density: +(d.density * 100).toFixed(1),
      visitors: d.visitors,
    }));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card" dir="rtl">
      <h3 className="text-lg font-semibold text-foreground mb-1">اتجاه الكثافة</h3>
      <p className="text-xs text-muted-foreground mb-4">نسبة الإشغال اليومية خلال الشهر</p>
      <div className="h-64" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="densityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ background: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "hsl(210, 20%, 92%)", direction: "rtl" }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>يوم {d.day}</p>
                    <p>الكثافة: <span style={{ color: "hsl(160, 84%, 39%)" }}>{d.density}%</span></p>
                    <p>الزوار: <span style={{ color: "hsl(32, 95%, 55%)" }}>{d.visitors}</span></p>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="density" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fill="url(#densityGrad)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
