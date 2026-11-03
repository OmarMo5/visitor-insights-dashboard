import { VisitorRecord } from "@/lib/sheets";
import { Users, UserPlus, Gauge, Clock, X } from "lucide-react";
import { getGaugeColor, getLevelArabic } from "@/components/DensityGauge";

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
      icon: Clock,
      label: "ساعات العمل",
      value: record.isClosed
        ? "مغلق"
        : `${record.openTime} – ${record.closeTime}`,
      color: "text-chart-cyan",
    },
  ];

  // رسمة دائرية واضحة لنسبة كثافة اليوم المحدد، بنفس منطق ألوان الجيدج
  // الرئيسي عشان تفضل متسقة بصريًا في كل الداشبورد.
  const pct = record.isClosed ? 0 : Math.round(record.density * 100);
  const { main } = getGaugeColor(pct);
  const ringR = 46;
  const circumference = 2 * Math.PI * ringR;
  const dashOffset = circumference - (pct / 100) * circumference;

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
        <>
          <div className="flex justify-center mb-4">
            <svg width="130" height="130" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={ringR}
                fill="none"
                stroke="hsl(220, 14%, 18%)"
                strokeWidth="12"
              />
              <circle
                cx="60"
                cy="60"
                r={ringR}
                fill="none"
                stroke={main}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
              <text
                x="60"
                y="56"
                textAnchor="middle"
                fill={main}
                fontSize="26"
                fontWeight="800"
              >
                {pct}%
              </text>
              <text x="60" y="76" textAnchor="middle" fill="#999" fontSize="11">
                {getLevelArabic(pct, record.isClosed)}
              </text>
            </svg>
          </div>

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
        </>
      )}
    </div>
  );
}
