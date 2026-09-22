import { LucideIcon } from "lucide-react";



export type SidebarItemType = {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: SidebarItemType[];
};

export type SidebarSectionType = {
  title: string;
  items: SidebarItemType[];
};
export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface SidebarHeaderProps {
  collapsed: boolean;
}

export interface SidebarMenuProps {
  collapsed: boolean;
}

export interface SidebarItemProps {
  item: SidebarItemType;
  collapsed: boolean;
}

export interface SidebarFooterProps {
  collapsed: boolean;
}