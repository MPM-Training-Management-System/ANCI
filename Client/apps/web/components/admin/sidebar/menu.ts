import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  GraduationCap,
  UserRound,
  ClipboardCheck,
  FileBarChart2,
  CalendarDays,
  Megaphone,
  Bell,
  MessageSquare,
  Settings,
  BookOpen,
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
        title: "Grading",
        href: "/grading",
        icon: BriefcaseBusiness,
      },
       {
        title: "Attendance",
        href: "/attendance",
        icon: BriefcaseBusiness,
      },
      
      {
        title: "Exam Result",
        href: "/exam",
        icon: ClipboardCheck,
      },
      {
        title: "Learning Materials",
        href: "/learning",
        icon: BookOpen,
      },
      {
        title: "Assessment",
        href: "/assessment",
        icon: CalendarDays,
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