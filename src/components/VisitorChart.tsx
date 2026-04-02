import { VisitorRecord } from "@/lib/sheets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface VisitorChartProps {
  data: VisitorRecord[];
}

export function VisitorChart({ data }: VisitorChartProps) {
  const chartData = data
    .sort((a, b) => a.day - b.day)
    .map(d => ({
      day: d.day,
      الزوار: d.isClosed ? 0 : d.visitors,
      المجاملة: d.isClosed ? 0 : d.complimentaryVisitors,
      السعة: d.capacity,
    }));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card" dir="rtl">
      <h3 className="text-lg font-semibold text-foreground mb-1">الزوار مقابل السعة</h3>
      <p className="text-xs text-muted-foreground mb-4">حجم الزوار اليومي مقارنة بالسعة القصوى</p>
      <div className="h-64" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210, 20%, 92%)",
              }}
              labelFormatter={(l) => `يوم ${l}`}
            />
            <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 12%, 50%)" }} />
            <Bar dataKey="السعة" fill="hsl(220, 14%, 22%)" radius={[2, 2, 0, 0]} animationDuration={800} />
            <Bar dataKey="الزوار" fill="hsl(160, 84%, 39%)" radius={[2, 2, 0, 0]} animationDuration={800} />
            <Bar dataKey="المجاملة" fill="hsl(32, 95%, 55%)" radius={[2, 2, 0, 0]} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
