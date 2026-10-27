import { VISIBILITY } from "@/config/visibility";

const API_KEY = "AIzaSyDcsExaWkbH_2tmmsh9wav-S7AZNYVLNI4";

// نفس شيت التحكم المستخدم في نسخة مكة+المدينة، بس تبويب مستقل
// (MakkahOnly) عشان التحكم في النسخة دي يكون منفصل عن التانية.
const CONTROL_SHEET_ID = "1dY9NnmCsZM6uxOzDvwp0AVBCpVxmBrXOWi0F0YQfOe4";
const CONTROL_RANGE = "MakkahOnly!A2:B50";

export type VisibilityFlags = typeof VISIBILITY;

export function isControlConfigured(): boolean {
  return Boolean(CONTROL_SHEET_ID);
}

export function getControlSheetUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${CONTROL_SHEET_ID}/edit`;
}

export async function fetchVisibility(): Promise<VisibilityFlags> {
  if (!CONTROL_SHEET_ID) return VISIBILITY;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONTROL_SHEET_ID}/values/${CONTROL_RANGE}?key=${API_KEY}`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return VISIBILITY;

    const data = await response.json();
    const rows: string[][] = data.values || [];
    const flags = { ...VISIBILITY };

    rows.forEach(([key, value]) => {
      const trimmedKey = (key || "").trim();
      if (!trimmedKey || !(trimmedKey in flags)) return;
      const normalized = (value || "").toString().trim().toUpperCase();
      (flags as Record<string, boolean>)[trimmedKey] = normalized !== "FALSE";
    });

    return flags;
  } catch {
    return VISIBILITY;
  }
}
