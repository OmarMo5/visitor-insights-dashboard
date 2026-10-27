import { useState } from "react";
import {
  fetchVisibility,
  isControlConfigured,
  getControlSheetUrl,
  VisibilityFlags,
} from "@/lib/remote-visibility";

const ACCESS_CODE = "OmarOnlyAdmin";

const LABELS: Record<keyof VisibilityFlags, string> = {
  loginPage: "صفحة تسجيل الدخول",
  dateFilter: "فلتر التاريخ (شهر/أسبوع/نطاق)",
  kpiCards: "كروت الـ KPI الأربعة",
  calendarHeatmap: "الكالندر (خريطة الكثافة)",
  detailsSection: "تفاصيل اليوم + الجدول + الرسمين البيانيين",
};

const VisibilityStatus = () => {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [flags, setFlags] = useState<VisibilityFlags | null>(null);
  const [checking, setChecking] = useState(false);

  const refresh = async () => {
    setChecking(true);
    setFlags(await fetchVisibility());
    setChecking(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      setUnlocked(true);
      if (isControlConfigured()) refresh();
    }
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <form onSubmit={handleUnlock} className="w-full max-w-xs">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
            className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </form>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex items-center justify-center p-6"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 space-y-5 shadow-card">
        <h1 className="text-lg font-bold text-foreground">
          حالة إظهار/إخفاء الداشبورد (مكة فقط)
        </h1>

        {!isControlConfigured() ? (
          <div className="space-y-2 text-sm text-muted-foreground bg-background/50 rounded-lg p-4 border border-border/50">
            <p className="font-medium text-foreground">
              لسه محتاج تحط الـ Sheet ID بتاعك في:
            </p>
            <code className="text-xs block bg-background rounded px-2 py-1">
              src/lib/remote-visibility.ts → CONTROL_SHEET_ID
            </code>
            <p className="text-[11px] text-muted-foreground/70 pt-1">
              لحد ما تعمل كده، الموقع شغال بالقيم الافتراضية في الكود (كله
              ظاهر) — مفيش أي تأثير على الداشبورد الحالي.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {flags ? (
                Object.entries(LABELS).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between bg-background/50 rounded-lg px-3 py-2 border border-border/50 text-sm"
                  >
                    <span className="text-foreground">{label}</span>
                    <span
                      className={
                        flags[key as keyof VisibilityFlags]
                          ? "text-primary font-semibold"
                          : "text-destructive font-semibold"
                      }
                    >
                      {flags[key as keyof VisibilityFlags] ? "🟢 ظاهر" : "🔴 مخفي"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  جاري التحقق...
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground bg-background/50 rounded-lg p-3 border border-border/50">
              عشان تغيّر أي حاجة: افتح الشيت، في تبويب makkah غيّر قيمة
              الصف المناسب لـ TRUE أو FALSE، وارجع هنا واضغط "تحديث".
              التغيير بيوصل لكل زوار الموقع خلال ثواني.
            </div>

            <div className="flex gap-2">
              <a
                href={getControlSheetUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
              >
                افتح الشيت
              </a>
              <button
                onClick={refresh}
                disabled={checking}
                className="flex-1 px-3 py-2 rounded-lg bg-card border border-border hover:bg-card-hover text-foreground text-sm font-medium transition-colors disabled:opacity-60"
              >
                {checking ? "جاري التحديث..." : "تحديث الحالة"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisibilityStatus;
