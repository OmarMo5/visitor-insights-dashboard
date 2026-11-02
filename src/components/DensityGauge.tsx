import { useEffect, useRef, useState } from "react";
import {
  VisitorRecord,
  computeKPIs,
  filterByWeek,
  filterByMonth,
} from "@/lib/sheets";
import { Gauge } from "lucide-react";

interface DensityGaugeProps {
  record: VisitorRecord | null;
  todayRecord: VisitorRecord | null;
  allData: VisitorRecord[];
}

type GaugePeriod = "day" | "week" | "month";

function getWeekNumber(year: number, month: number, day: number): number {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  return Math.ceil((day + firstDayOfWeek) / 7);
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

const PERIOD_LABELS: Record<GaugePeriod, string> = {
  day: "يوم",
  week: "أسبوع",
  month: "شهر",
};

function getGaugeColor(pct: number) {
  if (pct <= 40) return { main: "hsl(160, 84%, 39%)" };
  if (pct <= 70) return { main: "hsl(32, 95%, 55%)" };
  return { main: "hsl(0, 72%, 51%)" };
}

function getLevelArabic(pct: number, isClosed: boolean) {
  if (isClosed) return "مغلق";
  if (pct <= 40) return "منخفضة";
  if (pct <= 70) return "متوسطة";
  return "مرتفعة";
}

export function DensityGauge({
  record,
  todayRecord,
  allData,
}: DensityGaugeProps) {
  const [period, setPeriod] = useState<GaugePeriod>("day");

  const active = record || todayRecord;

  const [animatedPct, setAnimatedPct] = useState(0);
  const prevPct = useRef(0);

  const now = new Date();
  const refYear = active?.year ?? now.getFullYear();
  const refMonth = active?.month ?? now.getMonth() + 1;
  const refDay = active?.day ?? now.getDate();

  const weekNumber = getWeekNumber(refYear, refMonth, refDay);

  const periodKpis =
    period === "week"
      ? computeKPIs(filterByWeek(allData, refYear, refMonth, weekNumber))
      : period === "month"
        ? computeKPIs(filterByMonth(allData, refYear, refMonth))
        : null;

  const isDay = period === "day";
  const isClosed = isDay ? (active?.isClosed ?? true) : false;

  const dayCapacity =
    active?.capacity && active.capacity > 0 ? active.capacity : 300;
  const dayVisitors = active?.visitors ?? 0;

  const targetPct = isDay
    ? isClosed || dayCapacity === 0
      ? 0
      : Math.min(100, Math.round((dayVisitors / dayCapacity) * 100))
    : Math.round((periodKpis?.avgDensity ?? 0) * 100);

  useEffect(() => {
    const start = prevPct.current;
    const end = targetPct;

    const duration = 800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedPct(Math.round(start + (end - start) * eased));

      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
    prevPct.current = targetPct;
  }, [targetPct]);

  const { main } = getGaugeColor(animatedPct);

  // Geometry

  const cx = 140;
  const cy = 130;
  const r = 100;

  const startAngle = Math.PI;
  const endAngle = 0;

  const currentAngle = startAngle - (animatedPct / 100) * Math.PI;

  // background arc

  const startX = cx + r * Math.cos(startAngle);
  const startY = cy - r * Math.sin(startAngle);

  const endX = cx + r * Math.cos(endAngle);
  const endY = cy - r * Math.sin(endAngle);

  const bgPath = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;

  // progress arc

  const pX = cx + r * Math.cos(currentAngle);
  const pY = cy - r * Math.sin(currentAngle);

  const filledPath =
    animatedPct > 0
      ? `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${pX} ${pY}`
      : "";

  // needle

  const needleLen = r - 15;

  const nX = cx + needleLen * Math.cos(currentAngle);
  const nY = cy - needleLen * Math.sin(currentAngle);

  const dayDateLabel = active
    ? `${active.day} ${ARABIC_MONTHS[active.month]} ${active.year}`
    : "—";

  const periodLabel =
    period === "week"
      ? `الأسبوع ${weekNumber} — ${ARABIC_MONTHS[refMonth]} ${refYear}`
      : `${ARABIC_MONTHS[refMonth]} ${refYear}`;

  const subtitle = isDay
    ? record
      ? "اليوم المحدد من التقويم"
      : "بيانات اليوم الحالي"
    : period === "week"
      ? "متوسط الأسبوع المحدد"
      : "متوسط الشهر الحالي";

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in"
      dir="rtl"
    >
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Gauge className="w-5 h-5 text-secondary" />
          كثافة الزوار
        </h3>

        <div className="flex bg-background border border-border rounded-lg p-0.5">
          {(Object.keys(PERIOD_LABELS) as GaugePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                period === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>

      <div className="flex justify-center">
        <svg width="280" height="160" viewBox="0 0 280 160">
          <path
            d={bgPath}
            fill="none"
            stroke="hsl(220, 14%, 18%)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {filledPath && (
            <path
              d={filledPath}
              fill="none"
              stroke={main}
              strokeWidth="16"
              strokeLinecap="round"
            />
          )}

          {/* needle */}

          <line
            x1={cx}
            y1={cy}
            x2={nX}
            y2={nY}
            stroke={main}
            strokeWidth="3"
            strokeLinecap="round"
          />

          <circle cx={cx} cy={cy} r="6" fill={main} />

          {/* percent */}

          <text
            x={cx}
            y={cy - 20}
            textAnchor="middle"
            fill={main}
            fontSize="36"
            fontWeight="800"
          >
            {animatedPct}%
          </text>

          <text
            x={cx}
            y={cy + 20}
            textAnchor="middle"
            fill="#999"
            fontSize="12"
          >
            {getLevelArabic(animatedPct, isClosed)}
          </text>
        </svg>
      </div>

      {/* stats */}

      {isDay ? (
        <div className="space-y-2.5 mt-2 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span>اليوم المختار</span>
            <span className="font-mono">{dayDateLabel}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>عدد الزوار</span>
            <span className="font-bold font-mono">
              {isClosed ? "مغلق" : dayVisitors.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>السعة القصوى</span>
            <span className="font-mono">{dayCapacity}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>نسبة الكثافة</span>
            <span style={{ color: main }} className="font-bold font-mono">
              {isClosed ? "—" : `${targetPct}%`}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 mt-2 pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span>الفترة</span>
            <span className="font-mono">{periodLabel}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>إجمالي الزوار</span>
            <span className="font-bold font-mono">
              {(periodKpis?.totalVisitors ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>أعلى عدد زوار في يوم</span>
            <span className="font-mono">
              {(periodKpis?.peakVisitors ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>متوسط الكثافة</span>
            <span style={{ color: main }} className="font-bold font-mono">
              {targetPct}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
