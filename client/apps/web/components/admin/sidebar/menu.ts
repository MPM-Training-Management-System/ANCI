import {
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardCheck,
  BookOpen,
  CalendarCheck,
  FileBarChart2,
  Settings,
} from "lucide-react";

import { SidebarSectionType } from "./types";

export const sidebarMenu: SidebarSectionType[] = [
  {
    title: "MAIN",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        title: "My Training",
        href: "/training",
        icon: UserRound,
      },
      {
        title: "Student Progress",
        href: "/student",
        icon: Users,
      },
      {
        title: "Attendance",
        href: "/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Assessment",
        href: "/assessment",
        icon: ClipboardCheck,
      },
      {
        title: "Learning Materials",
        href: "/learning",
        icon: BookOpen,
      },
    ],
  },
  {
    title: "REPORTS",
    items: [
      {
        title: "Reports",
        href: "/report",
        icon: FileBarChart2,
      },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      {
        title: "Settings",
        href: "/setting",
        icon: Settings,
      },
    ],
  },
];