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
        title: "User Management",
        href: "/dashboard/users",
        icon: Users,
      },
      {
        title: "Service Management",
        href: "/dashboard/services",
        icon: BriefcaseBusiness,
      },
      {
        title: "Training Programs",
        href: "/dashboard/trainings",
        icon: GraduationCap,
      },
      {
        title: "Participant Hub",
        href: "/dashboard/participants",
        icon: UserRound,
      },
      {
        title: "Exam Center",
        href: "/dashboard/exams",
        icon: ClipboardCheck,
      },
      {
        title: "Learning Materials",
        href: "/dashboard/materials",
        icon: BookOpen,
      },
      {
        title: "Schedules",
        href: "/dashboard/schedules",
        icon: CalendarDays,
      },
    ],
  },

  {
    title: "REPORTS",
    items: [
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileBarChart2,
      },
    ],
  },

  {
    title: "COMMUNICATION",
    items: [
      {
        title: "Announcements",
        href: "/dashboard/announcements",
        icon: Megaphone,
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
      },
    ],
  },

  {
    title: "SETTINGS",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];