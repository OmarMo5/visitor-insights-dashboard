import { useState, useMemo } from "react";
import { VisitorRecord } from "@/lib/sheets";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DataTableProps {
  data: VisitorRecord[];
}

type SortKey =
  | "day"
  | "visitors"
  | "complimentaryVisitors"
  | "capacity"
  | "density";
type SortDir = "asc" | "desc";

const ROWS_PER_PAGE = 10;

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

function densityPct(r: VisitorRecord): number {
  if (r.isClosed || !r.capacity || r.capacity <= 0) return 0;
  return Math.min(100, Math.round((r.visitors / r.capacity) * 100));
}

function densityBadgeClass(pct: number): string {
  if (pct >= 70) return "bg-destructive/15 text-destructive";
  if (pct >= 40) return "bg-accent/15 text-accent";
  return "bg-primary/15 text-secondary";
}

export function DataTable({ data }: DataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("day");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "density") {
        av = densityPct(a);
        bv = densityPct(b);
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = sorted.slice(
    safePage * ROWS_PER_PAGE,
    (safePage + 1) * ROWS_PER_PAGE,
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col)
      return (
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
      );
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-secondary" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-secondary" />
    );
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "day", label: "التاريخ" },
    { key: "visitors", label: "عدد الزوار" },
    { key: "complimentaryVisitors", label: "زوار المجاملة" },
    { key: "capacity", label: "السعة" },
    { key: "density", label: "نسبة الكثافة" },
  ];

  return (
    <div
      className="rounded-xl border border-border bg-card shadow-card animate-fade-in"
      dir="rtl"
    >
      <div className="p-5 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">سجل البيانات</h3>
        <p className="text-xs text-muted-foreground mt-1">
          عرض تفصيلي لبيانات الزوار خلال الشهر
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer select-none text-right whitespace-nowrap"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((r, i) => {
                const pct = densityPct(r);
                return (
                  <TableRow key={i} className="transition-colors">
                    <TableCell className="font-mono text-sm">
                      {r.day} {ARABIC_MONTHS[r.month]} {r.year}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {r.isClosed ? (
                        <span className="text-muted-foreground">مغلق</span>
                      ) : (
                        r.visitors.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {r.isClosed
                        ? "—"
                        : r.complimentaryVisitors.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {r.capacity.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {r.isClosed ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          مغلق
                        </span>
                      ) : (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${densityBadgeClass(pct)}`}
                        >
                          {pct}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-border text-sm">
        <span className="text-muted-foreground">
          صفحة {safePage + 1} من {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(0, Math.min(safePage - 2, totalPages - 5));
            const pageNum = start + i;
            if (pageNum >= totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                  pageNum === safePage
                    ? "bg-primary text-secondary-foreground"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="p-1.5 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
