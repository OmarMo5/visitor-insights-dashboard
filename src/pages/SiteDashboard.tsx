import { useState, useEffect, useMemo } from "react";
import {
  fetchSheetData,
  getAvailableMonths,
  filterByMonth,
  filterByWeek,
  filterByDateRange,
  computeKPIs,
  VisitorRecord,
} from "@/lib/sheets";
import { SiteConfig } from "@/lib/sites";
import { KPICards } from "@/components/KPICards";
import { CalendarHeatmap } from "@/components/CalendarHeatmap";
import { DayDetailsPanel } from "@/components/DayDetailsPanel";
import { DensityChart } from "@/components/DensityChart";
import { DensityGauge } from "@/components/DensityGauge";
import { VisitorChart } from "@/components/VisitorChart";
import {
  MonthSelector,
  DateFilterType,
  DateRange,
} from "@/components/MonthSelector";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { DataTable } from "@/components/DataTable";
import { AlertCircle, LogOut, ArrowRight, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SiteDashboardProps {
  site: SiteConfig;
}

const SiteDashboard = ({ site }: SiteDashboardProps) => {
  const [allData, setAllData] = useState<VisitorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [filterType, setFilterType] = useState<DateFilterType>("month");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [selectedRecord, setSelectedRecord] = useState<VisitorRecord | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedRecord(null);

    fetchSheetData(site.sheetName)
      .then((data) => {
        setAllData(data);

        if (data.length > 0) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;

          const hasCurrentMonth = data.some(
            (record) =>
              record.year === currentYear && record.month === currentMonth,
          );

          if (hasCurrentMonth) {
            setSelectedYear(currentYear);
            setSelectedMonth(currentMonth);
          } else {
            const latest = data[data.length - 1];
            setSelectedYear(latest.year);
            setSelectedMonth(latest.month);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [site.sheetName]);

  const months = useMemo(() => getAvailableMonths(allData), [allData]);

  const filteredData = useMemo(() => {
    switch (filterType) {
      case "month":
        return filterByMonth(allData, selectedYear, selectedMonth);
      case "week":
        return filterByWeek(allData, selectedYear, selectedMonth, selectedWeek);
      case "range":
        if (selectedRange.startDate && selectedRange.endDate) {
          return filterByDateRange(
            allData,
            selectedRange.startDate,
            selectedRange.endDate,
          );
        }
        return filterByMonth(allData, selectedYear, selectedMonth);
      default:
        return filterByMonth(allData, selectedYear, selectedMonth);
    }
  }, [
    allData,
    selectedYear,
    selectedMonth,
    selectedWeek,
    selectedRange,
    filterType,
  ]);

  const kpis = useMemo(() => computeKPIs(filteredData), [filteredData]);

  const todayRecord = useMemo(() => {
    const now = new Date();
    return (
      allData.find(
        (r) =>
          r.year === now.getFullYear() &&
          r.month === now.getMonth() + 1 &&
          r.day === now.getDate(),
      ) ||
      filteredData[filteredData.length - 1] ||
      null
    );
  }, [allData, filteredData]);

  const handleDateChange = (
    type: DateFilterType,
    year: number,
    month: number,
    week?: number,
    range?: DateRange,
  ) => {
    setFilterType(type);
    setSelectedYear(year);
    setSelectedMonth(month);
    if (week !== undefined) {
      setSelectedWeek(week);
    }
    if (range) {
      setSelectedRange(range);
    }
    setSelectedRecord(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold text-foreground">
            فشل تحميل البيانات
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 shadow-lg p-3">
                <img
                  src={site.logo}
                  className="w-full h-full object-contain rounded-full"
                  alt={site.name}
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {site.fullTitle}
              </h1>
              <p className="text-sm text-muted-foreground">{site.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <MonthSelector
              months={months}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              filterType={filterType}
              selectedWeek={selectedWeek}
              selectedRange={selectedRange}
              onChange={handleDateChange}
            />
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:bg-card-hover text-foreground transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">النظرة العامة</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">خروج</span>
            </button>
          </div>
        </header>

        {/* Filter Info Banner */}
        {filterType !== "month" && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-sm text-primary-foreground/120">
            <span className="font-medium">عرض البيانات:</span>{" "}
            {filterType === "week" &&
              `الأسبوع ${selectedWeek} من ${months.find((m) => m.year === selectedYear && m.month === selectedMonth)?.label}`}
            {filterType === "range" &&
              selectedRange.startDate &&
              selectedRange.endDate &&
              `من ${selectedRange.startDate.toLocaleDateString("ar-EG")} إلى ${selectedRange.endDate.toLocaleDateString("ar-EG")}`}
          </div>
        )}

        {/* KPI Cards */}
        <KPICards {...kpis} />

        {/* Density Trend Chart */}
        <DensityChart data={filteredData} />

        {/* Calendar + Gauge + Details Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <CalendarHeatmap
              data={filteredData}
              year={selectedYear}
              month={selectedMonth}
              onDayClick={setSelectedRecord}
              selectedDay={selectedRecord?.day ?? null}
            />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <DensityGauge record={selectedRecord} todayRecord={todayRecord} />
            {selectedRecord && (
              <DayDetailsPanel
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
              />
            )}
          </div>
        </div>

        {/* Visitor Chart */}
        <VisitorChart data={filteredData} />

        {/* Data Table */}
        <DataTable data={filteredData} />

        {/* Footer */}
        <footer className="text-center py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            مصدر البيانات: Google Sheets • تحديث في الوقت الفعلي
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SiteDashboard;
