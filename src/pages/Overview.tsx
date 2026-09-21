import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  Activity,
  TrendingUp,
  LogOut,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  fetchSheetData,
  getAvailableYears,
  filterByYear,
  computeKPIs,
  VisitorRecord,
} from "@/lib/sheets";
import { SITES, SiteConfig } from "@/lib/sites";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  SiteComparisonChart,
  MonthlyComparisonPoint,
} from "@/components/SiteComparisonChart";
import iconCenter from "../../public/museum-logo-DLmHQUl0.png";

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

interface SiteState {
  site: SiteConfig;
  data: VisitorRecord[];
  loading: boolean;
  error: string | null;
}

const Overview = () => {
  const navigate = useNavigate();
  const [siteStates, setSiteStates] = useState<SiteState[]>(
    SITES.map((site) => ({ site, data: [], loading: true, error: null })),
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    Promise.allSettled(
      SITES.map((site) => fetchSheetData(site.sheetName)),
    ).then((results) => {
      setSiteStates(
        results.map((result, idx) =>
          result.status === "fulfilled"
            ? { site: SITES[idx], data: result.value, loading: false, error: null }
            : {
                site: SITES[idx],
                data: [],
                loading: false,
                error: result.reason?.message ?? "خطأ غير متوقع",
              },
        ),
      );
      setLastUpdated(new Date());
    });
  }, []);

  const anyLoading = siteStates.some((s) => s.loading);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    siteStates.forEach((s) => getAvailableYears(s.data).forEach((y) => years.add(y)));
    return Array.from(years).sort((a, b) => b - a);
  }, [siteStates]);

  useEffect(() => {
    if (selectedYear === "all" && availableYears.length > 0) {
      const currentYear = new Date().getFullYear();
      setSelectedYear(
        availableYears.includes(currentYear) ? currentYear : availableYears[0],
      );
    }
  }, [availableYears]); // eslint-disable-line react-hooks/exhaustive-deps

  const yearFilteredStates = useMemo(
    () =>
      siteStates.map((s) => ({
        ...s,
        filtered:
          selectedYear === "all" ? s.data : filterByYear(s.data, selectedYear),
      })),
    [siteStates, selectedYear],
  );

  const combinedKpis = useMemo(() => {
    const combined = yearFilteredStates.flatMap((s) => s.filtered);
    return computeKPIs(combined);
  }, [yearFilteredStates]);

  const monthlyComparison = useMemo<MonthlyComparisonPoint[]>(() => {
    const map = new Map<string, MonthlyComparisonPoint>();
    yearFilteredStates.forEach(({ site, filtered }) => {
      filtered.forEach((r) => {
        if (r.isClosed) return;
        const key = `${r.year}-${r.month}`;
        const label =
          selectedYear === "all"
            ? `${ARABIC_MONTHS[r.month]} ${r.year}`
            : ARABIC_MONTHS[r.month];
        if (!map.has(key)) {
          map.set(key, { label });
        }
        const entry = map.get(key)!;
        entry[site.id] = ((entry[site.id] as number) || 0) + r.visitors;
      });
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        const [ay, am] = a.split("-").map(Number);
        const [by, bm] = b.split("-").map(Number);
        return ay - by || am - bm;
      })
      .map(([, v]) => v);
  }, [yearFilteredStates, selectedYear]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (anyLoading && siteStates.every((s) => s.data.length === 0)) {
    return <LoadingSkeleton />;
  }

  const summaryCards = [
    {
      key: "totalVisitors",
      label: "إجمالي الزوار (المتحفين)",
      icon: Users,
      gradient: "kpi-gradient-1",
      iconColor: "text-primary",
      value: combinedKpis.totalVisitors,
    },
    {
      key: "totalComplimentary",
      label: "إجمالي زوار المجاملة",
      icon: Users,
      gradient: "kpi-gradient-2",
      iconColor: "text-accent",
      value: combinedKpis.totalComplimentary,
    },
    {
      key: "avgDensity",
      label: "متوسط الكثافة",
      icon: Activity,
      gradient: "kpi-gradient-3",
      iconColor: "text-chart-blue",
      value: combinedKpis.avgDensity * 100,
      suffix: "%",
      decimals: 1,
    },
    {
      key: "peakVisitors",
      label: "أعلى عدد زوار في يوم واحد",
      icon: TrendingUp,
      gradient: "kpi-gradient-1",
      iconColor: "text-primary",
      value: combinedKpis.peakVisitors,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 shadow-lg p-3">
              <img
                src={iconCenter}
                className="w-full h-full object-contain rounded-full"
                alt="النظرة العامة"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                النظرة العامة على متاحف السيرة النبوية
              </h1>
              <p className="text-sm text-muted-foreground">
                ملخص شامل لإحصائيات الزوار في مكة المكرمة والمدينة المنورة
              </p>
              {lastUpdated && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  آخر تحديث للبيانات:{" "}
                  {lastUpdated.toLocaleDateString("ar-EG", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {lastUpdated.toLocaleTimeString("ar-EG", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative inline-block">
              <select
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value === "all" ? "all" : Number(e.target.value),
                  )
                }
                className="appearance-none bg-card border border-border rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[140px]"
              >
                <option value="all">كل الفترات</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    سنة {y}
                  </option>
                ))}
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">خروج</span>
            </button>
          </div>
        </header>

        {/* Combined KPI summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" dir="rtl">
          {summaryCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className={`${card.gradient} rounded-xl border border-border p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 animate-fade-in`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-background/50 ${card.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono text-2xl font-bold text-foreground tracking-tight">
                  <AnimatedNumber
                    value={card.value}
                    decimals={card.decimals ?? 0}
                    suffix={card.suffix ?? ""}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {card.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Monthly Comparison Chart */}
        {monthlyComparison.length > 0 && (
          <SiteComparisonChart data={monthlyComparison} sites={SITES} />
        )}

        {/* Site Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            المتاحف
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {yearFilteredStates.map(({ site, filtered, loading, error }) => {
              const kpis = computeKPIs(filtered);
              return (
                <button
                  key={site.id}
                  onClick={() => navigate(site.path)}
                  disabled={loading}
                  className="text-right rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 group disabled:opacity-60 disabled:cursor-wait"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30 p-2">
                        <img
                          src={site.logo}
                          className="w-full h-full object-contain rounded-full"
                          alt={site.name}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">
                          {site.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {loading
                            ? "جاري تحميل البيانات..."
                            : error
                              ? "تعذر تحميل البيانات"
                              : `${kpis.activeDays} يوم تشغيل`}
                        </p>
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                  </div>

                  {error ? (
                    <div className="flex items-center gap-2 text-sm text-destructive py-4">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <p className="font-mono text-lg font-bold text-foreground">
                          <AnimatedNumber value={kpis.totalVisitors} />
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          إجمالي الزوار
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <p className="font-mono text-lg font-bold text-foreground">
                          <AnimatedNumber value={kpis.peakVisitors} />
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          أعلى عدد زوار
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                        <p className="font-mono text-lg font-bold text-foreground">
                          <AnimatedNumber
                            value={kpis.avgDensity * 100}
                            decimals={1}
                            suffix="%"
                          />
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          متوسط الكثافة
                        </p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

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

export default Overview;
