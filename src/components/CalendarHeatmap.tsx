import { VisitorRecord } from "@/lib/sheets";

interface CalendarHeatmapProps {
  data: VisitorRecord[];
  year: number;
  month: number;
  onDayClick: (record: VisitorRecord | null) => void;
  selectedDay: number | null;
}

function getDayBg(density: number, isClosed: boolean): string {
  if (isClosed) return "bg-muted/60 border-muted";
  if (density >= 0.7)
    return "bg-destructive border-destructive hover:bg-destructive";
  if (density >= 0.4) return "bg-accent border-accent hover:bg-accent";
  return "bg-primary border-primary hover:bg-primary";
}

function getDotColor(density: number, isClosed: boolean): string {
  if (isClosed) return "bg-muted-foreground/30";
  if (density >= 0.7) return "bg-destructive";
  if (density >= 0.4) return "bg-accent";
  return "bg-primary";
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

export function CalendarHeatmap({
  data,
  year,
  month,
  onDayClick,
  selectedDay,
}: CalendarHeatmapProps) {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startDow = firstDay.getDay();

  const dayMap = new Map<number, VisitorRecord>();
  data.forEach((r) => dayMap.set(r.day, r));

  const weekDays = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = `${ARABIC_MONTHS[month]} ${year}`;

  return (
    <div
      className="rounded-xl border border-border bg-card p-6 shadow-card"
      dir="rtl"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        {monthLabel} — خريطة الكثافة
      </h3>

      <div className="grid grid-cols-7 gap-1 mb-2" dir="ltr">
        {weekDays.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5" dir="ltr">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const record = dayMap.get(day);
          const isClosed = record?.isClosed ?? true;
          const density = record?.density ?? 0;
          const visitors = record?.visitors ?? 0;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => onDayClick(record || null)}
              className={`
                relative aspect-square rounded-lg border text-xs font-medium
                transition-all duration-200 flex flex-col items-center justify-center gap-0.5
                ${getDayBg(density, isClosed)}
                ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-105" : ""}
                ${isClosed ? "cursor-default" : "cursor-pointer hover:scale-105"}
              `}
            >
              <span className="text-[11px] font-semibold text-foreground">
                {day}
              </span>
              {!isClosed && (
                <span className="text-[9px] font-mono text-foreground">
                  {visitors}
                </span>
              )}
              {isClosed && (
                <span className="text-[8px] text-muted-foreground">مغلق</span>
              )}
              <div
                className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${getDotColor(density, isClosed)}`}
              />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        <Legend color="bg-primary" label="منخفضة" />
        <Legend color="bg-accent" label="متوسطة" />
        <Legend color="bg-destructive" label="مرتفعة" />
        <Legend color="bg-muted" label="مغلق" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-[10px] text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
}
