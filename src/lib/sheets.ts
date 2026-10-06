const API_KEY = "AIzaSyDcsExaWkbH_2tmmsh9wav-S7AZNYVLNI4";
const SHEET_ID = "1aiRMZeQLCtabh9HHhlpygizSK_SzuJ1ig01USAsG9_0";
const DEFAULT_SHEET_NAME = "MKH";

/* 1QQIlX-cYTmuapGn5-HPHiuvxaxWoNBChxHJq4KVy2YI */

export interface VisitorRecord {
  date: Date;
  dateStr: string;
  status: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  visitors: number;
  complimentaryVisitors: number;
  capacity: number;
  density: number;
  year: number;
  month: number;
  day: number;
}

function cleanArabicDecimal(val: string): number {
  if (!val || typeof val !== "string") return 0;
  const cleaned = val.replace(/٫/g, ".").replace(/[^\d.\-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function isInvalidValue(val: string): boolean {
  if (!val) return true;
  const invalid = ["#DIV/0!", "#REF!", "#N/A", "#VALUE!", "#NAME?", "#NULL!"];
  return invalid.includes(val.trim());
}

function parseDate(val: string): Date | null {
  if (!val || isInvalidValue(val)) return null;
  // Try multiple date formats
  const parts = val.split(/[\/\-\.]/);
  if (parts.length === 3) {
    // Try M/D/YYYY or D/M/YYYY or YYYY-MM-DD
    let year: number, month: number, day: number;
    if (parts[0].length === 4) {
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
    } else {
      // Assume M/D/YYYY
      month = parseInt(parts[0]);
      day = parseInt(parts[1]);
      year = parseInt(parts[2]);
    }
    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && year > 2000) {
      return new Date(year, month - 1, day);
    }
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

export async function fetchSheetData(
  sheetName: string = DEFAULT_SHEET_NAME,
): Promise<VisitorRecord[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  const data = await response.json();
  const rows: string[][] = data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0];
  const records: VisitorRecord[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const dateVal = row[0];
    if (!dateVal || isInvalidValue(dateVal)) continue;
    const date = parseDate(dateVal);
    if (!date) continue;

    // Skip rows where essential columns (date, visitors, capacity) are invalid
    // But allow #REF! in non-essential columns like density level (col 8)
    if (isInvalidValue(row[4] || "") || isInvalidValue(row[6] || "")) continue;

    const status = (row[1] || "").trim();
    const isClosed = status === "مغلق";

    const record: VisitorRecord = {
      date,
      dateStr: dateVal,
      status,
      isClosed,
      openTime: row[2] || "",
      closeTime: row[3] || "",
      visitors: isClosed ? 0 : cleanArabicDecimal(row[4] || "0"),
      complimentaryVisitors: isClosed ? 0 : cleanArabicDecimal(row[5] || "0"),
      capacity: cleanArabicDecimal(row[6] || "0"),
      density: isClosed ? 0 : cleanArabicDecimal(row[7] || "0"),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };

    records.push(record);
  }

  return records;
}

export function getAvailableMonths(
  data: VisitorRecord[],
): { year: number; month: number; label: string }[] {
  const monthMap = new Map<string, { year: number; month: number }>();
  data.forEach((r) => {
    const key = `${r.year}-${r.month}`;
    if (!monthMap.has(key)) monthMap.set(key, { year: r.year, month: r.month });
  });
  const months = Array.from(monthMap.values()).sort(
    (a, b) => a.year - b.year || a.month - b.month,
  );
  return months.map((m) => ({
    ...m,
    label: new Date(m.year, m.month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    }),
  }));
}

export function filterByMonth(
  data: VisitorRecord[],
  year: number,
  month: number,
): VisitorRecord[] {
  return data.filter((r) => r.year === year && r.month === month);
}

export function computeKPIs(data: VisitorRecord[]) {
  const activeDays = data.filter((d) => !d.isClosed);
  const totalVisitors = activeDays.reduce((s, d) => s + d.visitors, 0);
  const totalComplimentary = activeDays.reduce(
    (s, d) => s + d.complimentaryVisitors,
    0,
  );
  const avgDensity =
    activeDays.length > 0
      ? activeDays.reduce((s, d) => s + d.density, 0) / activeDays.length
      : 0;
  const maxCapacity = Math.max(...data.map((d) => d.capacity), 0);
  const peakVisitors = Math.max(...activeDays.map((d) => d.visitors), 0);
  const avgVisitors =
    activeDays.length > 0 ? totalVisitors / activeDays.length : 0;

  return {
    totalVisitors,
    totalComplimentary,
    avgDensity,
    maxCapacity,
    peakVisitors,
    avgVisitors,
    activeDays: activeDays.length,
    totalDays: data.length,
  };
}

export function getDensityColor(density: number, isClosed: boolean): string {
  if (isClosed) return "bg-muted";
  if (density >= 0.7) return "bg-destructive";
  if (density >= 0.4) return "bg-accent";
  return "bg-primary";
}

export function getDensityLevel(density: number, isClosed: boolean): string {
  if (isClosed) return "Closed";
  if (density >= 0.7) return "High";
  if (density >= 0.4) return "Medium";
  return "Low";
}

// Add these functions to your existing sheets.ts file
export function filterByWeek(
  data: VisitorRecord[],
  year: number,
  month: number,
  weekNumber: number,
): VisitorRecord[] {
  // Get first day of month
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate start and end days for the selected week
  const startDay = (weekNumber - 1) * 7 - firstDayOfWeek + 1;
  const endDay = Math.min(startDay + 6, new Date(year, month, 0).getDate());

  // Filter data for the week range
  return data.filter(
    (record) =>
      record.year === year &&
      record.month === month &&
      record.day >= Math.max(1, startDay) &&
      record.day <= endDay,
  );
}

export function getAvailableYears(data: VisitorRecord[]): number[] {
  const years = new Set(data.map((r) => r.year));
  return Array.from(years).sort((a, b) => b - a);
}

export function filterByYear(data: VisitorRecord[], year: number): VisitorRecord[] {
  return data.filter((r) => r.year === year);
}

export function filterByDateRange(
  data: VisitorRecord[],
  startDate: Date,
  endDate: Date,
): VisitorRecord[] {
  // نحول التواريخ لأرقام مقارنة (YYYYMMDD) عشان نتجنب مشاكل timezone
  const startNum =
    startDate.getFullYear() * 10000 +
    (startDate.getMonth() + 1) * 100 +
    startDate.getDate();

  const endNum =
    endDate.getFullYear() * 10000 +
    (endDate.getMonth() + 1) * 100 +
    endDate.getDate();

  return data
    .filter((record) => {
      const recordNum = record.year * 10000 + record.month * 100 + record.day;
      return recordNum >= startNum && recordNum <= endNum;
    })
    .sort((a, b) => {
      // ترتيب تصاعدي حسب التاريخ
      const dateA = a.year * 10000 + a.month * 100 + a.day;
      const dateB = b.year * 10000 + b.month * 100 + b.day;
      return dateA - dateB;
    });
}
