"use client";

import { SidebarProps } from "./types";

import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        bottom-0
        z-50
        flex
        flex-col
        overflow-hidden
        
        bg-primary
        text-white
        shadow-2xl
        transition-all
        duration-300
        ${collapsed ? "w-24" : "w-72"}
      `}
    >
      {/* Header */}
      <SidebarHeader
        collapsed={collapsed}
      />

      {/* Divider */}
      <div className="mx-4 border-b border-white/10" />

      {/* Menu */}
      <SidebarMenu
        collapsed={collapsed}
      />

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Footer */}
      <SidebarFooter
        collapsed={collapsed}
      />
    </aside>
  );
}