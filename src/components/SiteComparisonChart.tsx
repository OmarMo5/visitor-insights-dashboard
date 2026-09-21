import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SiteConfig } from "@/lib/sites";

export interface MonthlyComparisonPoint {
  label: string;
  [siteId: string]: number | string;
}

interface SiteComparisonChartProps {
  data: MonthlyComparisonPoint[];
  sites: SiteConfig[];
}

const SITE_COLORS = ["hsl(160, 84%, 39%)", "hsl(32, 95%, 55%)"];

export function SiteComparisonChart({ data, sites }: SiteComparisonChartProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card" dir="rtl">
      <h3 className="text-lg font-semibold text-foreground mb-1">
        مقارنة الزوار بين المتحفين
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        إجمالي الزوار شهريًا في كل متحف
      </p>
      <div className="h-72" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 18%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210, 20%, 92%)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215, 12%, 50%)" }} />
            {sites.map((site, i) => (
              <Bar
                key={site.id}
                dataKey={site.id}
                name={site.name}
                fill={SITE_COLORS[i % SITE_COLORS.length]}
                radius={[3, 3, 0, 0]}
                animationDuration={800}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
