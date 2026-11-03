import { useEffect, useRef, useState } from "react";
import {
  VisitorRecord,
  computeKPIs,
  filterByWeek,
  filterByMonth,
} from "@/lib/sheets";
import { Gauge, ChevronRight, ChevronLeft } from "lucide-react";

interface DensityGaugeProps {
  record: VisitorRecord | null;
  todayRecord: VisitorRecord | null;
  allData: VisitorRecord[];
  // المرجع المشترك مع فلتر الصفحة الرئيسي (MonthSelector) — بيخلي
  // الكالندر والجدول والجيدج كلهم عايزين نفس الشهر/الأسبوع بالظبط.
  filterYear: number;
  filterMonth: number;
  filterWeek: number;
  onPeriodChange: (
    type: "week" | "month",
    year: number,
    month: number,
    week?: number,
  ) => void;
}

type GaugePeriod = "day" | "week" | "month";

interface DayRef {
  year: number;
  month: number;
  day: number;
}

interface MonthRef {
  year: number;
  month: number;
}

function getWeekNumber(year: number, month: number, day: number): number {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  return Math.ceil((day + firstDayOfWeek) / 7);
}

function shiftWeek(ref: DayRef, deltaWeeks: number): DayRef {
  const d = new Date(ref.year, ref.month - 1, ref.day);
  d.setDate(d.getDate() + deltaWeeks * 7);
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function shiftMonth(ref: MonthRef, deltaMonths: number): MonthRef {
  const d = new Date(ref.year, ref.month - 1 + deltaMonths, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

// بيرجع يوم موجود فعلاً جوا الأسبوع رقم weekNumber في الشهر ده،
// عشان نقدر نستخدمه كمحور لحساب الأسبوع اللي قبله/بعده بدقة.
function pivotDayForWeek(year: number, month: number, weekNumber: number): DayRef {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  let day = (weekNumber - 1) * 7 - firstDayOfWeek + 1;
  if (day < 1) day = 1;
  if (day > daysInMonth) day = daysInMonth;
  return { year, month, day };
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
  filterYear,
  filterMonth,
  filterWeek,
  onPeriodChange,
}: DensityGaugeProps) {
  const [period, setPeriod] = useState<GaugePeriod>("day");

  const active = record || todayRecord;

  const [animatedPct, setAnimatedPct] = useState(0);
  const prevPct = useRef(0);

  const periodKpis =
    period === "week"
      ? computeKPIs(filterByWeek(allData, filterYear, filterMonth, filterWeek))
      : period === "month"
        ? computeKPIs(filterByMonth(allData, filterYear, filterMonth))
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
      ? `الأسبوع ${filterWeek} — ${ARABIC_MONTHS[filterMonth]} ${filterYear}`
      : `${ARABIC_MONTHS[filterMonth]} ${filterYear}`;

  const subtitle = isDay
    ? record
      ? "اليوم المحدد من التقويم"
      : "بيانات اليوم الحالي"
    : null;

  // اختيار يوم/أسبوع/شهر من هنا بيحدّث فلتر الصفحة نفسه (نفس اللي فوق
  // في MonthSelector)، عشان الكالندر والجدول وكروت الـ KPI كلهم يفضلوا
  // متزامنين مع اللي ظاهر في الجيدج بالظبط.
  const handlePeriodTab = (p: GaugePeriod) => {
    setPeriod(p);
    if (p === "week") {
      const week =
        active && active.year === filterYear && active.month === filterMonth
          ? getWeekNumber(filterYear, filterMonth, active.day)
          : filterWeek;
      onPeriodChange("week", filterYear, filterMonth, week);
    } else if (p === "month") {
      onPeriodChange("month", filterYear, filterMonth);
    }
  };

  const goPrev = () => {
    if (period === "week") {
      const pivot = pivotDayForWeek(filterYear, filterMonth, filterWeek);
      const shifted = shiftWeek(pivot, -1);
      const week = getWeekNumber(shifted.year, shifted.month, shifted.day);
      onPeriodChange("week", shifted.year, shifted.month, week);
    } else if (period === "month") {
      const shifted = shiftMonth({ year: filterYear, month: filterMonth }, -1);
      onPeriodChange("month", shifted.year, shifted.month);
    }
  };

  const goNext = () => {
    if (period === "week") {
      const pivot = pivotDayForWeek(filterYear, filterMonth, filterWeek);
      const shifted = shiftWeek(pivot, 1);
      const week = getWeekNumber(shifted.year, shifted.month, shifted.day);
      onPeriodChange("week", shifted.year, shifted.month, week);
    } else if (period === "month") {
      const shifted = shiftMonth({ year: filterYear, month: filterMonth }, 1);
      onPeriodChange("month", shifted.year, shifted.month);
    }
  };

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
              onClick={() => handlePeriodTab(p)}
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

      {isDay ? (
        <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={goPrev}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="الفترة السابقة"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-foreground min-w-[140px] text-center">
            {periodLabel}
          </span>
          <button
            onClick={goNext}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="الفترة التالية"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

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
