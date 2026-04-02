import {
  Users,
  UserPlus,
  Activity,
  Gauge,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";

interface KPICardsProps {
  totalVisitors: number;
  totalComplimentary: number;
  avgDensity: number;
  maxCapacity: number;
  peakVisitors: number;
  avgVisitors: number;
}

const cards = [
  {
    key: "totalVisitors",
    label: "إجمالي الزوار",
    icon: Users,
    gradient: "kpi-gradient-1",
    iconColor: "text-primary",
  },
  {
    key: "totalComplimentary",
    label: "زوار المجاملة",
    icon: UserPlus,
    gradient: "kpi-gradient-2",
    iconColor: "text-accent",
  },
  {
    key: "avgDensity",
    label: "متوسط الكثافة",
    icon: Activity,
    gradient: "kpi-gradient-3",
    iconColor: "text-chart-blue",
    suffix: "%",
    decimals: 1,
    multiplier: 100,
  },
  /*   { key: "maxCapacity", label: "السعة القصوى", icon: Gauge, gradient: "kpi-gradient-4", iconColor: "text-destructive" },*/
  {
    key: "peakVisitors",
    label: "أعلى عدد زوار",
    icon: TrendingUp,
    gradient: "kpi-gradient-1",
    iconColor: "text-primary",
  },
  /* { key: "avgVisitors", label: "متوسط الزوار اليومي", icon: BarChart3, gradient: "kpi-gradient-2", iconColor: "text-accent" }, */
] as const;

export function KPICards(props: KPICardsProps) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      dir="rtl"
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        const raw = props[card.key as keyof KPICardsProps];
        const value =
          "multiplier" in card && card.multiplier ? raw * card.multiplier : raw;
        return (
          <div
            key={card.key}
            className={`${card.gradient} rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in`}
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-lg bg-background/50 ${card.iconColor}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="font-mono text-2xl font-bold text-foreground tracking-tight">
              <AnimatedNumber
                value={value}
                decimals={"decimals" in card ? (card.decimals ?? 0) : 0}
                suffix={"suffix" in card ? (card.suffix ?? "") : ""}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {card.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
