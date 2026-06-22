import {
  LayoutDashboard,
  ListChecks,
  CalendarClock,
  PlusSquare,
  Timer,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  feature: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, feature: "#1 สุขภาพ Sprint" },
  { href: "/create", label: "สร้างงาน", icon: PlusSquare, feature: "#2 Story/Sub-task" },
  { href: "/task", label: "ทำงาน", icon: ListChecks, feature: "#3 คลิกเดียวปิดงาน" },
  { href: "/worklog", label: "ลงเวลา", icon: Timer, feature: "#4 Worklog" },
  { href: "/daily", label: "สรุปรายวัน", icon: CalendarClock, feature: "#5 ครบ 8 ชม.?" },
];
