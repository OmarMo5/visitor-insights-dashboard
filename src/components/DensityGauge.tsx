import { useEffect, useRef, useState } from "react";
import { VisitorRecord } from "@/lib/sheets";
import { Users, Gauge, CalendarDays } from "lucide-react";

interface DensityGaugeProps {
  record: VisitorRecord | null;
  todayRecord: VisitorRecord | null;
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

export function DensityGauge({ record, todayRecord }: DensityGaugeProps) {
  const active = record || todayRecord;

  const [animatedPct, setAnimatedPct] = useState(0);
  const prevPct = useRef(0);

  const isClosed = active?.isClosed ?? true;
  const visitors = active?.visitors ?? 0;
  const capacity =
    active?.capacity && active.capacity > 0 ? active.capacity : 300;

  const targetPct =
    isClosed || capacity === 0
      ? 0
      : Math.min(100, Math.round((visitors / capacity) * 100));

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

  const dateLabel = active
    ? `${active.day} ${ARABIC_MONTHS[active.month]} ${active.year}`
    : "—";

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in"
      dir="rtl"
    >
      <h3 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <Gauge className="w-5 h-5 text-secondary" />
        كثافة الزوار
      </h3>

      <p className="text-xs text-muted-foreground mb-4">
        {record ? "اليوم المحدد من التقويم" : "بيانات اليوم الحالي"}
      </p>

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

      <div className="space-y-2.5 mt-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span>اليوم المختار</span>
          <span className="font-mono">{dateLabel}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>عدد الزوار</span>
          <span className="font-bold font-mono">
            {isClosed ? "مغلق" : visitors.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>السعة القصوى</span>
          <span className="font-mono">{capacity}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>نسبة الكثافة</span>
          <span style={{ color: main }} className="font-bold font-mono">
            {isClosed ? "—" : `${targetPct}%`}
          </span>
        </div>
      </div>
    </div>
  );
}
