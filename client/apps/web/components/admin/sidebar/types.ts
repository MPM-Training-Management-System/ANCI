import React from "react";
import { LucideIcon } from "lucide-react";

export interface SidebarItemType {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

export interface SidebarSectionType {
  title: string;
  items: SidebarItemType[];
}

/* =========================================
   SIDEBAR
   ========================================= */

export interface SidebarProps {
  // Desktop sidebar
  collapsed: boolean;

  // Mobile sidebar
  mobileOpen: boolean;

  // Mobile sidebar controller
  setMobileOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

/* =========================================
   SIDEBAR HEADER
   ========================================= */

export interface SidebarHeaderProps {
  collapsed: boolean;

  mobileOpen?: boolean;

  setMobileOpen?: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

/* =========================================
   SIDEBAR MENU
   ========================================= */

export interface SidebarMenuProps {
  collapsed: boolean;
}

/* =========================================
   SIDEBAR ITEM
   ========================================= */

export interface SidebarItemProps {
  item: SidebarItemType;
  collapsed: boolean;
}

/* =========================================
   SIDEBAR FOOTER
   ========================================= */

export interface SidebarFooterProps {
  collapsed: boolean;
}