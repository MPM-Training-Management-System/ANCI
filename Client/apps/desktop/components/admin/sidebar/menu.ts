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
        title: "User",
        href: "/user",
        icon: UserRound,
      },
      {
        title: "Training",
        href: "/training",
        icon: Users,
      },
      {
        title: "Attendance",
        href: "/attendance",
        icon: BriefcaseBusiness,
      },
       {
        title: "Assessmenet",
        href: "/assessment",
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
        title: "Schedules",
        href: "/schedule",
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
    title: "COMMUNICATION",
    items: [
      {
        title: "Announcements",
        href: "/announcement",
        icon: Megaphone,
      },
      {
        title: "Notifications",
        href: "/notification",
        icon: Bell,
      },
      {
        title: "Messages",
        href: "/message",
        icon: MessageSquare,
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