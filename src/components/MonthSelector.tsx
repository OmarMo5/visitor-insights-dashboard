import {
  ChevronDown,
  CalendarRange,
  CalendarDays,
  Calendar,
} from "lucide-react";
import { useState, useRef } from "react";

export type DateFilterType = "month" | "week" | "range";
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface MonthSelectorProps {
  months: { year: number; month: number; label: string }[];
  selectedYear: number;
  selectedMonth: number;
  filterType: DateFilterType;
  selectedWeek?: number; // 1-4 or 5
  selectedRange?: DateRange;
  onChange: (
    type: DateFilterType,
    year: number,
    month: number,
    week?: number,
    range?: DateRange,
  ) => void;
}

export function MonthSelector({
  months,
  selectedYear,
  selectedMonth,
  filterType,
  selectedWeek,
  selectedRange,
  onChange,
}: MonthSelectorProps) {
  const [localFilterType, setLocalFilterType] =
    useState<DateFilterType>(filterType);
  const [localWeek, setLocalWeek] = useState<number>(selectedWeek || 1);
  const [localRange, setLocalRange] = useState<DateRange>(
    selectedRange || { startDate: null, endDate: null },
  );

  // Refs for date inputs
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const currentMonth = months.find(
    (m) => m.year === selectedYear && m.month === selectedMonth,
  );

  // Generate weeks for selected month
  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const weeks = Math.ceil((daysInMonth + firstDay.getDay()) / 7);
    return Math.min(weeks, 5); // Max 5 weeks per month
  };

  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth);
  const weeks = Array.from({ length: weeksInMonth }, (_, i) => i + 1);

  // Get week range string
  const getWeekRange = (weekNum: number) => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const startDay = (weekNum - 1) * 7 - firstDay.getDay() + 1;
    const endDay = Math.min(
      startDay + 6,
      new Date(selectedYear, selectedMonth, 0).getDate(),
    );

    const start = new Date(
      selectedYear,
      selectedMonth - 1,
      Math.max(1, startDay),
    );
    const end = new Date(selectedYear, selectedMonth - 1, endDay);

    return `${start.getDate()} - ${end.getDate()} ${currentMonth?.label.split(" ")[0]}`;
  };

  const handleTypeChange = (type: DateFilterType) => {
    setLocalFilterType(type);
    if (type === "month") {
      onChange(type, selectedYear, selectedMonth);
    } else if (type === "week") {
      onChange(type, selectedYear, selectedMonth, localWeek);
    } else if (type === "range") {
      onChange(type, selectedYear, selectedMonth, undefined, localRange);
    }
  };

  // Helper function to format date for display
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value ? new Date(e.target.value) : null;
    const newRange = {
      ...localRange,
      startDate: newStartDate,
    };
    setLocalRange(newRange);

    // Auto-update end date if start date is after end date
    if (
      newStartDate &&
      localRange.endDate &&
      newStartDate > localRange.endDate
    ) {
      const adjustedRange = {
        ...newRange,
        endDate: newStartDate,
      };
      setLocalRange(adjustedRange);
      onChange("range", selectedYear, selectedMonth, undefined, adjustedRange);
    } else {
      onChange("range", selectedYear, selectedMonth, undefined, newRange);
    }
  };

  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value ? new Date(e.target.value) : null;
    const newRange = {
      ...localRange,
      endDate: newEndDate,
    };
    setLocalRange(newRange);
    onChange("range", selectedYear, selectedMonth, undefined, newRange);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Filter Type Toggle */}
      <div className="flex bg-card border border-border rounded-lg p-1">
        <button
          onClick={() => handleTypeChange("month")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            localFilterType === "month"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>شهر</span>
        </button>
        <button
          onClick={() => handleTypeChange("week")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            localFilterType === "week"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>أسبوع</span>
        </button>
        <button
          onClick={() => handleTypeChange("range")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            localFilterType === "range"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-card-hover"
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>نطاق</span>
        </button>
      </div>

      {/* Month Selector */}
      <div className="relative inline-block">
        <select
          value={`${selectedYear}-${selectedMonth}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split("-").map(Number);
            if (localFilterType === "month") {
              onChange(localFilterType, y, m);
            } else if (localFilterType === "week") {
              onChange(localFilterType, y, m, localWeek);
            } else {
              onChange(localFilterType, y, m, undefined, localRange);
            }
          }}
          className="appearance-none bg-card border border-border rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[140px]"
        >
          {months.map((m) => (
            <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Week Selector - Shows only when week filter is active */}
      {localFilterType === "week" && (
        <div className="relative inline-block">
          <select
            value={localWeek}
            onChange={(e) => {
              const week = Number(e.target.value);
              setLocalWeek(week);
              onChange("week", selectedYear, selectedMonth, week);
            }}
            className="appearance-none bg-card border border-border rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[120px]"
          >
            {weeks.map((week) => (
              <option key={week} value={week}>
                الأسبوع {week} ({getWeekRange(week)})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      )}

      {/* Range Picker - Shows only when range filter is active */}
      {localFilterType === "range" && (
        <div className="flex gap-2 items-center">
          <div className="relative">
            <input
              ref={startDateRef}
              type="date"
              value={formatDateForInput(localRange.startDate)}
              onChange={handleStartDateChange}
              onClick={() => startDateRef.current?.showPicker()}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer w-[140px] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
              placeholder="من"
            />
          </div>
          <span className="text-muted-foreground text-sm">إلى</span>
          <div className="relative">
            <input
              ref={endDateRef}
              type="date"
              value={formatDateForInput(localRange.endDate)}
              onChange={handleEndDateChange}
              onClick={() => endDateRef.current?.showPicker()}
              className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer w-[140px] [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
              placeholder="إلى"
            />
          </div>
        </div>
      )}
    </div>
  );
}
