import { VisitorRecord } from "@/lib/sheets";
import { Users, UserPlus, Gauge, Activity, Clock, X } from "lucide-react";

interface DayDetailsPanelProps {
  record: VisitorRecord | null;
  onClose: () => void;
}

const ARABIC_MONTHS = [
  "",
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const ARABIC_DAYS = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export function DayDetailsPanel({ record, onClose }: DayDetailsPanelProps) {
  if (!record) return null;

  const densityPct = (record.density * 100).toFixed(1);
  const dateLabel = `${ARABIC_DAYS[record.date.getDay()]}، ${record.day} ${ARABIC_MONTHS[record.month]} ${record.year}`;

  const stats = [
    {
      icon: Users,
      label: "عدد الزوار",
      value: record.visitors.toLocaleString(),
      color: "text-secondary",
    },
    {
      icon: UserPlus,
      label: "زوار المجاملة",
      value: record.complimentaryVisitors.toLocaleString(),
      color: "text-accent",
    },
    {
      icon: Gauge,
      label: "السعة القصوى",
      value: record.capacity.toLocaleString(),
      color: "text-chart-blue",
    },
    {
      icon: Activity,
      label: "نسبة الكثافة",
      value: `${densityPct}%`,
      color: "text-destructive",
    },
    {
      icon: Clock,
      label: "ساعات العمل",
      value: record.isClosed
        ? "مغلق"
        : `${record.openTime} – ${record.closeTime}`,
      color: "text-chart-cyan",
    },
  ];

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            تفاصيل اليوم
          </h3>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {record.isClosed ? (
        <div className="text-center py-6 text-muted-foreground">
          <Gauge className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium">المتحف مغلق</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-background/50 rounded-lg p-3 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {s.label}
                  </span>
                </div>
                <p className="text-lg font-bold font-mono text-foreground">
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
