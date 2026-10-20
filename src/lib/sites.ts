export interface SiteConfig {
  id: string;
  sheetName: string;
  path: string;
  name: string;
  fullTitle: string;
  subtitle: string;
  logo: string;
}

import iconMakkah from "../../public/museum-logo-DLmHQUl0.png";

export const SITES: SiteConfig[] = [
  {
    id: "makkah",
    sheetName: "MKH",
    path: "/dashboard/makkah",
    name: "مكة المكرمة",
    fullTitle:
      "داشبورد تحليل زوار المتحف الدولي للسيرة النبوية بمكة المكرمة (أبراج الساعة)",
    subtitle: "تتبّع وتحليل بيانات الزوار مع تحديث تلقائي كل 24 ساعة",
    logo: iconMakkah,
  },
  {
    id: "madinah",
    sheetName: "MED",
    path: "/dashboard/madinah",
    name: "المدينة المنورة",
    fullTitle: "داشبورد تحليل زوار متحف السيرة النبوية بالمدينة المنورة",
    subtitle: "تتبّع وتحليل بيانات الزوار مع تحديث تلقائي كل 24 ساعة",
    logo: iconMakkah,
  },
];

export function getSiteById(id: string): SiteConfig | undefined {
  return SITES.find((s) => s.id === id);
}
